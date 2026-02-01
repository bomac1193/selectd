/**
 * Selection Service
 * Core game mechanics for taste selections
 */

import { prisma } from "./prisma";
import { sendBattleSignals, sendVoteSignal } from "./canora-client";
import type { Selection, Drop, Vote, BattleStatus, BattleType, VoteChoice } from "@prisma/client";

// =============================================================================
// CONSTANTS
// =============================================================================

const MATCHING_TIMEOUT_MS = 60 * 1000;      // 60 seconds to find opponent
const SELECTING_TIMEOUT_MS = 30 * 1000;     // 30 seconds to select track
const VOTING_DURATION_MS = 2 * 60 * 1000;   // 2 minutes for voting

// =============================================================================
// TYPES
// =============================================================================

export interface CreateSelectionInput {
  userId: string;
  trackId: string;
  battleType?: BattleType;
}

export interface JoinSelectionInput {
  selectionId: string;
  userId: string;
  trackId: string;
}

export interface CastVoteInput {
  selectionId: string;
  voterId: string;
  votedFor: VoteChoice;
  conviction?: number;
}

export interface SelectionWithDetails extends Selection {
  player1: { id: string; name: string | null; image: string | null };
  player2: { id: string; name: string | null; image: string | null } | null;
  track1: Drop;
  track2: Drop | null;
  votes: Vote[];
  _count: { votes: number };
}

// =============================================================================
// BATTLE LIFECYCLE
// =============================================================================

/**
 * Create a new battle and start matchmaking
 */
