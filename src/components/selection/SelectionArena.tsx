"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TrackCard } from "./TrackCard";
import { SelectionTimer } from "./SelectionTimer";
import { SelectionVS } from "./SelectionVS";
import { SelectionResult } from "./SelectionResult";
import { Avatar, Button } from "@/components/ui";

interface Track {
  id: string;
  title: string;
  artist: string | null;
  coverUrl: string | null;
  audioUrl: string;
  duration?: number | null;
}

interface Player {
  id: string;
  name: string | null;
  image: string | null;
}

interface SelectionArenaProps {
  battleId: string;
  track1: Track;
  track2: Track;
  player1: Player;
  player2: Player;
  votingEndsAt: Date | null;
  player1Votes: number;
  player2Votes: number;
  winnerId?: string | null;
  status: "VOTING" | "COMPLETED";
  currentUserId: string;
  userVote?: "TRACK_1" | "TRACK_2" | null;
  onVote: (choice: "TRACK_1" | "TRACK_2") => Promise<void>;
}

export function SelectionArena({
  battleId,
  track1,
  track2,
  player1,
  player2,
  votingEndsAt,
  player1Votes,
  player2Votes,
  winnerId,
  status,
  currentUserId,
  userVote: initialUserVote,
  onVote,
}: SelectionArenaProps) {
  const [userVote, setUserVote] = useState<"TRACK_1" | "TRACK_2" | null>(
    initialUserVote || null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [showResult, setShowResult] = useState(status === "COMPLETED");
  const [votes, setVotes] = useState({ p1: player1Votes, p2: player2Votes });

  const isOwner = currentUserId === player1.id || currentUserId === player2.id;
  const canVote = !isOwner && !userVote && status === "VOTING";

  // Determine winner
  const winner = winnerId
    ? winnerId === player1.id
      ? "left"
      : "right"
    : null;

  const handleVote = async (choice: "TRACK_1" | "TRACK_2") => {
    if (!canVote || isVoting) return;

    setIsVoting(true);
    try {
      await onVote(choice);
      setUserVote(choice);

      // Optimistically update vote counts
      setVotes((prev) => ({
        p1: choice === "TRACK_1" ? prev.p1 + 1 : prev.p1,
        p2: choice === "TRACK_2" ? prev.p2 + 1 : prev.p2,
      }));
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleTimerExpire = () => {
    setShowResult(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Battle Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Avatar src={player1.image} name={player1.name} size="sm" />
            <span className="text-sm font-medium text-pink-500">
              {player1.name || "Player 1"}
            </span>
          </div>
          <span className="text-muted-foreground">vs</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-cyan-500">
              {player2.name || "Player 2"}
            </span>
            <Avatar src={player2.image} name={player2.name} size="sm" />
          </div>
        </div>

        <SelectionTimer
          endTime={votingEndsAt}
          onExpire={handleTimerExpire}
          size="lg"
        />

        {isOwner && (
          <p className="mt-4 text-muted-foreground text-sm">
            You can&apos;t vote in your own battle
          </p>
        )}
      </div>

      {/* Battle Arena */}
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-center mb-8">
        {/* Track 1 */}
        <div className="order-1">
          <TrackCard
            track={track1}
            side="left"
            isSelected={userVote === "TRACK_1"}
            isWinner={showResult && winner === "left"}
            isLoser={showResult && winner === "right"}
            showVoteButton={canVote}
            onVote={() => handleVote("TRACK_1")}
            disabled={isVoting}
          />
        </div>

        {/* VS Badge */}
        <div className="order-2 flex justify-center">
          <SelectionVS size="md" animated={!showResult} />
        </div>

        {/* Track 2 */}
        <div className="order-3">
          <TrackCard
            track={track2}
            side="right"
            isSelected={userVote === "TRACK_2"}
            isWinner={showResult && winner === "right"}
            isLoser={showResult && winner === "left"}
            showVoteButton={canVote}
            onVote={() => handleVote("TRACK_2")}
            disabled={isVoting}
          />
        </div>
      </div>

      {/* Vote Confirmation */}
      {userVote && !showResult && (
        <div className="text-center mb-8 animate-slide-up">
          <div
            className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-xl",
              userVote === "TRACK_1"
                ? "bg-pink-500/10 border border-neon-pink/30"
                : "bg-cyan-500/10 border border-neon-cyan/30"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-white/70" />
            <span className="font-medium">
              You voted for{" "}
              <span className={userVote === "TRACK_1" ? "text-pink-500" : "text-cyan-500"}>
                {userVote === "TRACK_1" ? track1.title : track2.title}
              </span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-3">
            Results will be revealed when voting ends
          </p>
        </div>
      )}

      {/* Results */}
      {showResult && (
        <div className="animate-slide-up">
          <SelectionResult
            winner={winner}
            leftVotes={votes.p1}
            rightVotes={votes.p2}
            leftPlayer={player1}
            rightPlayer={player2}
            userVote={
              userVote === "TRACK_1"
                ? "left"
                : userVote === "TRACK_2"
                ? "right"
                : null
            }
            revealed={showResult}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="secondary" size="lg">
              View Battle History
            </Button>
            <Button variant="fire" size="lg" glow>
              Find Next Battle
            </Button>
          </div>
        </div>
      )}

      {/* Live Vote Count (when not voted and not owner) */}
      {!userVote && !isOwner && status === "VOTING" && (
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            {votes.p1 + votes.p2} votes cast so far
          </p>
        </div>
      )}
    </div>
  );
}
