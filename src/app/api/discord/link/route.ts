import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const discordId = String(body.discordId || "").trim();

    if (!discordId) {
      return NextResponse.json({ error: "discordId required" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { discordId, id: { not: userId } },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Discord ID already linked" },
        { status: 409 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { discordId },
      select: { id: true, discordId: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to link Discord";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
