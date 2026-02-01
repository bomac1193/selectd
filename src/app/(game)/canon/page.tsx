import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function CanonPage() {
  // Fetch all approved drops (canon entries)
  const canonEntries = await prisma.drop.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          The Canon
        </h1>
        <p className="text-sm text-foreground/40 uppercase tracking-wider mt-2">
          {canonEntries.length} entries
        </p>
      </div>

      {/* Canon Entries */}
      {canonEntries.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canonEntries.map((entry) => (
            <div key={entry.id} className="border border-border p-4 hover:border-foreground/40 transition-colors">
              {/* Cover */}
              {entry.coverUrl && (
                <div className="relative w-full aspect-square mb-4 bg-card">
                  <Image
                    src={entry.coverUrl}
                    alt={entry.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">{entry.title}</h3>
                <p className="text-xs text-foreground/60">{entry.artist || "Unknown"}</p>
                <p className="text-xs text-foreground/40 uppercase tracking-wider">
                  {new Date(entry.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Audio */}
              <div className="mt-4">
                <audio
                  controls
                  src={entry.audioUrl}
                  className="w-full"
                  preload="metadata"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border p-12 text-center">
          <p className="text-foreground/40 text-sm uppercase tracking-wider">
            —
          </p>
        </div>
      )}
    </div>
  );
}
