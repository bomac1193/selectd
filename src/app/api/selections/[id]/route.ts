/**
 * Battle Detail API Routes
 * GET /api/selections/[id] - Get battle details
 */

import { NextRequest, NextResponse } from "next/server";
import { getSelectionById } from "@/lib/selection";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const battle = await getSelectionById(id);

    if (!battle) {
      return NextResponse.json(
        { error: "Battle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ battle });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch battle" },
      { status: 500 }
    );
  }
}
