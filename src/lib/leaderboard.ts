/**
 * Leaderboard Service
 * Rankings, snapshots, and player comparisons
 */

import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import type { LeaderboardType, LeaderboardSnapshot } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

export interface LeaderboardEntry {
  userId: string;
  rank: number;
  score: number;
  username: string | null;
  name: string | null;
  image: string | null;
  change?: number; // Rank change from previous snapshot
}

export interface LeaderboardResult {
  type: LeaderboardType;
  period: string;
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
  total: number;
  updatedAt: Date;
}

// =============================================================================
// LEADERBOARD QUERIES
// =============================================================================

/**
 * Get live leaderboard by type
 */
export async function getLeaderboard(
  type: LeaderboardType,
  limit: number = 50,
  userId?: string
): Promise<LeaderboardResult> {
  const orderByField = getOrderByField(type);

  const profiles = await prisma.playerProfile.findMany({
    where: getWhereClause(type),
    orderBy: { [orderByField]: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, username: true, name: true, image: true },
      },
    },
  });

  const entries: LeaderboardEntry[] = profiles.map((profile, index) => ({
    userId: profile.userId,
    rank: index + 1,
    score: getScoreValue(profile, type),
    username: profile.user.username,
    name: profile.user.name,
    image: profile.user.image,
  }));

  // Get user's rank if not in top entries
  let userRank: LeaderboardEntry | undefined;
  if (userId) {
    const userEntry = entries.find((e) => e.userId === userId);
    if (userEntry) {
      userRank = userEntry;
    } else {
      userRank = await getUserRank(userId, type);
    }
  }

  const total = await prisma.playerProfile.count({
    where: getWhereClause(type),
  });

  return {
    type,
    period: "all-time",
    entries,
    userRank,
    total,
    updatedAt: new Date(),
  };
}

/**
 * Get user's rank in a specific leaderboard
 */
async function getUserRank(
  userId: string,
  type: LeaderboardType
): Promise<LeaderboardEntry | undefined> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, username: true, name: true, image: true },
      },
    },
  });

  if (!profile) return undefined;

  const score = getScoreValue(profile, type);
  const orderByField = getOrderByField(type);

  // Count how many are ahead
  const ahead = await prisma.playerProfile.count({
    where: {
      ...getWhereClause(type),
      [orderByField]: { gt: score },
    },
  });

  return {
    userId: profile.userId,
    rank: ahead + 1,
    score,
    username: profile.user.username,
    name: profile.user.name,
    image: profile.user.image,
  };
}

/**
 * Get multiple leaderboards at once
 */
export async function getMultipleLeaderboards(
  types: LeaderboardType[],
  limit: number = 10,
  userId?: string
): Promise<Record<LeaderboardType, LeaderboardResult>> {
  const results: Partial<Record<LeaderboardType, LeaderboardResult>> = {};

  await Promise.all(
    types.map(async (type) => {
      results[type] = await getLeaderboard(type, limit, userId);
    })
  );

  return results as Record<LeaderboardType, LeaderboardResult>;
}

// =============================================================================
// SNAPSHOTS
// =============================================================================

/**
 * Create a snapshot of current leaderboard state
 */
export async function createLeaderboardSnapshot(
  type: LeaderboardType,
  period: string = "daily"
): Promise<LeaderboardSnapshot> {
  const leaderboard = await getLeaderboard(type, 100);

  return prisma.leaderboardSnapshot.create({
    data: {
      type,
      period,
      rankings: leaderboard.entries as unknown as Prisma.JsonArray,
    },
  });
}

/**
 * Get the most recent snapshot for comparison
 */
