"use client";

import Link from "next/link";
import Image from "next/image";
import { cn, formatTime } from "@/lib/utils";
import { Avatar, Badge } from "@/components/ui";
import { useCountdown } from "@/hooks/useCountdown";

interface SelectionCardProps {
  battle: {
    id: string;
    track1: {
      id: string;
      title: string;
      artist: string | null;
      coverUrl: string | null;
    };
    track2: {
      id: string;
      title: string;
      artist: string | null;
      coverUrl: string | null;
    } | null;
    player1: {
      id: string;
      name: string | null;
      image: string | null;
    };
    player2: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
    votingEndsAt: string | null;
    totalVotes: number;
    status: string;
  };
}

export function SelectionCard({ battle }: SelectionCardProps) {
  const endTime = battle.votingEndsAt ? new Date(battle.votingEndsAt) : null;
  const { formatted, expired } = useCountdown(endTime);

  if (!battle.track2 || !battle.player2) {
    return null; // Don't show incomplete battles
  }

  return (
    <Link href={`/battle/${battle.id}`}>
      <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-white/25 transition-all duration-300">
        {/* Cover Images */}
        <div className="relative h-48 flex">
          {/* Track 1 Cover */}
          <div className="relative w-1/2 overflow-hidden">
            {battle.track1.coverUrl ? (
              <Image
                src={battle.track1.coverUrl}
                alt={battle.track1.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 bg-secondary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card to-transparent opacity-60" />
          </div>

          {/* VS Divider */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-10 h-10 rounded-full bg-background border border-white/30 flex items-center justify-center font-bold text-sm">
              VS
            </div>
          </div>

          {/* Track 2 Cover */}
          <div className="relative w-1/2 overflow-hidden">
            {battle.track2.coverUrl ? (
              <Image
                src={battle.track2.coverUrl}
                alt={battle.track2.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 bg-secondary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card to-transparent opacity-60" />
          </div>

          {/* Timer Badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge variant={expired ? "muted" : "warning"}>
              {expired ? "ENDED" : formatted}
            </Badge>
          </div>
        </div>

        {/* Battle Info */}
        <div className="p-4">
          {/* Track Titles */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-semibold text-sm truncate text-foreground">
                {battle.track1.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {battle.track1.artist || "Unknown"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm truncate text-foreground">
                {battle.track2.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {battle.track2.artist || "Unknown"}
              </p>
            </div>
          </div>

          {/* Players */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar
                src={battle.player1.image}
                name={battle.player1.name}
                size="sm"
              />
              <span className="text-xs text-muted-foreground">
                {battle.player1.name || "Player 1"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {battle.totalVotes} votes
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {battle.player2.name || "Player 2"}
              </span>
              <Avatar
                src={battle.player2.image}
                name={battle.player2.name}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  );
}
