/**
 * CANORA Client SDK
 * HTTP client for communicating with CANORA API
 *
 * Features:
 * - Create works (drops → JAM)
 * - Send signals (votes, battles, wins)
 * - Fetch discovery data
 * - Sync CTAD metadata
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CANORA_API_URL = process.env.CANORA_API_URL || "http://localhost:3001";
const CANORA_API_KEY = process.env.CANORA_API_KEY || "";

// =============================================================================
// TYPES
// =============================================================================

export interface CanoraWork {
  id: string;
  slug: string;
  title: string;
  status: "JAM" | "PLATE" | "CANON";
  audioUrl: string | null;
  ctadId: string | null;
  createdAt: string;
}

export interface CanoraCreateWorkInput {
  title: string;
  audioUrl: string;
  description?: string;
  contributions?: Array<{
    role: string;
    displayName: string;
    userId?: string;
  }>;
  ai?: {
    involved: boolean;
    platform?: string;
  };
  metadata?: {
    genre?: string;
    tags?: string[];
  };
}

export interface CanoraSignal {
  signalType: "vote" | "drop" | "battle_win" | "battle_loss" | "mission_complete";
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface CanoraDiscoverQuery {
  emotion?: {
    ecstatic?: number;
    yearning?: number;
    corrupted?: number;
    lucid?: number;
    divine?: number;
    feral?: number;
  };
  bpmRange?: [number, number];
  keys?: string[];
  shadowBias?: boolean;
  noveltyBias?: boolean;
  mode?: "surface" | "latent" | "shadow";
  limit?: number;
  offset?: number;
}

export interface CanoraDiscoverResult {
  work: CanoraWork;
  score: number;
  signal: {
    shadowScore: number;
    noveltyScore: number;
    bpm: number | null;
    key: string | null;
    energy: number | null;
    emotion: {
      ecstatic: number | null;
      yearning: number | null;
      corrupted: number | null;
      lucid: number | null;
      divine: number | null;
      feral: number | null;
    };
  };
  explanation: string[];
}

export interface CanoraAnalysisStatus {
  workId: string;
  status: string;
  signal?: {
    shadowScore: number;
    noveltyScore: number;
    bpm: number | null;
    key: string | null;
    hasEmbedding: boolean;
  };
}

// =============================================================================
// CLIENT CLASS
// =============================================================================

class CanoraClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = CANORA_API_URL, apiKey: string = CANORA_API_KEY) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new CanoraError(
        `CANORA API error: ${response.status} ${response.statusText}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  // ===========================================================================
  // WORKS
  // ===========================================================================

  /**
   * Create a new work in CANORA (as JAM)
   */
  async createWork(input: CanoraCreateWorkInput): Promise<{
    id: string;
    slug: string;
    status: string;
    ctadId: string;
    createdAt: string;
  }> {
    return this.fetch("/api/v1/works", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  /**
   * Get a work by ID
   */
  async getWork(workId: string): Promise<{
    work: CanoraWork;
    ctad: Record<string, unknown>;
    contributions: Array<{
      role: string;
      displayName: string;
    }>;
  }> {
    return this.fetch(`/api/v1/works/${workId}`);
  }

  /**
   * List works
   */
  async listWorks(options?: {
    status?: "JAM" | "PLATE" | "CANON";
    limit?: number;
    cursor?: string;
  }): Promise<{
    works: CanoraWork[];
    nextCursor: string | null;
    total: number;
  }> {
    const params = new URLSearchParams();
    if (options?.status) params.set("status", options.status);
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.cursor) params.set("cursor", options.cursor);

    return this.fetch(`/api/v1/works?${params.toString()}`);
  }

  // ===========================================================================
  // SIGNALS
  // ===========================================================================

  /**
   * Send a signal to CANORA for a work
   * Used to report votes, battles, wins, etc.
   */
  async sendSignal(workId: string, signal: CanoraSignal): Promise<{
    success: boolean;
    signalId: string;
  }> {
    return this.fetch(`/api/v1/works/${workId}/signal`, {
      method: "POST",
      body: JSON.stringify(signal),
    });
  }

  /**
   * Batch send signals for multiple works
   */
  async sendSignalsBatch(
    signals: Array<{ workId: string; signal: CanoraSignal }>
  ): Promise<{
    success: boolean;
    results: Array<{ workId: string; signalId: string }>;
  }> {
    // CANORA doesn't have a batch endpoint yet, so we send sequentially
    const results = await Promise.all(
      signals.map(async ({ workId, signal }) => {
        try {
          const result = await this.sendSignal(workId, signal);
          return { workId, signalId: result.signalId };
        } catch {
          return { workId, signalId: "" };
        }
      })
    );

    return {
      success: results.every((r) => r.signalId !== ""),
      results,
    };
  }

  // ===========================================================================
  // DISCOVERY
  // ===========================================================================

  /**
   * Search for works using discovery engine
   */
  async discover(query: CanoraDiscoverQuery): Promise<{
    results: CanoraDiscoverResult[];
    query: CanoraDiscoverQuery;
  }> {
    return this.fetch("/api/v1/discover", {
      method: "POST",
      body: JSON.stringify(query),
    });
  }

  /**
   * Find similar works
   */
  async findSimilar(workId: string, limit: number = 10): Promise<{
    sourceWorkId: string;
    results: Array<{
      work: CanoraWork;
      similarity: number;
      score: number;
    }>;
  }> {
    return this.fetch(`/api/v1/discover/similar/${workId}?limit=${limit}`);
  }

  /**
   * Shadow dive - find underground tracks
   */
  async shadowDive(options?: {
    limit?: number;
    maxPlays?: number;
  }): Promise<{
    results: Array<{
      work: CanoraWork;
      shadowScore: number;
      noveltyScore: number;
      playCount: number;
    }>;
  }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.maxPlays) params.set("maxPlays", options.maxPlays.toString());

    return this.fetch(`/api/v1/discover/shadow-dive?${params.toString()}`);
  }

  /**
   * Get vibe map coordinates
   */
  async getVibeMap(): Promise<{
    coordinates: Array<{
      workId: string;
      title: string;
      x: number;
      y: number;
      shadowScore: number;
      noveltyScore: number;
    }>;
    count: number;
  }> {
    return this.fetch("/api/v1/discover/vibe-map");
  }

  // ===========================================================================
  // ANALYSIS
  // ===========================================================================

  /**
   * Trigger audio analysis for a work
   */
  async triggerAnalysis(workId: string): Promise<{
    status: string;
    workId: string;
    message: string;
  }> {
    return this.fetch(`/api/v1/analyze/${workId}`, {
      method: "POST",
    });
  }

  /**
   * Get analysis status for a work
   */
  async getAnalysisStatus(workId: string): Promise<CanoraAnalysisStatus> {
    return this.fetch(`/api/v1/analyze/${workId}`);
  }

  // ===========================================================================
  // HEALTH
  // ===========================================================================

  /**
   * Check if CANORA API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try to list works - if it works, API is available
      await this.listWorks({ limit: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// ERROR CLASS
// =============================================================================

export class CanoraError extends Error {
  status: number;
  details: string;

  constructor(message: string, status: number, details: string) {
    super(message);
    this.name = "CanoraError";
    this.status = status;
    this.details = details;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const canora = new CanoraClient();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Sync a SELECTD drop to CANORA as a JAM work
 */
