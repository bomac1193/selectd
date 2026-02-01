/**
 * Drops API Routes
 * POST /api/drops - Create a new drop
 * GET /api/drops - List drops
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getCurrentUserId } from "@/lib/auth";
import {
  createDrop,
  getUserDrops,
  getApprovedDrops,
  getTopDrops,
  searchDrops,
} from "@/lib/drop";
import { trackMissionProgress } from "@/lib/missions";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { title, artist, audioUrl, coverUrl, duration, source, sourceUrl, sourceId } = body;

    if (!title || !audioUrl) {
      return NextResponse.json(
        { error: "title and audioUrl are required" },
        { status: 400 }
      );
    }

    const drop = await createDrop({
      userId,
      title,
      artist,
      audioUrl,
      coverUrl,
      duration,
      source,
      sourceUrl,
      sourceId,
    });

    // Track mission progress
    await trackMissionProgress(userId, "DROP_TRACKS", 1);

    return NextResponse.json({ drop });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create drop";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "approved";
    const limit = parseInt(searchParams.get("limit") || "20");
    const query = searchParams.get("q");
    const userId = await getCurrentUserId();

    let drops;

    switch (view) {
      case "mine":
        if (!userId) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }
        drops = await getUserDrops(userId);
        break;

      case "top":
        drops = await getTopDrops(limit);
        break;

      case "search":
        if (!query) {
          return NextResponse.json(
            { error: "Search query required" },
            { status: 400 }
          );
        }
        drops = await searchDrops(query, limit);
        break;

      case "approved":
      default:
        drops = await getApprovedDrops(limit, userId || undefined);
        break;
    }

    return NextResponse.json({ drops });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch drops" },
      { status: 500 }
    );
  }
}
