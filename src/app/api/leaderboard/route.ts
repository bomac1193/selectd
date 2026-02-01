/**
 * Leaderboard API Routes
 * GET /api/leaderboard - Get leaderboard by type
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import {
  getLeaderboardWithChanges,
  getMultipleLeaderboards,
  getTopTracks,
} from "@/lib/leaderboard";
import type { LeaderboardType } from "@prisma/client";

const VALID_TYPES: LeaderboardType[] = [
  "CURATOR_REP",
  "FAN_REP",
  "WIN_RATE",
  "CONVICTION",
  "XP",
  "TASTE_POINTS",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as LeaderboardType | null;
    const view = searchParams.get("view");
    const limit = parseInt(searchParams.get("limit") || "50");
    const userId = await getCurrentUserId();

    // Get multiple leaderboards at once
    if (view === "all") {
      const leaderboards = await getMultipleLeaderboards(
        VALID_TYPES,
        10,
        userId || undefined
      );
      return NextResponse.json({ leaderboards });
    }

    // Get top tracks
    if (view === "tracks") {
      const tracks = await getTopTracks(limit);
      return NextResponse.json(tracks);
    }

    // Single leaderboard
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const leaderboard = await getLeaderboardWithChanges(
      type,
      limit,
      userId || undefined
    );

    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
