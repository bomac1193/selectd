const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://selectr.vercel.app";
const webhook = process.env.DISCORD_WEBHOOK_URL;

if (!webhook) {
  console.error("Missing DISCORD_WEBHOOK_URL");
  process.exit(1);
}

const res = await fetch(
  `${baseUrl}/api/leaderboard?type=XP&limit=5`,
  {
    headers: { "Content-Type": "application/json" },
  }
);

if (!res.ok) {
  console.error("Failed to fetch leaderboard", await res.text());
  process.exit(1);
}

const data = await res.json();
const entries = data.leaderboard?.entries || [];

const lines = entries.map(
  (entry, index) =>
    `**${index + 1}. ${entry.username || entry.name || "Player"}** — ${Math.round(entry.score)} XP`
);

const payload = {
  content:
    `🏆 **SELECTR Daily Leaderboard**\n\n${lines.join("\n") || "No data yet."}`,
};

const send = await fetch(webhook, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

if (!send.ok) {
  console.error("Failed to post to Discord", await send.text());
  process.exit(1);
}

console.log("Leaderboard posted.");
