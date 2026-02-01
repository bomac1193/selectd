"use client";

import { useRouter } from "next/navigation";
import { SelectionArena } from "@/components/selection/SelectionArena";
import { apiFetch } from "@/lib/api";

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

interface SelectionArenaClientProps {
  selection: {
    id: string;
    track1: Track;
    track2: Track;
    player1: Player;
    player2: Player;
    votingEndsAt: string | null;
    player1Votes: number;
    player2Votes: number;
    winnerId?: string | null;
    status: "VOTING" | "COMPLETED";
  };
  currentUserId: string;
  userVote?: "TRACK_1" | "TRACK_2";
}

export function SelectionArenaClient({
  selection,
  currentUserId,
  userVote,
}: SelectionArenaClientProps) {
  const router = useRouter();

  const handleVote = async (choice: "TRACK_1" | "TRACK_2") => {
    const response = await apiFetch(`/api/selections/${selection.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ votedFor: choice }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to vote");
    }

    router.refresh();
  };

  return (
    <SelectionArena
      selectionId={selection.id}
      track1={selection.track1}
      track2={selection.track2}
      player1={selection.player1}
      player2={selection.player2}
      votingEndsAt={selection.votingEndsAt ? new Date(selection.votingEndsAt) : null}
      player1Votes={selection.player1Votes}
      player2Votes={selection.player2Votes}
      winnerId={selection.winnerId}
      status={selection.status}
      currentUserId={currentUserId}
      userVote={userVote}
      onVote={handleVote}
    />
  );
}
