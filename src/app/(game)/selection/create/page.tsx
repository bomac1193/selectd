"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

interface Drop {
  id: string;
  title: string;
  artist: string | null;
  coverUrl: string | null;
  selectionCount: number;
  winRate: number;
}

export default function CreateSelectionPage() {
  const router = useRouter();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadDrops() {
      try {
        const response = await apiFetch("/api/drops?view=mine");
        const data = await response.json();
        setDrops(data.drops || []);
      } catch (error) {
        console.error("Failed to load drops:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDrops();
  }, []);

  const handleCreateSelection = async () => {
    if (!selectedTrack || isCreating) return;

    setIsCreating(true);
    try {
      const response = await apiFetch("/api/selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: selectedTrack }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create selection");
      }

      const data = await response.json();
      router.push(`/selection/${data.selection.id}`);
    } catch (error) {
      console.error("Failed to create selection:", error);
      alert(error instanceof Error ? error.message : "Failed to create selection");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-secondary rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          Select track
        </h1>
      </div>

      {drops.length === 0 ? (
        <div className="border border-border p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No tracks available</h3>
          <p className="text-foreground/60 mb-6 text-sm">
            Submit a track first
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/drop")}
            className="uppercase tracking-wider"
          >
            Submit track
          </Button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {drops.map((drop) => (
              <button
                key={drop.id}
                onClick={() => setSelectedTrack(drop.id)}
                className="text-left"
              >
                <div
                  className={cn(
                    "overflow-hidden transition-all border",
                    selectedTrack === drop.id
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/50"
                  )}
                >
                  <div className="flex">
                    {/* Cover */}
                    <div className="relative w-20 h-20 flex-shrink-0 bg-card">
                      {drop.coverUrl ? (
                        <Image
                          src={drop.coverUrl}
                          alt={drop.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-foreground/10" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold truncate">{drop.title}</h3>
                      <p className="text-sm text-foreground/60 truncate">
                        {drop.artist || "Unknown"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-foreground/40">
                        <span>{drop.selectionCount} selections</span>
                        <span>{Math.round(drop.winRate)}% win</span>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {selectedTrack === drop.id && (
                      <div className="flex items-center pr-4">
                        <div className="text-xs text-foreground">
                          ✓
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Action */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="lg"
              disabled={!selectedTrack}
              loading={isCreating}
              onClick={handleCreateSelection}
              className="uppercase tracking-wider"
            >
              Create
            </Button>
          </div>

          {/* Info */}
          <div className="border border-border p-4 mt-8">
            <div className="text-sm text-foreground/60 space-y-1">
              <p>Matched with another curator</p>
              <p>Voting determines outcome</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
