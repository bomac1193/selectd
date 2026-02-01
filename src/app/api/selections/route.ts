/**
 * Battles API Routes
 * POST /api/selections - Create or join battle
 * GET /api/selections - List active battles
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  createSelection,
  getActiveSelections,
} from "@/lib/selection";
import { trackMissionProgress } from "@/lib/missions";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { trackId, battleType } = body;

    if (!trackId) {
      return NextResponse.json(
        { error: "trackId is required" },
        { status: 400 }
      );
    }

    const battle = await createSelection({
      userId,
      trackId,
      battleType,
    });

    return NextResponse.json({ battle });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create battle";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const battles = await getActiveSelections(limit);

    return NextResponse.json({ battles });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch battles" },
      { status: 500 }
    );
  }
}
