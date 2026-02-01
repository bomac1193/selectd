/**
 * Missions API Routes
 * GET /api/missions - Get active missions with progress
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getActiveMissions, getPlayerStats } from "@/lib/missions";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const missions = await getActiveMissions(userId);
    const stats = await getPlayerStats(userId);

    return NextResponse.json({
      missions,
      profile: stats.profile,
      levelProgress: stats.levelProgress,
      xpToNextLevel: stats.xpToNextLevel,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch missions";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
