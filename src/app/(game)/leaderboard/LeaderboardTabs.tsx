"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, Badge, Card } from "@/components/ui";
import type { LeaderboardType } from "@prisma/client";

interface LeaderboardEntry {
  userId: string;
  rank: number;
  score: number;
  username: string | null;
  name: string | null;
  image: string | null;
  change?: number;
}

interface LeaderboardResult {
  type: LeaderboardType;
  period: string;
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
  total: number;
  updatedAt: Date;
}

interface TopTrack {
  id: string;
  title: string;
  artist: string | null;
  coverUrl: string | null;
  winRate: number;
  selectionCount: number;
  user: { id: string; username: string | null; image: string | null };
}

interface LeaderboardTabsProps {
  leaderboards: Record<LeaderboardType, LeaderboardResult>;
  topTracks: TopTrack[];
  currentUserId: string | null;
}

const TABS: { id: LeaderboardType | "tracks"; label: string }[] = [
  { id: "CURATOR_REP", label: "Curators" },
  { id: "FAN_REP", label: "Fans" },
  { id: "WIN_RATE", label: "Win Rate" },
  { id: "tracks", label: "Top Tracks" },
  { id: "XP", label: "XP" },
];

export function LeaderboardTabs({
  leaderboards,
  topTracks,
  currentUserId,
}: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType | "tracks">(
    "CURATOR_REP"
  );

  const currentLeaderboard =
    activeTab !== "tracks" ? leaderboards[activeTab] : null;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap text-xs font-medium tracking-wide transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <span className="font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "tracks" ? (
        <TrackLeaderboard tracks={topTracks} />
      ) : currentLeaderboard ? (
        <PlayerLeaderboard
          leaderboard={currentLeaderboard}
          currentUserId={currentUserId}
        />
      ) : null}
    </div>
  );
}

function PlayerLeaderboard({
  leaderboard,
  currentUserId,
}: {
  leaderboard: LeaderboardResult;
  currentUserId: string | null;
}) {
  const formatScore = (score: number, type: LeaderboardType) => {
    if (type === "WIN_RATE") return `${Math.round(score)}%`;
    if (type === "XP" || type === "TASTE_POINTS") return score.toLocaleString();
    return Math.round(score);
  };

  return (
    <div className="space-y-3">
      {/* User's Rank (if not in top) */}
      {leaderboard.userRank &&
        !leaderboard.entries.find((e) => e.userId === currentUserId) && (
          <Card variant="glow" padding="md" className="mb-6">
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold text-muted-foreground">
                #{leaderboard.userRank.rank}
              </div>
              <Avatar
                src={leaderboard.userRank.image}
                name={leaderboard.userRank.name}
                size="md"
                glow
              />
              <div className="flex-1">
                <p className="font-bold">
                  {leaderboard.userRank.username ||
                    leaderboard.userRank.name ||
                    "You"}
                </p>
                <p className="text-sm text-muted-foreground">Your rank</p>
              </div>
              <div className="text-xl font-bold">
                {formatScore(leaderboard.userRank.score, leaderboard.type)}
              </div>
            </div>
          </Card>
        )}

      {/* Leaderboard List */}
      {leaderboard.entries.map((entry, index) => {
        const isCurrentUser = entry.userId === currentUserId;
        const isTop3 = index < 3;

        return (
          <Card
            key={entry.userId}
            variant={isCurrentUser ? "glow" : "elevated"}
            padding="md"
            className={cn(
              "transition-all hover:bg-accent",
              isTop3 && "border-l-4",
              index === 0 && "border-l-yellow-500",
              index === 1 && "border-l-zinc-400",
              index === 2 && "border-l-amber-600"
            )}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div
                className={cn(
                  "w-10 h-10 rounded-md border border-white/15 flex items-center justify-center font-semibold text-sm",
                  index === 0 && "bg-orange-500/10 text-orange-500 border-neon-orange/40",
                  index === 1 && "bg-white/5 text-foreground border-white/30",
                  index === 2 && "bg-pink-500/10 text-pink-500 border-neon-pink/40",
                  index > 2 && "bg-secondary text-muted-foreground"
                )}
              >
                {entry.rank}
              </div>

              {/* Avatar */}
              <Avatar
                src={entry.image}
                name={entry.name}
                size="md"
                rank={isTop3 ? entry.rank : undefined}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">
                  {entry.username || entry.name || "Anonymous"}
                  {isCurrentUser && (
                    <Badge variant="default" className="ml-2">
                      You
                    </Badge>
                  )}
                </p>
                {entry.change !== undefined && entry.change !== 0 && (
                  <p
                    className={cn(
                      "text-xs",
                      entry.change > 0 ? "text-green-500" : "text-pink-500"
                    )}
                  >
                    {entry.change > 0 ? "↑" : "↓"} {Math.abs(entry.change)}{" "}
                    from yesterday
                  </p>
                )}
              </div>

              {/* Score */}
              <div className="text-right">
                <p
                  className={cn(
                    "text-xl font-bold",
                    isTop3 && "text-foreground"
                  )}
                >
                  {formatScore(entry.score, leaderboard.type)}
                </p>
              </div>
            </div>
          </Card>
        );
      })}

      {leaderboard.entries.length === 0 && (
        <Card variant="elevated" padding="lg" className="text-center">
          <p className="text-muted-foreground">No players ranked yet</p>
        </Card>
      )}
    </div>
  );
}

function TrackLeaderboard({ tracks }: { tracks: TopTrack[] }) {
  return (
    <div className="space-y-3">
      {tracks.map((track, index) => {
        const isTop3 = index < 3;

        return (
          <Card
            key={track.id}
            variant="elevated"
            padding="md"
            className={cn(
              "transition-all hover:bg-accent",
              isTop3 && "border-l-4",
              index === 0 && "border-l-yellow-500",
              index === 1 && "border-l-zinc-400",
              index === 2 && "border-l-amber-600"
            )}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                  index === 0 && "bg-yellow-400/20 text-yellow-400",
                  index === 1 && "bg-gray-400/20 text-gray-400",
                  index === 2 && "bg-amber-600/20 text-amber-600",
                  index > 2 && "bg-secondary text-muted-foreground"
                )}
              >
                {index + 1}
              </div>

              {/* Cover */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                {track.coverUrl ? (
                  <Image
                    src={track.coverUrl}
                    alt={track.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary opacity-30" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{track.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artist || "Unknown"} • by @{track.user.username}
                </p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p
                  className={cn(
                    "text-xl font-bold",
                    isTop3 && "text-foreground"
                  )}
                >
                  {Math.round(track.winRate)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {track.selectionCount} selections
                </p>
              </div>
            </div>
          </Card>
        );
      })}

      {tracks.length === 0 && (
        <Card variant="elevated" padding="lg" className="text-center">
          <p className="text-muted-foreground">No tracks ranked yet</p>
        </Card>
      )}
    </div>
  );
}
