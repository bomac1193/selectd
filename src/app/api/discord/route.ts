import { NextResponse } from "next/server";
import nacl from "tweetnacl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyDiscordRequest(
  body: string,
  signature: string,
  timestamp: string
) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY || "";
  if (!publicKey) return false;

  const message = Buffer.from(timestamp + body);
  const sig = Buffer.from(signature, "hex");
  const key = Buffer.from(publicKey, "hex");
  return nacl.sign.detached.verify(message, sig, key);
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-signature-ed25519") || "";
  const timestamp = req.headers.get("x-signature-timestamp") || "";
  const body = await req.text();

  if (!verifyDiscordRequest(body, signature, timestamp)) {
    return new Response("Bad signature", { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Discord PING
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // Slash commands
  if (interaction.type === 2 && interaction.data?.name === "battle") {
    const options = interaction.data.options || [];
    const track1 =
      options.find((opt: { name: string }) => opt.name === "track1")?.value ||
      "Track A";
    const track2 =
      options.find((opt: { name: string }) => opt.name === "track2")?.value ||
      "Track B";

    const base =
      process.env.NEXT_PUBLIC_APP_URL || "https://selectd.vercel.app";
    const url = new URL("/battle", base);
    url.searchParams.set("track1", String(track1));
    url.searchParams.set("track2", String(track2));
    const discordUserId =
      interaction.user?.id || interaction.member?.user?.id;
    if (discordUserId) {
      url.searchParams.set("discord", String(discordUserId));
    }

    return NextResponse.json({
      type: 4,
      data: {
        content: `🎵 **${track1}** vs **${track2}** 🎵\nProve your taste.`,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: "⚔️ Battle Now",
                url: url.toString(),
              },
            ],
          },
        ],
      },
    });
  }

  return NextResponse.json({ type: 4, data: { content: "Unknown command." } });
}