export async function getLatestSnapshot(
  type: LeaderboardType,
  period: string = "daily"
): Promise<LeaderboardSnapshot | null> {
  return prisma.leaderboardSnapshot.findFirst({
    where: { type, period },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get leaderboard with rank changes from previous snapshot
 */
export async function getLeaderboardWithChanges(
  type: LeaderboardType,
  limit: number = 50,
  userId?: string
): Promise<LeaderboardResult> {
  const current = await getLeaderboard(type, limit, userId);
  const previousSnapshot = await getLatestSnapshot(type);

  if (previousSnapshot && Array.isArray(previousSnapshot.rankings)) {
    const previousRankings =
      previousSnapshot.rankings as unknown as LeaderboardEntry[];
    const previousMap = new Map(
      previousRankings.map((e) => [e.userId, e.rank])
    );

    current.entries = current.entries.map((entry) => {
      const previousRank = previousMap.get(entry.userId);
      return {
        ...entry,
        change: previousRank ? previousRank - entry.rank : undefined,
      };
    });

    if (current.userRank) {
      const previousUserRank = previousMap.get(current.userRank.userId);
      current.userRank.change = previousUserRank
        ? previousUserRank - current.userRank.rank
        : undefined;
    }
  }

  return current;
}

/**
 * Create all daily snapshots (run by cron)
 */
export async function createDailySnapshots(): Promise<void> {
  const types: LeaderboardType[] = [
    "CURATOR_REP",
    "FAN_REP",
    "WIN_RATE",
    "CONVICTION",
    "XP",
    "TASTE_POINTS",
  ];

  await Promise.all(
    types.map((type) => createLeaderboardSnapshot(type, "daily"))
  );
}

/**
 * Create weekly snapshots (run by cron)
 */
export async function createWeeklySnapshots(): Promise<void> {
  const types: LeaderboardType[] = [
    "CURATOR_REP",
    "FAN_REP",
    "WIN_RATE",
    "CONVICTION",
    "XP",
    "TASTE_POINTS",
  ];

  await Promise.all(
    types.map((type) => createLeaderboardSnapshot(type, "weekly"))
  );
}

// =============================================================================
// TRACK LEADERBOARDS
// =============================================================================

/**
 * Get top tracks by win rate
 */
export async function getTopTracks(limit: number = 20): Promise<{
  tracks: Array<{
    id: string;
    title: string;
    artist: string | null;
    coverUrl: string | null;
    winRate: number;
    battleCount: number;
    user: { id: string; username: string | null; image: string | null };
  }>;
}> {
  const tracks = await prisma.drop.findMany({
    where: {
      status: "APPROVED",
      battleCount: { gte: 3 },
    },
    orderBy: { winRate: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, username: true, image: true },
      },
    },
  });

  return {
    tracks: tracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      coverUrl: t.coverUrl,
      winRate: t.winRate,
      battleCount: t.battleCount,
      user: t.user,
    })),
  };
}

/**
 * Get most battled tracks
 */
export async function getMostBattledTracks(limit: number = 20): Promise<{
  tracks: Array<{
    id: string;
    title: string;
    artist: string | null;
    coverUrl: string | null;
    battleCount: number;
    winCount: number;
    user: { id: string; username: string | null; image: string | null };
  }>;
}> {
  const tracks = await prisma.drop.findMany({
    where: {
      status: "APPROVED",
      battleCount: { gt: 0 },
    },
    orderBy: { battleCount: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, username: true, image: true },
      },
    },
  });

  return {
    tracks: tracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      coverUrl: t.coverUrl,
      battleCount: t.battleCount,
      winCount: t.winCount,
      user: t.user,
    })),
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getOrderByField(type: LeaderboardType): string {
  switch (type) {
    case "CURATOR_REP":
      return "curatorRep";
    case "FAN_REP":
      return "fanRep";
    case "WIN_RATE":
      return "battleWins";
    case "CONVICTION":
      return "convictionScore";
    case "XP":
      return "xp";
    case "TASTE_POINTS":
      return "tastePoints";
    default:
      return "xp";
  }
}

function getWhereClause(type: LeaderboardType): Record<string, unknown> {
  switch (type) {
    case "WIN_RATE":
      return { totalBattles: { gte: 3 } };
    case "CONVICTION":
      return { totalVotes: { gte: 5 } };
    default:
      return {};
  }
}

function getScoreValue(
  profile: {
    curatorRep: number;
    fanRep: number;
    convictionScore: number;
    xp: number;
    tastePoints: number;
    battleWins: number;
    totalBattles: number;
  },
  type: LeaderboardType
): number {
  switch (type) {
    case "CURATOR_REP":
      return profile.curatorRep;
    case "FAN_REP":
      return profile.fanRep;
    case "WIN_RATE":
      return profile.totalBattles > 0
        ? (profile.battleWins / profile.totalBattles) * 100
        : 0;
    case "CONVICTION":
      return profile.convictionScore;
    case "XP":
      return profile.xp;
    case "TASTE_POINTS":
      return profile.tastePoints;
    default:
      return 0;
  }
}
