/**
 * SELECTD Library Exports
 * Core game mechanics and services
 */

// Database
export { prisma } from "./prisma";

// Authentication
export { auth, signIn, signOut, getCurrentUserId, requireAuth } from "./auth";

// CANORA Integration
export {
  canora,
  syncDropToCanora,
  sendBattleSignals,
  sendVoteSignal,
  CanoraError,
} from "./canora-client";
export type {
  CanoraWork,
  CanoraCreateWorkInput,
  CanoraSignal,
  CanoraDiscoverQuery,
  CanoraDiscoverResult,
} from "./canora-client";

// Battle Mechanics
export {
  createBattle,
  joinBattle,
  castVote,
  completeBattle,
  getActiveBattles,
  getBattleById,
  getUserBattles,
  processExpiredBattles,
} from "./battle";
export type {
  CreateBattleInput,
  JoinBattleInput,
  CastVoteInput,
  BattleWithDetails,
} from "./battle";

// Drop Service
export {
  createDrop,
  approveDrop,
  rejectDrop,
  archiveDrop,
  syncDiscoveryScores,
  batchSyncDiscoveryScores,
  getUserDrops,
  getApprovedDrops,
  getTopDrops,
  getUndergroundDrops,
  getDropById,
  searchDrops,
} from "./drop";
export type { CreateDropInput, DropWithUser } from "./drop";

// Missions & Reputation
export {
  getActiveMissions,
  trackMissionProgress,
  claimMissionReward,
  createDailyMissions,
  createWeeklyMissions,
  updateReputation,
  recalculateConviction,
  recalculateCuratorRep,
  checkLevelUp,
  getXpForNextLevel,
  getLevelProgress,
  updateTasteProfile,
  updateLoginStreak,
  ensurePlayerProfile,
  getPlayerStats,
} from "./missions";
export type { MissionWithProgress, ReputationUpdate, LevelUpResult } from "./missions";

// Leaderboard
export {
  getLeaderboard,
  getMultipleLeaderboards,
  createLeaderboardSnapshot,
  getLatestSnapshot,
  getLeaderboardWithChanges,
  createDailySnapshots,
  createWeeklySnapshots,
  getTopTracks,
  getMostBattledTracks,
} from "./leaderboard";
export type { LeaderboardEntry, LeaderboardResult } from "./leaderboard";
