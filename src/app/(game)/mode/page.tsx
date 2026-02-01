"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useState } from "react";

export default function ModeSelectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleProceedAsObserver = async () => {
    setIsLoading(true);

    const nextRoute = "/selection";
    if (typeof window !== "undefined") {
      window.location.href = nextRoute;
    } else {
      router.push(nextRoute);
    }

    try {
      void apiFetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredMode: "FAN" }),
      }).catch((err) => {
        console.error("Failed to set mode:", err);
      });
    } catch (error) {
      console.error("Failed to set mode:", error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold mb-8 uppercase tracking-wide">
            Access Level
          </h1>
        </div>

        {/* Observer Access (Default) */}
        <div className="border border-border p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold uppercase tracking-wider mb-2">
              Observer
            </h2>
            <p className="text-foreground/60 text-sm">
              Standard access granted
            </p>
          </div>

          <div className="space-y-2 text-sm text-foreground/70 mb-6">
            <p>Vote on selections</p>
            <p>View outcomes</p>
            <p>Track standings</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={isLoading}
            onClick={handleProceedAsObserver}
            className="w-full uppercase tracking-wider"
          >
            Proceed
          </Button>
        </div>

        {/* Curator Access (Invite-Only) */}
        <div className="border border-border p-8 bg-foreground/5">
          <div className="mb-6">
            <h2 className="text-xl font-semibold uppercase tracking-wider mb-2">
              Curator
            </h2>
            <p className="text-foreground/60 text-sm">
              Invite only
            </p>
          </div>

          <div className="space-y-2 text-sm text-foreground/70 mb-6">
            <p>Submit work for evaluation</p>
            <p>Enter selection rounds</p>
            <p>Compete for standing</p>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-sm text-foreground/60 mb-4">
              Curator access is granted by invitation.
            </p>
            <p className="text-xs text-foreground/40">
              Not all applicants are approved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
