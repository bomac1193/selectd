"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, Button } from "@/components/ui";
import type { PlayerProfile, Drop } from "@prisma/client";

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
  track1: { title: string; artist: string | null; coverUrl: string | null };
  track2: { title: string; artist: string | null; coverUrl: string | null } | null;
  player1Id: string;
  player2Id: string | null;
  winnerId: string | null;
  completedAt: Date | null;
}

interface ProfileViewProps {
  user: User;
  profile: PlayerProfile | null;
  recentSelections: Battle[];
  drops: Drop[];
}

export function ProfileView({
  user,
  profile,
  recentSelections,
  drops,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"submissions" | "selections">("submissions");

  const isCurator = profile?.preferredMode === "CURATOR";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="border border-border p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar src={user.image} name={user.name} size="xl" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1 uppercase tracking-wide">
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
                {isCurator ? "Curator" : "Observer"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
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
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        {(["submissions", "selections"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 uppercase tracking-wider text-sm ${
              activeTab === tab
                ? "border-b-2 border-foreground text-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
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
                      <span>{drop.battleCount} evaluations</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-border p-6 col-span-2 text-center">
              <p className="text-foreground/60 mb-4 text-sm">No tracks submitted</p>
              <Link href="/submit">
                <Button variant="primary" className="uppercase tracking-wider">
                  Submit track
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Selections Tab */}
      {activeTab === "selections" && (
        <div className="space-y-3">
          {recentSelections.length > 0 ? (
            recentSelections.map((battle) => {
              const won = battle.winnerId === user.id;
              const isPlayer1 = battle.player1Id === user.id;

              return (
                <Link key={battle.id} href={`/selection/${battle.id}`}>
                  <div className="border border-border p-4 hover:border-foreground transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-foreground">
                            {isPlayer1 ? battle.track1.title : battle.track2?.title}
                          </span>
                          <span className="text-foreground/40">vs</span>
                          <span className="text-foreground/60">
                            {isPlayer1 ? battle.track2?.title : battle.track1.title}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/40 mt-1">
                          {battle.completedAt
                            ? new Date(battle.completedAt).toLocaleDateString()
                            : "In progress"}
                        </p>
                      </div>
                      <div className="text-xs text-foreground/60">
                        {won ? "Selected" : battle.winnerId ? "—" : "Pending"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="border border-border p-6 text-center">
              <p className="text-foreground/60 text-sm">No evaluations</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
