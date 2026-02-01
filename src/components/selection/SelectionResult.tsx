"use client";

import { cn } from "@/lib/utils";
import { VoteBar } from "@/components/ui";
import { Avatar } from "@/components/ui";

interface SelectionResultProps {
  winner: "left" | "right" | null;
  leftVotes: number;
  rightVotes: number;
  leftPlayer: {
    name: string | null;
    image: string | null;
  };
  rightPlayer: {
    name: string | null;
    image: string | null;
  };
  userVote?: "left" | "right" | null;
  revealed?: boolean;
}

export function SelectionResult({
  winner,
  leftVotes,
  rightVotes,
  leftPlayer,
  rightPlayer,
  userVote,
  revealed = true,
}: SelectionResultProps) {
  const totalVotes = leftVotes + rightVotes;
  const leftPercent = totalVotes > 0 ? (leftVotes / totalVotes) * 100 : 50;
  const rightPercent = totalVotes > 0 ? (rightVotes / totalVotes) * 100 : 50;

  const userWon = userVote && userVote === winner;
  const userLost = userVote && userVote !== winner && winner !== null;

  return (
    <div className="space-y-6">
      {/* Result Header */}
      {revealed && (
        <div className="text-center">
          {winner ? (
            <div className="animate-slide-up">
              <p className="text-muted-foreground text-sm mb-2">WINNER</p>
              <div className="flex items-center justify-center gap-3">
                <Avatar
                  src={winner === "left" ? leftPlayer.image : rightPlayer.image}
                  name={winner === "left" ? leftPlayer.name : rightPlayer.name}
                  size="lg"
                  glow
                />
                <span className="text-2xl font-bold">
                  {winner === "left" ? leftPlayer.name : rightPlayer.name}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-yellow-500">IT&apos;S A TIE!</p>
          )}
        </div>
      )}

      {/* Vote Bar */}
      <VoteBar
        leftPercent={leftPercent}
        rightPercent={rightPercent}
        leftLabel={`${leftVotes} votes`}
        rightLabel={`${rightVotes} votes`}
        revealed={revealed}
        winner={winner}
      />

      {/* User Result */}
      {userVote && revealed && (
        <div
          className={cn(
            "text-center p-4 rounded-xl",
            userWon && "bg-green-500/10 border border-neon-green/30",
            userLost && "bg-pink-500/10 border border-neon-pink/30",
            !winner && "bg-yellow-500/10 border border-yellow-500/30"
          )}
        >
          {userWon && (
            <p className="text-green-500 font-bold flex items-center justify-center gap-2">
              Nice pick. You voted for the winner.
            </p>
          )}
          {userLost && (
            <p className="text-pink-500 font-medium flex items-center justify-center gap-2">
              Better luck next time.
            </p>
          )}
          {!winner && userVote && (
            <p className="text-yellow-500 font-medium flex items-center justify-center gap-2">
              Tie game. No winner this round.
            </p>
          )}
        </div>
      )}

      {/* XP Earned */}
      {userVote && revealed && (
        <div className="text-center text-sm text-muted-foreground">
          {userWon ? (
            <span className="text-green-500">+50 XP earned!</span>
          ) : (
            <span>+10 XP for participating</span>
          )}
        </div>
      )}
    </div>
  );
}
