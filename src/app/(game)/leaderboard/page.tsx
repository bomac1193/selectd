import { auth } from "@/lib/auth";
import { getMultipleLeaderboards, getTopTracks } from "@/lib/leaderboard";
import { LeaderboardTabs } from "./LeaderboardTabs";
import type { LeaderboardType } from "@prisma/client";

export default async function LeaderboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const types: LeaderboardType[] = [
    "CURATOR_REP",
    "FAN_REP",
    "WIN_RATE",
    "CONVICTION",
    "XP",
    "TASTE_POINTS",
  ];

  const [leaderboards, topTracks] = await Promise.all([
    getMultipleLeaderboards(types, 50, userId || undefined),
    getTopTracks(10),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-mono font-bold mb-2">
          <span className="text-foreground">Leader</span>boards
        </h1>
        <p className="text-muted-foreground">
          See who&apos;s dominating the taste game
        </p>
      </div>

      <LeaderboardTabs
        leaderboards={leaderboards}
        topTracks={topTracks.tracks}
        currentUserId={userId || null}
      />
    </div>
  );
}
