import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSelectionById } from "@/lib/selection";
import { SelectionArenaClient } from "./SelectionArenaClient";

interface SelectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SelectionDetailPage({ params }: SelectionDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const selection = await getSelectionById(id);

  if (!selection || !selection.track2 || !selection.player2) {
    notFound();
  }

  // Check if user has already voted
  const userVote = selection.votes.find((v) => v.voterId === userId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SelectionArenaClient
        selection={{
          id: selection.id,
          track1: {
            id: selection.track1.id,
            title: selection.track1.title,
            artist: selection.track1.artist,
            coverUrl: selection.track1.coverUrl,
            audioUrl: selection.track1.audioUrl,
            duration: selection.track1.duration,
          },
          track2: {
            id: selection.track2.id,
            title: selection.track2.title,
            artist: selection.track2.artist,
            coverUrl: selection.track2.coverUrl,
            audioUrl: selection.track2.audioUrl,
            duration: selection.track2.duration,
          },
          player1: {
            id: selection.player1.id,
            name: selection.player1.name,
            image: selection.player1.image,
          },
          player2: {
            id: selection.player2.id,
            name: selection.player2.name,
            image: selection.player2.image,
          },
          votingEndsAt: selection.votingEndsAt?.toISOString() || null,
          player1Votes: selection.player1Votes,
          player2Votes: selection.player2Votes,
          winnerId: selection.winnerId,
          status: selection.status as "VOTING" | "COMPLETED",
        }}
        currentUserId={userId || ""}
        userVote={userVote?.votedFor as "TRACK_1" | "TRACK_2" | undefined}
      />
    </div>
  );
}
