/**
 * Drop Service
 * Handle track submissions and CANORA sync
 */

import { prisma } from "./prisma";
import { syncDropToCanora, canora } from "./canora-client";
import type { Drop, DropSource, DropStatus } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

export interface CreateDropInput {
  userId: string;
  title: string;
  artist?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
  source?: DropSource;
  sourceUrl?: string;
  sourceId?: string;
}

export interface DropWithUser extends Drop {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
}

// =============================================================================
// DROP LIFECYCLE
// =============================================================================

/**
 * Create a new drop (track submission)
 */
export async function createDrop(input: CreateDropInput): Promise<Drop> {
  const {
    userId,
    title,
    artist,
    audioUrl,
    coverUrl,
    duration,
    source = "UPLOAD",
    sourceUrl,
    sourceId,
  } = input;

  // Check for duplicate (same source ID or audio URL)
  if (sourceId && source !== "UPLOAD") {
    const existing = await prisma.drop.findFirst({
      where: { sourceId, source },
    });
    if (existing) {
      throw new Error("This track has already been dropped");
    }
  }

  // Create drop
  const drop = await prisma.drop.create({
    data: {
      userId,
      title,
      artist,
      audioUrl,
      coverUrl,
      duration,
      source,
      sourceUrl,
      sourceId,
      status: "PENDING",
    },
  });

  // Drops stay PENDING until curator approval

  // Update user stats
  await prisma.playerProfile.updateMany({
    where: { userId },
    data: {
      totalDrops: { increment: 1 },
      xp: { increment: 25 },
    },
  });

  return drop;
}

/**
 * Approve a drop and sync to CANORA
 */
export async function approveDrop(dropId: string): Promise<Drop> {
  const drop = await prisma.drop.findUnique({
    where: { id: dropId },
  });

  if (!drop) {
    throw new Error("Drop not found");
  }

  // Sync to CANORA
  const canoraWorkId = await syncDropToCanora({
    id: drop.id,
    title: drop.title,
    artist: drop.artist,
    audioUrl: drop.audioUrl,
    userId: drop.userId,
  });

  // Update drop with CANORA info
  const updatedDrop = await prisma.drop.update({
    where: { id: dropId },
    data: {
      status: "APPROVED",
      canoraWorkId,
      syncedAt: canoraWorkId ? new Date() : undefined,
    },
  });

  // Log sync
  await prisma.canoraSyncLog.create({
    data: {
      entityType: "drop",
      entityId: dropId,
      action: "create_work",
      canoraId: canoraWorkId,
      success: !!canoraWorkId,
      error: canoraWorkId ? undefined : "Failed to sync",
    },
  });

  return updatedDrop;
}

/**
 * Reject a drop
 */
export async function rejectDrop(dropId: string, reason?: string): Promise<Drop> {
  return prisma.drop.update({
    where: { id: dropId },
    data: {
      status: "REJECTED",
    },
  });
}

/**
 * Archive a drop
 */
export async function archiveDrop(dropId: string, userId: string): Promise<Drop> {
  const drop = await prisma.drop.findFirst({
    where: { id: dropId, userId },
  });

  if (!drop) {
    throw new Error("Drop not found or not owned by user");
  }

  return prisma.drop.update({
    where: { id: dropId },
    data: { status: "ARCHIVED" },
  });
}

// =============================================================================
// CANORA SYNC
// =============================================================================

/**
 * Sync discovery scores from CANORA
 */
export async function syncDiscoveryScores(dropId: string): Promise<void> {
  const drop = await prisma.drop.findUnique({
    where: { id: dropId },
    select: { canoraWorkId: true },
  });

  if (!drop?.canoraWorkId) {
    return;
  }

  try {
    const status = await canora.getAnalysisStatus(drop.canoraWorkId);

    if (status.signal) {
      await prisma.drop.update({
        where: { id: dropId },
        data: {
          shadowScore: status.signal.shadowScore,
          noveltyScore: status.signal.noveltyScore,
        },
      });
    }
  } catch (error) {
    console.error(`Failed to sync scores for drop ${dropId}:`, error);
  }
}

/**
 * Batch sync discovery scores for all approved drops
 */
export async function batchSyncDiscoveryScores(): Promise<number> {
  const drops = await prisma.drop.findMany({
    where: {
      status: "APPROVED",
      canoraWorkId: { not: null },
    },
    select: { id: true },
  });

  let synced = 0;
  for (const drop of drops) {
    try {
      await syncDiscoveryScores(drop.id);
      synced++;
    } catch {
      // Continue on error
    }
  }

  return synced;
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

/**
 * Get drops by user
 */
export async function getUserDrops(
  userId: string,
  status?: DropStatus
): Promise<Drop[]> {
  return prisma.drop.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get approved drops for battles
 */
export async function getApprovedDrops(
  limit: number = 50,
  excludeUserId?: string
): Promise<DropWithUser[]> {
  return prisma.drop.findMany({
    where: {
      status: "APPROVED",
      ...(excludeUserId && { userId: { not: excludeUserId } }),
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  }) as Promise<DropWithUser[]>;
}

/**
 * Get top drops by win rate
 */
export async function getTopDrops(limit: number = 20): Promise<DropWithUser[]> {
  return prisma.drop.findMany({
    where: {
      status: "APPROVED",
      battleCount: { gte: 3 }, // Minimum battles for ranking
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, username: true },
      },
    },
    orderBy: { winRate: "desc" },
    take: limit,
  }) as Promise<DropWithUser[]>;
}

/**
 * Get drops with high discovery scores (underground gems)
 */
export async function getUndergroundDrops(limit: number = 20): Promise<DropWithUser[]> {
  return prisma.drop.findMany({
    where: {
      status: "APPROVED",
      shadowScore: { gte: 0.6 },
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, username: true },
      },
    },
    orderBy: { shadowScore: "desc" },
    take: limit,
  }) as Promise<DropWithUser[]>;
}

/**
 * Get drop by ID with user
 */
export async function getDropById(dropId: string): Promise<DropWithUser | null> {
  return prisma.drop.findUnique({
    where: { id: dropId },
    include: {
      user: {
        select: { id: true, name: true, image: true, username: true },
      },
    },
  }) as Promise<DropWithUser | null>;
}

/**
 * Search drops
 */
export async function searchDrops(
  query: string,
  limit: number = 20
): Promise<DropWithUser[]> {
  return prisma.drop.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { artist: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  }) as Promise<DropWithUser[]>;
}
