import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function CanonPage() {
  const session = await auth();

  // Get completed selections (the canon)
  const selections = await prisma.battle.findMany({
    where: {
      status: "COMPLETED",
      winnerId: { not: null },
    },
    include: {
      track1: true,
      track2: true,
      player1: {
        select: { name: true, username: true },
      },
      player2: {
        select: { name: true, username: true },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
    take: 100,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 uppercase tracking-wide">
          Canon
        </h1>
        <p className="text-foreground/60 text-sm">
          Permanent record of evaluated work
        </p>
      </div>

      <div className="space-y-4">
        {selections.length === 0 ? (
          <div className="border border-border p-12 text-center">
            <p className="text-foreground/60 text-sm">No evaluations recorded</p>
          </div>
        ) : (
          selections.map((selection) => {
            const winningTrack =
              selection.winnerId === selection.player1Id
                ? selection.track1
                : selection.track2;
            const losingTrack =
              selection.winnerId === selection.player1Id
                ? selection.track2
                : selection.track1;

            return (
              <Link
                key={selection.id}
                href={`/selection/${selection.id}`}
                className="block border border-border hover:border-foreground transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Winning Track */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative w-12 h-12 flex-shrink-0 bg-card">
                          {winningTrack.coverUrl ? (
                            <Image
                              src={winningTrack.coverUrl}
                              alt={winningTrack.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-foreground/10" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {winningTrack.title}
                          </p>
                          <p className="text-sm text-foreground/60 truncate">
                            {winningTrack.artist || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-right text-xs text-foreground/40">
                      <p>
                        {selection.completedAt
                          ? new Date(selection.completedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Losing Track */}
                  {losingTrack && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3 opacity-40">
                        <div className="relative w-8 h-8 flex-shrink-0 bg-card">
                          {losingTrack.coverUrl ? (
                            <Image
                              src={losingTrack.coverUrl}
                              alt={losingTrack.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-foreground/10" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{losingTrack.title}</p>
                          <p className="text-xs text-foreground/60 truncate">
                            {losingTrack.artist || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
