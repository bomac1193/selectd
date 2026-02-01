/**
 * Missions & Reputation Service
 * Daily/weekly challenges and player progression
 */

import { prisma } from "./prisma";
import type {
  Mission,
  MissionProgress,
  MissionType,
  MissionFrequency,
  PlayerProfile,
} from "@prisma/client";

// =============================================================================
// CONSTANTS
// =============================================================================

const XP_PER_LEVEL = 1000;
const MAX_LEVEL = 100;

const REP_WEIGHTS = {
  battleWin: 2,
  battleLoss: -0.5,
  correctVote: 1,
  incorrectVote: -0.25,
  dropApproved: 1.5,
  artistFollowed: 0.5,
};

// =============================================================================
// TYPES
// =============================================================================

export interface MissionWithProgress extends Mission {
  userProgress?: MissionProgress;
}

export interface ReputationUpdate {
  curatorRep?: number;
  fanRep?: number;
  convictionScore?: number;
}

export interface LevelUpResult {
  newLevel: number;
  previousLevel: number;
  leveledUp: boolean;
}

// =============================================================================
// MISSION LIFECYCLE
// =============================================================================

/**
 * Get active missions for a user
 */
export async function getActiveMissions(
  userId: string
): Promise<MissionWithProgress[]> {
  const now = new Date();

  const missions = await prisma.mission.findMany({
    where: {
      active: true,
      activeFrom: { lte: now },
      activeUntil: { gt: now },
    },
    include: {
      progress: {
        where: { userId },
      },
    },
    orderBy: [{ frequency: "asc" }, { createdAt: "desc" }],
  });

  return missions.map((mission) => ({
    ...mission,
    userProgress: mission.progress[0] || undefined,
    progress: undefined,
  })) as MissionWithProgress[];
}

/**
 * Track mission progress for a user action
 */
export async function trackMissionProgress(
  userId: string,
  missionType: MissionType,
  increment: number = 1
): Promise<MissionProgress[]> {
  const now = new Date();

  // Find active missions of this type
  const activeMissions = await prisma.mission.findMany({
    where: {
      type: missionType,
      active: true,
      activeFrom: { lte: now },
      activeUntil: { gt: now },
    },
  });

  const updatedProgress: MissionProgress[] = [];

  for (const mission of activeMissions) {
    // Get or create progress
    let progress = await prisma.missionProgress.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId: mission.id,
        },
      },
    });

    if (!progress) {
      progress = await prisma.missionProgress.create({
        data: {
          userId,
          missionId: mission.id,
          progress: 0,
        },
      });
    }

    // Skip if already completed
    if (progress.completed) {
      continue;
    }

    // Update progress
    const newProgress = Math.min(
      progress.progress + increment,
      mission.targetValue
    );
    const completed = newProgress >= mission.targetValue;

    const updated = await prisma.missionProgress.update({
      where: { id: progress.id },
      data: {
        progress: newProgress,
        completed,
        completedAt: completed ? new Date() : undefined,
      },
    });

    updatedProgress.push(updated);

    // Auto-claim rewards if completed
    if (completed && !progress.completed) {
      await claimMissionReward(userId, mission.id);
    }
  }

  return updatedProgress;
}

/**
 * Claim rewards for a completed mission
 */
export async function claimMissionReward(
  userId: string,
  missionId: string
): Promise<boolean> {
  const progress = await prisma.missionProgress.findUnique({
    where: {
      userId_missionId: { userId, missionId },
    },
    include: { mission: true },
  });

  if (!progress || !progress.completed || progress.rewardClaimed) {
    return false;
  }

  // Mark as claimed
  await prisma.missionProgress.update({
    where: { id: progress.id },
    data: { rewardClaimed: true },
  });

  // Award rewards
  await prisma.playerProfile.updateMany({
    where: { userId },
    data: {
      xp: { increment: progress.mission.xpReward },
      tastePoints: { increment: progress.mission.pointsReward },
    },
  });

  // Check for level up
  await checkLevelUp(userId);

  return true;
}

/**
 * Create daily missions (run by cron)
 */
