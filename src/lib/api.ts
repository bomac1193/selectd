import { getTelegramUser } from "@/lib/telegram";
import { getDiscordId } from "@/lib/discord";

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const user = getTelegramUser();
  const discordId = getDiscordId();

  if (user?.id) {
    headers.set("Authorization", `Telegram ${user.id}`);
    headers.set("X-Telegram-User-Id", String(user.id));
  }
  if (discordId) {
    headers.set("X-Discord-User-Id", discordId);
  }

  let url: RequestInfo | URL = input;
  if (user?.id && typeof input === "string" && typeof window !== "undefined") {
    const base = window.location.origin;
    const parsed = new URL(input, base);
    if (!parsed.searchParams.has("tg_id")) {
      parsed.searchParams.set("tg_id", String(user.id));
    }
    url = parsed.toString();
  }
  if (discordId && typeof input === "string" && typeof window !== "undefined") {
    const base = window.location.origin;
    const parsed = new URL(url.toString(), base);
    if (!parsed.searchParams.has("discord_id")) {
      parsed.searchParams.set("discord_id", discordId);
    }
    url = parsed.toString();
  }

  const options: RequestInit = { ...init, headers };
  if (!options.credentials) {
    options.credentials = "include";
  }

  return fetch(url, options);
}