export async function createSelection(input: CreateSelectionInput): Promise<Battle> {
  const { userId, trackId, battleType = "CURATOR_VS_CURATOR" } = input;

  // Verify track belongs to user and is approved
  const track = await prisma.drop.findFirst({
    where: {
      id: trackId,
      userId,
      status: "APPROVED",
    },
  });

  if (!track) {
    throw new Error("Track not found or not approved");
  }

  // Check if user is already in an active battle
  const activeSelection = await prisma.selection.findFirst({
    where: {
      OR: [
        { player1Id: userId, status: { in: ["MATCHING", "SELECTING", "PLAYING", "VOTING"] } },
        { player2Id: userId, status: { in: ["MATCHING", "SELECTING", "PLAYING", "VOTING"] } },
      ],
    },
  });

  if (activeBattle) {
    throw new Error("Already in an active battle");
  }

  // Try to find an existing battle waiting for opponent
  const waitingSelection = await prisma.selection.findFirst({
    where: {
      status: "MATCHING",
      player2Id: null,
      player1Id: { not: userId },
      battleType,
      matchingEndsAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
  });

  if (waitingBattle) {
    // Join existing battle
    return joinSelection({
      selectionId: waitingBattle.id,
      userId,
      trackId,
    });
  }

  // Create new battle
  const battle = await prisma.selection.create({
    data: {
      player1Id: userId,
      track1Id: trackId,
      battleType,
      status: "MATCHING",
      matchingEndsAt: new Date(Date.now() + MATCHING_TIMEOUT_MS),
    },
  });

  return battle;
}

/**
 * Join an existing battle as player 2
 */
export async function joinSelection(input: JoinSelectionInput): Promise<Battle> {
  const { selectionId, userId, trackId } = input;

  // Verify track belongs to user and is approved
  const track = await prisma.drop.findFirst({
    where: {
      id: trackId,
      userId,
      status: "APPROVED",
    },
  });

  if (!track) {
    throw new Error("Track not found or not approved");
  }

  // Update battle with player 2 and transition to voting
  const battle = await prisma.selection.update({
    where: {
      id: selectionId,
      status: "MATCHING",
      player2Id: null,
    },
    data: {
      player2Id: userId,
      track2Id: trackId,
      status: "VOTING",
      votingEndsAt: new Date(Date.now() + VOTING_DURATION_MS),
    },
  });

  // Update track battle counts
  await prisma.drop.updateMany({
    where: { id: { in: [selection.track1Id, trackId] } },
    data: { battleCount: { increment: 1 } },
  });

  return battle;
}

/**
 * Cast a vote in a battle
 */
export async function castVote(input: CastVoteInput): Promise<Vote> {
  const { selectionId, voterId, votedFor, conviction = 50 } = input;

  // Get battle
  const battle = await prisma.selection.findUnique({
    where: { id: selectionId },
    include: { track1: true, track2: true },
  });

  if (!battle) {
    throw new Error("Selection not found");
  }

  if (selection.status !== "VOTING") {
    throw new Error("Selection is not in voting phase");
  }

  if (selection.votingEndsAt && new Date() > selection.votingEndsAt) {
    throw new Error("Voting has ended");
  }

  // Can't vote in your own battle
  if (selection.player1Id === voterId || selection.player2Id === voterId) {
    throw new Error("Cannot vote in your own battle");
  }

  // Create vote
  const vote = await prisma.vote.create({
    data: {
      selectionId,
      voterId,
      votedFor,
      conviction,
    },
  });

  // Update vote counts
  const updateField = votedFor === "TRACK_1" ? "player1Votes" : "player2Votes";
  await prisma.selection.update({
    where: { id: selectionId },
    data: {
      [updateField]: { increment: 1 },
      totalVotes: { increment: 1 },
    },
  });

  // Send signal to CANORA
  const votedTrack = votedFor === "TRACK_1" ? selection.track1 : selection.track2;
  if (votedTrack?.canoraWorkId) {
    await sendVoteSignal(votedTrack.canoraWorkId, voterId);
  }

  // Update voter stats
  await prisma.playerProfile.updateMany({
    where: { userId: voterId },
    data: { totalVotes: { increment: 1 } },
  });

  return vote;
}

/**
 * Complete a battle and determine winner
 */
export async function completeBattle(selectionId: string): Promise<Battle> {
  const battle = await prisma.selection.findUnique({
    where: { id: selectionId },
    include: {
      track1: true,
      track2: true,
      votes: true,
    },
  });

  if (!battle) {
    throw new Error("Selection not found");
  }

  if (selection.status !== "VOTING") {
    throw new Error("Selection is not in voting phase");
  }

  // Determine winner
  let winnerId: string | null = null;
  let winnerTrackId: string | null = null;

  if (selection.player1Votes > selection.player2Votes) {
    winnerId = selection.player1Id;
    winnerTrackId = selection.track1Id;
  } else if (selection.player2Votes > selection.player1Votes) {
    winnerId = selection.player2Id;
    winnerTrackId = selection.track2Id;
  }
  // If tied, no winner

  // Update battle
  const completedSelection = await prisma.selection.update({
    where: { id: selectionId },
    data: {
      status: "COMPLETED",
      winnerId,
      winnerTrackId,
      completedAt: new Date(),
    },
  });

  // Update player stats
  if (winnerId && selection.player2Id) {
    const loserId = winnerId === selection.player1Id ? selection.player2Id : selection.player1Id;

    // Winner stats
    await prisma.playerProfile.updateMany({
      where: { userId: winnerId },
      data: {
        totalBattles: { increment: 1 },
        battleWins: { increment: 1 },
        xp: { increment: 100 },
        tastePoints: { increment: 50 },
        currentStreak: { increment: 1 },
      },
    });

    // Loser stats
    await prisma.playerProfile.updateMany({
      where: { userId: loserId },
      data: {
        totalBattles: { increment: 1 },
        xp: { increment: 25 },
        currentStreak: 0,
      },
    });

    // Update track win counts
    if (winnerTrackId) {
      await prisma.drop.update({
        where: { id: winnerTrackId },
        data: {
          winCount: { increment: 1 },
        },
      });
    }

    // Calculate win rates for both tracks
    await updateTrackWinRate(selection.track1Id);
    if (selection.track2Id) {
      await updateTrackWinRate(selection.track2Id);
    }

    // Update vote correctness
    await updateVoteCorrectness(selectionId, winnerTrackId);

    // Send signals to CANORA
    await sendBattleSignals({
      winnerId,
      loserId,
      winnerCanoraWorkId: winnerTrackId === selection.track1Id
        ? selection.track1?.canoraWorkId ?? null
        : selection.track2?.canoraWorkId ?? null,
      loserCanoraWorkId: winnerTrackId === selection.track1Id
        ? selection.track2?.canoraWorkId ?? null
        : selection.track1?.canoraWorkId ?? null,
      totalVotes: selection.totalVotes,
    });

    // Mark CANORA signal sent
    await prisma.selection.update({
      where: { id: selectionId },
      data: { canoraSignalSent: true },
    });
  }

  return completedBattle;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function updateTrackWinRate(trackId: string): Promise<void> {
  const track = await prisma.drop.findUnique({
    where: { id: trackId },
    select: { battleCount: true, winCount: true },
  });

  if (track && track.battleCount > 0) {
    const winRate = (track.winCount / track.battleCount) * 100;
    await prisma.drop.update({
      where: { id: trackId },
      data: { winRate },
    });
  }
}

async function updateVoteCorrectness(
  selectionId: string,
  winnerTrackId: string | null
): Promise<void> {
  if (!winnerTrackId) return;

  const winnerChoice: VoteChoice = winnerTrackId === (await prisma.selection.findUnique({
    where: { id: selectionId },
    select: { track1Id: true },
  }))?.track1Id ? "TRACK_1" : "TRACK_2";

  // Mark correct votes
  await prisma.vote.updateMany({
    where: { selectionId, votedFor: winnerChoice },
    data: { correct: true },
  });

  // Mark incorrect votes
  await prisma.vote.updateMany({
    where: { selectionId, votedFor: { not: winnerChoice } },
    data: { correct: false },
  });

  // Update voter stats for correct picks
  const correctVotes = await prisma.vote.findMany({
    where: { selectionId, correct: true },
    select: { voterId: true },
  });

  for (const vote of correctVotes) {
    await prisma.playerProfile.updateMany({
      where: { userId: vote.voterId },
      data: { correctPicks: { increment: 1 } },
    });
  }
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

/**
 * Get active battles for voting
 */
export async function getActiveSelections(limit: number = 10): Promise<SelectionWithDetails[]> {
  return prisma.selection.findMany({
    where: {
      status: "VOTING",
      votingEndsAt: { gt: new Date() },
    },
    include: {
      player1: { select: { id: true, name: true, image: true } },
      player2: { select: { id: true, name: true, image: true } },
      track1: true,
      track2: true,
      votes: true,
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  }) as Promise<SelectionWithDetails[]>;
}

/**
 * Get battle by ID with full details
 */
export async function getSelectionById(selectionId: string): Promise<SelectionWithDetails | null> {
  return prisma.selection.findUnique({
    where: { id: selectionId },
    include: {
      player1: { select: { id: true, name: true, image: true } },
      player2: { select: { id: true, name: true, image: true } },
      track1: true,
      track2: true,
      votes: true,
      _count: { select: { votes: true } },
    },
  }) as Promise<SelectionWithDetails | null>;
}

/**
 * Get user's battle history
 */
export async function getUserSelections(
  userId: string,
  limit: number = 20
): Promise<SelectionWithDetails[]> {
  return prisma.selection.findMany({
    where: {
      OR: [{ player1Id: userId }, { player2Id: userId }],
      status: "COMPLETED",
    },
    include: {
      player1: { select: { id: true, name: true, image: true } },
      player2: { select: { id: true, name: true, image: true } },
      track1: true,
      track2: true,
      votes: true,
      _count: { select: { votes: true } },
    },
    orderBy: { completedAt: "desc" },
    take: limit,
  }) as Promise<SelectionWithDetails[]>;
}

/**
 * Process expired battles
 * Called by cron job to clean up stale battles
 */
export async function processExpiredBattles(): Promise<number> {
  const now = new Date();

  // Cancel expired matching battles
  const cancelledMatching = await prisma.selection.updateMany({
    where: {
      status: "MATCHING",
      matchingEndsAt: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  // Complete expired voting battles
  const expiredVoting = await prisma.selection.findMany({
    where: {
      status: "VOTING",
      votingEndsAt: { lt: now },
    },
    select: { id: true },
  });

  for (const battle of expiredVoting) {
    try {
      await completeBattle(selection.id);
    } catch (error) {
      console.error(`Failed to complete battle ${selection.id}:`, error);
    }
  }

  return cancelledMatching.count + expiredVoting.length;
}
