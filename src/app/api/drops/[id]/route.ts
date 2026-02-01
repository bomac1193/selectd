/**
 * Individual Drop API Routes
 * PATCH /api/drops/[id] - Update drop status (curators only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: dropId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a curator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCurator: true },
    });

    if (!user?.isCurator) {
      return NextResponse.json(
        { error: "Curator access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["APPROVED", "REJECTED", "ARCHIVED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update drop status
    const drop = await prisma.drop.update({
      where: { id: dropId },
      data: { status },
    });

    return NextResponse.json({ drop });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update drop";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
