export type Platform = "telegram" | "discord" | "web";

export function detectPlatform(): Platform {
  if (typeof window === "undefined") return "web";

  const tg = (window as any).Telegram?.WebApp;
  if (tg) return "telegram";

  const params = new URLSearchParams(window.location.search);
  const discordParam = params.get("discord");
  const discordStored = localStorage.getItem("discord_user_id");
  if (discordParam || discordStored) return "discord";

  return "web";
}
