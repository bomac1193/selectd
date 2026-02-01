"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { cn, formatNumber } from "@/lib/utils";
import { Avatar, Badge, Button, Progress } from "@/components/ui";
import type { PlayerProfile, Drop, GameMode } from "@prisma/client";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  createdAt: Date;
}

interface Battle {
  id: string;
  winnerId: string | null;
  player1Id: string;
  player2Id: string | null;
  track1: { title: string; coverUrl: string | null };
  track2: { title: string; coverUrl: string | null } | null;
  completedAt: Date | null;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  xpReward: number;
  userProgress?: {
    progress: number;
    completed: boolean;
  };
}

interface ProfileViewProps {
  user: User;
  profile: PlayerProfile | null;
  levelProgress: number;
  xpToNextLevel: number;
  activeMissions: Mission[];
  recentSelections: Battle[];
  drops: Drop[];
}

export function ProfileView({
  user,
  profile,
  levelProgress,
  xpToNextLevel,
  activeMissions,
  recentSelections,
  drops,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "drops" | "battles">(
    "stats"
  );

  const winRate = profile
    ? profile.totalBattles > 0
      ? Math.round((profile.battleWins / profile.totalBattles) * 100)
      : 0
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="border border-border p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar src={user.image} name={user.name} size="xl" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl font-semibold mb-1">
              {user.username || user.name || "User"}
            </h1>
            <p className="text-foreground/60 mb-3 text-sm">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="border border-border px-2 py-1 text-xs uppercase tracking-wider">
                {profile?.preferredMode === "CURATOR" ? "Curator" : "Observer"}
              </span>
              <span className="border border-border px-2 py-1 text-xs uppercase tracking-wider">
                Level {profile?.level || 1}
              </span>
              {profile && profile.currentStreak > 0 && (
                <span className="border border-border px-2 py-1 text-xs uppercase tracking-wider">
                  {profile.currentStreak} day streak
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/mode">
              <Button variant="secondary" size="sm" className="uppercase tracking-wider">
                Change mode
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="uppercase tracking-wider"
            >
              Exit
            </Button>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground/60">
              Level {profile?.level || 1}
            </span>
            <span className="text-sm text-foreground/60">
              {formatNumber(profile?.xp || 0)} / {formatNumber(xpToNextLevel)} XP
            </span>
          </div>
          <Progress value={levelProgress * 100} variant="default" size="md" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-border p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {profile?.totalDrops || 0}
          </div>
          <div className="text-sm text-foreground/60">Tracks</div>
        </div>
        <div className="border border-border p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {profile?.totalBattles || 0}
          </div>
          <div className="text-sm text-foreground/60">Selections</div>
        </div>
        <div className="border border-border p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{winRate}%</div>
          <div className="text-sm text-foreground/60">Win rate</div>
        </div>
        <div className="border border-border p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {formatNumber(profile?.tastePoints || 0)}
          </div>
          <div className="text-sm text-foreground/60">Points</div>
        </div>
      </div>

      {/* Reputation Bars */}
      <div className="border border-border p-6 mb-8">
        <h2 className="text-base uppercase tracking-wider mb-4 text-foreground/60">
          Standing
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground/60">Curator</span>
              <span className="text-sm font-semibold">
                {Math.round(profile?.curatorRep || 50)}
              </span>
            </div>
            <Progress value={profile?.curatorRep || 50} variant="default" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground/60">Observer</span>
              <span className="text-sm font-semibold">
                {Math.round(profile?.fanRep || 50)}
              </span>
            </div>
            <Progress value={profile?.fanRep || 50} variant="default" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground/60">Conviction</span>
              <span className="text-sm font-semibold">
                {Math.round(profile?.convictionScore || 50)}
              </span>
            </div>
            <Progress value={profile?.convictionScore || 50} variant="default" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(["stats", "drops", "battles"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 font-medium capitalize transition-colors uppercase tracking-wider text-sm",
              activeTab === tab
                ? "border-b-2 border-foreground text-foreground"
                : "text-foreground/60 hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          <div className="border border-border p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-foreground/60 text-sm">Wins</p>
                <p className="text-xl font-semibold">{profile?.battleWins || 0}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm">Votes cast</p>
                <p className="text-xl font-semibold">{profile?.totalVotes || 0}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm">Correct</p>
                <p className="text-xl font-semibold">{profile?.correctPicks || 0}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm">Longest streak</p>
                <p className="text-xl font-semibold">
                  {profile?.longestStreak || 0} days
                </p>
              </div>
            </div>
          </div>

          {activeMissions.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-3 text-foreground/60">
                Missions
              </h3>
              {activeMissions.slice(0, 3).map((mission) => (
                <div key={mission.id} className="border border-border p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{mission.title}</p>
                      <p className="text-xs text-foreground/60">
                        {mission.userProgress?.progress || 0}/{mission.targetValue}
                      </p>
                    </div>
                    {mission.userProgress?.completed ? (
                      <span className="text-xs uppercase tracking-wider text-foreground">
                        Completed
                      </span>
                    ) : (
                      <Progress
                        value={
                          ((mission.userProgress?.progress || 0) /
                            mission.targetValue) *
                          100
                        }
                        variant="default"
                        size="sm"
                        className="w-20"
                      />
                    )}
                  </div>
                </div>
              ))}
              <Link
                href="/missions"
                className="text-sm text-foreground/60 hover:text-foreground"
              >
                View missions
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "drops" && (
        <div className="grid md:grid-cols-2 gap-4">
          {drops.length > 0 ? (
            drops.map((drop) => (
              <div key={drop.id} className="border border-border">
                <div className="flex">
                  <div className="relative w-20 h-20 flex-shrink-0 bg-card">
                    {drop.coverUrl ? (
                      <Image
                        src={drop.coverUrl}
                        alt={drop.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-foreground/10" />
                    )}
                  </div>
                  <div className="p-3 flex-1">
                    <p className="font-semibold truncate">{drop.title}</p>
                    <p className="text-sm text-foreground/60 truncate">
                      {drop.artist || "Unknown"}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-foreground/40">
                      <span>{drop.battleCount} selections</span>
                      <span>{Math.round(drop.winRate)}% win</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-border p-6 col-span-2 text-center">
              <p className="text-foreground/60 mb-4 text-sm">No tracks submitted</p>
              <Link href="/drop">
                <Button variant="primary" className="uppercase tracking-wider">
                  Submit track
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "battles" && (
        <div className="space-y-3">
          {recentSelections.length > 0 ? (
            recentSelections.map((battle) => {
              const won = battle.winnerId === user.id;
              const isPlayer1 = battle.player1Id === user.id;

              return (
                <Link key={battle.id} href={`/selection/${battle.id}`}>
                  <div className="border border-border p-4 hover:border-foreground transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 flex items-center justify-center">
                        <span className="text-xs uppercase tracking-wider text-foreground/60">
                          {won ? "Win" : battle.winnerId ? "Loss" : "—"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {isPlayer1 ? battle.track1.title : battle.track2?.title}{" "}
                          <span className="text-foreground/60">vs</span>{" "}
                          {isPlayer1 ? battle.track2?.title : battle.track1.title}
                        </p>
                        <p className="text-sm text-foreground/60">
                          {battle.completedAt
                            ? new Date(battle.completedAt).toLocaleDateString()
                            : "Active"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="border border-border p-6 text-center">
              <p className="text-foreground/60 mb-4 text-sm">No selections recorded</p>
              <Link href="/selection">
                <Button variant="primary" className="uppercase tracking-wider">
                  View selections
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