export async function createDailyMissions(): Promise<Mission[]> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Check if daily missions already exist for today
  const existing = await prisma.mission.findFirst({
    where: {
      frequency: "DAILY",
      activeFrom: { gte: todayStart },
    },
  });

  if (existing) {
    return [];
  }

  // Daily mission templates
  const dailyMissions = [
    {
      title: "Drop It",
      description: "Drop 1 track today",
      type: "DROP_TRACKS" as MissionType,
      targetValue: 1,
      xpReward: 50,
      pointsReward: 25,
    },
    {
      title: "Battle Ready",
      description: "Win 2 battles",
      type: "WIN_BATTLES" as MissionType,
      targetValue: 2,
      xpReward: 100,
      pointsReward: 50,
    },
    {
      title: "Crowd Wisdom",
      description: "Vote in 5 battles",
      type: "VOTE_IN_BATTLES" as MissionType,
      targetValue: 5,
      xpReward: 75,
      pointsReward: 30,
    },
    {
      title: "Taste Maker",
      description: "Get 3 correct votes",
      type: "CORRECT_VOTES" as MissionType,
      targetValue: 3,
      xpReward: 100,
      pointsReward: 40,
    },
  ];

  const created = await Promise.all(
    dailyMissions.map((mission) =>
      prisma.mission.create({
        data: {
          ...mission,
          frequency: "DAILY",
          activeFrom: todayStart,
          activeUntil: tomorrow,
        },
      })
    )
  );

  return created;
}

/**
 * Create weekly missions (run by cron on Monday)
 */
export async function createWeeklyMissions(): Promise<Mission[]> {
  const now = new Date();

  // Get start of week (Monday)
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  // Get end of week (Sunday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Check if weekly missions already exist
  const existing = await prisma.mission.findFirst({
    where: {
      frequency: "WEEKLY",
      activeFrom: { gte: weekStart },
    },
  });

  if (existing) {
    return [];
  }

  // Weekly mission templates
  const weeklyMissions = [
    {
      title: "Curator Grind",
      description: "Drop 5 tracks this week",
      type: "DROP_TRACKS" as MissionType,
      targetValue: 5,
      xpReward: 250,
      pointsReward: 100,
    },
    {
      title: "Battle Champion",
      description: "Win 10 battles this week",
      type: "WIN_BATTLES" as MissionType,
      targetValue: 10,
      xpReward: 500,
      pointsReward: 200,
    },
    {
      title: "Community Voice",
      description: "Vote in 25 battles this week",
      type: "VOTE_IN_BATTLES" as MissionType,
      targetValue: 25,
      xpReward: 300,
      pointsReward: 125,
    },
    {
      title: "Fan Army",
      description: "Follow 3 new artists",
      type: "FOLLOW_ARTISTS" as MissionType,
      targetValue: 3,
      xpReward: 200,
      pointsReward: 75,
    },
    {
      title: "XP Hunter",
      description: "Earn 500 XP this week",
      type: "EARN_XP" as MissionType,
      targetValue: 500,
      xpReward: 200,
      pointsReward: 100,
    },
  ];

  const created = await Promise.all(
    weeklyMissions.map((mission) =>
      prisma.mission.create({
        data: {
          ...mission,
          frequency: "WEEKLY",
          activeFrom: weekStart,
          activeUntil: weekEnd,
        },
      })
    )
  );

  return created;
}

// =============================================================================
// REPUTATION SYSTEM
// =============================================================================

/**
 * Update player reputation based on action
 */
export async function updateReputation(
  userId: string,
  action: keyof typeof REP_WEIGHTS,
  multiplier: number = 1
): Promise<PlayerProfile | null> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return null;
  }

  const delta = REP_WEIGHTS[action] * multiplier;
  const updates: Partial<PlayerProfile> = {};

  // Determine which rep to update based on action
  switch (action) {
    case "battleWin":
    case "battleLoss":
    case "dropApproved":
      updates.curatorRep = clampRep(profile.curatorRep + delta);
      break;
    case "correctVote":
    case "incorrectVote":
      updates.convictionScore = clampRep(profile.convictionScore + delta);
      break;
    case "artistFollowed":
      updates.fanRep = clampRep(profile.fanRep + delta);
      break;
  }

  return prisma.playerProfile.update({
    where: { userId },
    data: updates,
  });
}

/**
 * Recalculate conviction score based on vote history
 */
export async function recalculateConviction(userId: string): Promise<number> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });

  if (!profile || profile.totalVotes === 0) {
    return 50;
  }

  // Conviction = percentage of correct votes, scaled to 0-100
  const correctRate = profile.correctPicks / profile.totalVotes;
  const conviction = 50 + (correctRate - 0.5) * 100;

  await prisma.playerProfile.update({
    where: { userId },
    data: { convictionScore: clampRep(conviction) },
  });

  return clampRep(conviction);
}

/**
 * Calculate curator reputation from battle history
 */
