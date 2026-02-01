"use client";

import { cn } from "@/lib/utils";
import { VoteBar } from "@/components/ui";

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
  userVote,
  revealed = true,
}: SelectionResultProps) {
  const totalVotes = leftVotes + rightVotes;
  const leftPercent = totalVotes > 0 ? (leftVotes / totalVotes) * 100 : 50;
  const rightPercent = totalVotes > 0 ? (rightVotes / totalVotes) * 100 : 50;

  const userSelected = userVote && userVote === winner;

  return (
    <div className="space-y-6">
      {/* Result Header */}
      {revealed && winner && (
        <div className="text-center">
          <p className="text-foreground/60 text-sm uppercase tracking-wider">
            Selected
          </p>
        </div>
      )}

      {/* Vote Bar */}
      <VoteBar
        leftPercent={leftPercent}
        rightPercent={rightPercent}
        leftLabel={`${leftVotes}`}
        rightLabel={`${rightVotes}`}
        revealed={revealed}
        winner={winner}
      />

      {/* User Result - Only show if they voted for selected work */}
      {userSelected && revealed && (
        <div className="text-center p-4 border border-border">
          <p className="text-foreground/60 text-sm">Your selection</p>
        </div>
      )}
    </div>
  );
}