export async function syncDropToCanora(drop: {
  id: string;
  title: string;
  artist: string | null;
  audioUrl: string;
  userId: string;
}): Promise<string | null> {
  try {
    const result = await canora.createWork({
      title: drop.title,
      audioUrl: drop.audioUrl,
      contributions: drop.artist
        ? [{ role: "SOUND", displayName: drop.artist }]
        : [{ role: "SOUND", displayName: "Unknown Artist" }],
      metadata: {
        tags: ["selectd", "drop"],
      },
    });

    // Trigger analysis
    await canora.triggerAnalysis(result.id);

    return result.id;
  } catch (error) {
    console.error("Failed to sync drop to CANORA:", error);
    return null;
  }
}

/**
 * Send battle result signals to CANORA
 */
export async function sendBattleSignals(battle: {
  winnerId: string;
  loserId: string;
  winnerCanoraWorkId: string | null;
  loserCanoraWorkId: string | null;
  totalVotes: number;
}): Promise<void> {
  const signals: Array<{ workId: string; signal: CanoraSignal }> = [];

  if (battle.winnerCanoraWorkId) {
    signals.push({
      workId: battle.winnerCanoraWorkId,
      signal: {
        signalType: "battle_win",
        userId: battle.winnerId,
        metadata: { totalVotes: battle.totalVotes },
      },
    });
  }

  if (battle.loserCanoraWorkId) {
    signals.push({
      workId: battle.loserCanoraWorkId,
      signal: {
        signalType: "battle_loss",
        userId: battle.loserId,
        metadata: { totalVotes: battle.totalVotes },
      },
    });
  }

  if (signals.length > 0) {
    await canora.sendSignalsBatch(signals);
  }
}

/**
 * Send vote signal to CANORA
 */
export async function sendVoteSignal(
  canoraWorkId: string,
  voterId: string
): Promise<void> {
  try {
    await canora.sendSignal(canoraWorkId, {
      signalType: "vote",
      userId: voterId,
    });
  } catch (error) {
    console.error("Failed to send vote signal to CANORA:", error);
  }
}
