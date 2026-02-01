export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const contentType = req.headers.get("content-type") || "application/json";
  const botPort =
    process.env.BOT_PORT || process.env.BOT_SERVER_PORT || "4589";

  try {
    const response = await fetch(`http://127.0.0.1:${botPort}/telegram/webhook`, {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "text/plain",
      },
    });
  } catch (error) {
    return new Response("Failed to forward webhook", { status: 500 });
  }
}