export async function recalculateCuratorRep(userId: string): Promise<number> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });

  if (!profile || profile.totalBattles === 0) {
    return 50;
  }

  // Curator rep based on win rate + total battles
  const winRate = profile.battleWins / profile.totalBattles;
  const battleBonus = Math.min(profile.totalBattles * 0.1, 10);
  const dropBonus = Math.min(profile.totalDrops * 0.5, 15);

  const curatorRep = 50 + (winRate - 0.5) * 50 + battleBonus + dropBonus;

  await prisma.playerProfile.update({
    where: { userId },
    data: { curatorRep: clampRep(curatorRep) },
  });

  return clampRep(curatorRep);
}

// =============================================================================
// LEVELING SYSTEM
// =============================================================================

/**
 * Check and apply level up
 */
export async function checkLevelUp(userId: string): Promise<LevelUpResult> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return { newLevel: 1, previousLevel: 1, leveledUp: false };
  }

  const calculatedLevel = Math.min(
    Math.floor(profile.xp / XP_PER_LEVEL) + 1,
    MAX_LEVEL
  );

  if (calculatedLevel > profile.level) {
    await prisma.playerProfile.update({
      where: { userId },
      data: { level: calculatedLevel },
    });

    return {
      newLevel: calculatedLevel,
      previousLevel: profile.level,
      leveledUp: true,
    };
  }

  return {
    newLevel: profile.level,
    previousLevel: profile.level,
    leveledUp: false,
  };
}

/**
 * Get XP required for next level
 */
export function getXpForNextLevel(currentLevel: number): number {
  return currentLevel * XP_PER_LEVEL;
}

/**
 * Get level progress (0-1)
 */
export function getLevelProgress(xp: number, level: number): number {
  const levelStartXp = (level - 1) * XP_PER_LEVEL;
  const levelXp = xp - levelStartXp;
  return Math.min(levelXp / XP_PER_LEVEL, 1);
}

// =============================================================================
// TASTE PROFILE
// =============================================================================

/**
 * Update taste profile from CANORA emotion data
 */
export async function updateTasteProfile(
  userId: string,
  emotions: {
    ecstatic?: number | null;
    yearning?: number | null;
    corrupted?: number | null;
    lucid?: number | null;
    divine?: number | null;
    feral?: number | null;
  },
  weight: number = 0.1
): Promise<PlayerProfile | null> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return null;
  }

  // Exponential moving average for taste profile
  const blend = (
    current?: number | null,
    incoming?: number | null
  ): number | null => {
    if (incoming === null || incoming === undefined) return current ?? null;
    if (current === null || current === undefined) return incoming ?? null;
    return current * (1 - weight) + incoming * weight;
  };

  return prisma.playerProfile.update({
    where: { userId },
    data: {
      tasteEcstatic: blend(profile.tasteEcstatic, emotions.ecstatic),
      tasteYearning: blend(profile.tasteYearning, emotions.yearning),
      tasteCorrupted: blend(profile.tasteCorrupted, emotions.corrupted),
      tasteLucid: blend(profile.tasteLucid, emotions.lucid),
      tasteDivine: blend(profile.tasteDivine, emotions.divine),
      tasteFeral: blend(profile.tasteFeral, emotions.feral),
    },
  });
}

// =============================================================================
// STREAK TRACKING
// =============================================================================

/**
 * Update login streak
 */
export async function updateLoginStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  newRecord: boolean;
}> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return { currentStreak: 0, longestStreak: 0, newRecord: false };
  }

  const now = new Date();
  const lastUpdate = profile.updatedAt;
  const daysSinceUpdate = Math.floor(
    (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = profile.currentStreak;

  if (daysSinceUpdate === 0) {
    // Same day, no change
    return {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      newRecord: false,
    };
  } else if (daysSinceUpdate === 1) {
    // Consecutive day
    newStreak = profile.currentStreak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, profile.longestStreak);
  const newRecord = newLongest > profile.longestStreak;

  await prisma.playerProfile.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
    },
  });

  // Track login streak mission
  await trackMissionProgress(userId, "LOGIN_STREAK", 1);

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    newRecord,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function clampRep(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Ensure player profile exists
 */
export async function ensurePlayerProfile(userId: string): Promise<PlayerProfile> {
  let profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    profile = await prisma.playerProfile.create({
      data: {
        userId,
        preferredMode: "CURATOR",
      },
    });
  }

  return profile;
}

/**
 * Get player stats summary
 */
export async function getPlayerStats(userId: string): Promise<{
  profile: PlayerProfile | null;
  activeMissions: MissionWithProgress[];
  levelProgress: number;
  xpToNextLevel: number;
}> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  });

  const activeMissions = await getActiveMissions(userId);

  return {
    profile,
    activeMissions,
    levelProgress: profile ? getLevelProgress(profile.xp, profile.level) : 0,
    xpToNextLevel: profile ? getXpForNextLevel(profile.level) : XP_PER_LEVEL,
  };
}
