/**
 * Battle Vote API Route
 * POST /api/selections/[id]/vote - Cast vote in battle
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { castVote } from "@/lib/selection";
import { trackMissionProgress } from "@/lib/missions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id: battleId } = await params;
    const body = await request.json();
    const { votedFor, conviction } = body;

    if (!votedFor || !["TRACK_1", "TRACK_2"].includes(votedFor)) {
      return NextResponse.json(
        { error: "votedFor must be TRACK_1 or TRACK_2" },
        { status: 400 }
      );
    }

    const vote = await castVote({
      battleId,
      voterId: userId,
      votedFor,
      conviction,
    });

    // Track mission progress
    await trackMissionProgress(userId, "VOTE_IN_BATTLES", 1);

    return NextResponse.json({ vote });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cast vote";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
