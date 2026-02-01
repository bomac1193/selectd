/**
 * Profile API Routes
 * GET /api/profile - Get current user's profile
 * PATCH /api/profile - Update profile settings
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlayerStats, ensurePlayerProfile } from "@/lib/missions";
import { getUserSelections } from "@/lib/selection";
import { getUserDrops } from "@/lib/drop";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const [user, stats, recentBattles, drops] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          username: true,
        },
      }),
      getPlayerStats(userId),
      getUserSelections(userId, 5),
      getUserDrops(userId),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user,
      profile: stats.profile,
      levelProgress: stats.levelProgress,
      xpToNextLevel: stats.xpToNextLevel,
      activeMissions: stats.activeMissions,
      recentBattles,
      drops,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { username, preferredMode } = body;

    const updates: Record<string, unknown> = {};
    const profileUpdates: Record<string, unknown> = {};

    // Update username
    if (username !== undefined) {
      // Check if username is taken
      if (username) {
        const existing = await prisma.user.findFirst({
          where: {
            username,
            id: { not: userId },
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: "Username already taken" },
            { status: 400 }
          );
        }
      }

      updates.username = username || null;
    }

    // Update preferred game mode
    if (preferredMode && ["CURATOR", "FAN"].includes(preferredMode)) {
      profileUpdates.preferredMode = preferredMode;
    }

    // Apply updates
    const [user, profile] = await Promise.all([
      Object.keys(updates).length > 0
        ? prisma.user.update({
            where: { id: userId },
            data: updates,
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              username: true,
            },
          })
        : prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              username: true,
            },
          }),
      Object.keys(profileUpdates).length > 0
        ? prisma.playerProfile.update({
            where: { userId },
            data: profileUpdates,
          })
        : ensurePlayerProfile(userId),
    ]);

    return NextResponse.json({ user, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
