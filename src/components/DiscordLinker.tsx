"use client";

import { useEffect } from "react";
import { getDiscordId } from "@/lib/discord";
import { apiFetch } from "@/lib/api";

export function DiscordLinker() {
  useEffect(() => {
    const discordId = getDiscordId();
    if (!discordId) return;

    const linked = localStorage.getItem("discord_linked");
    if (linked === discordId) return;

    const link = async () => {
      try {
        const res = await apiFetch("/api/discord/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discordId }),
        });

        if (res.ok) {
          localStorage.setItem("discord_linked", discordId);
        }
      } catch {
        // ignore
      }
    };

    void link();
  }, []);

  return null;
}
