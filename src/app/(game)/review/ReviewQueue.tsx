"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui";
import { apiFetch } from "@/lib/api";

interface Drop {
  id: string;
  title: string;
  artist: string | null;
  audioUrl: string;
  coverUrl: string | null;
  source: string;
  sourceUrl: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface ReviewQueueProps {
  drops: Drop[];
}

export function ReviewQueue({ drops: initialDrops }: ReviewQueueProps) {
  const [drops, setDrops] = useState(initialDrops);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentDrop = drops[currentIndex];

  const handleDecision = async (status: "APPROVED" | "REJECTED") => {
    if (!currentDrop || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await apiFetch(`/api/drops/${currentDrop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update drop status");
      }

      // Move to next drop
      if (currentIndex < drops.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Remove all reviewed drops
        setDrops([]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Failed to update drop:", error);
      alert(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentDrop) {
    return (
      <div className="border border-border p-12 text-center">
        <p className="text-foreground/60">No pending submissions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="text-sm text-foreground/40">
        {currentIndex + 1} / {drops.length}
      </div>

      {/* Drop Card */}
      <div className="border border-border p-4">
        <div className="flex gap-4 mb-4">
          {/* Cover */}
          <div className="w-32 h-32 flex-shrink-0 bg-card border border-border">
            {currentDrop.coverUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={currentDrop.coverUrl}
                  alt={currentDrop.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/20">
                —
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-lg font-semibold mb-0.5">{currentDrop.title}</h2>
              <p className="text-sm text-foreground/60">{currentDrop.artist || "Unknown"}</p>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-foreground/40 uppercase tracking-wider">
                  Source:
                </span>
                <p className="text-foreground/80">{currentDrop.source}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-foreground/40 uppercase tracking-wider">
                  By:
                </span>
                <p className="text-foreground/80">
                  {currentDrop.user.name || currentDrop.user.email}
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-foreground/40 uppercase tracking-wider">
                  Date:
                </span>
                <p className="text-foreground/80">
                  {new Date(currentDrop.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="mb-4">
          <audio
            controls
            src={currentDrop.audioUrl}
            className="w-full"
            preload="auto"
            controlsList=""
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => handleDecision("REJECTED")}
            disabled={isProcessing}
            className="uppercase tracking-wider"
          >
            Reject
          </Button>
          <Button
            variant="primary"
            onClick={() => handleDecision("APPROVED")}
            loading={isProcessing}
            className="uppercase tracking-wider"
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
