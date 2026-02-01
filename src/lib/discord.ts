export function getDiscordId(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const incoming = params.get("discord");

  if (incoming) {
    localStorage.setItem("discord_user_id", incoming);
    return incoming;
  }

  return localStorage.getItem("discord_user_id");
}
