import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadDir = path.join(process.cwd(), ".tmp", "uploads");

const contentTypes: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rawId = id || "";
  const safeId = path.basename(rawId);

  if (!safeId || safeId !== rawId) {
    return new Response("Invalid file id", { status: 400 });
  }

  const filePath = path.join(uploadDir, safeId);

  try {
    await stat(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(safeId).toLowerCase();
  const contentType = contentTypes[ext] ?? "application/octet-stream";
  const data = await readFile(filePath);

  return new Response(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
