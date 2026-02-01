import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadDir = path.join(process.cwd(), ".tmp", "uploads");
const maxBytes = 25 * 1024 * 1024; // 25MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  const isAudio = file.type.startsWith("audio/");
  const isImage = file.type.startsWith("image/");

  if (!isAudio && !isImage) {
    return Response.json(
      { error: "Only audio and image files are supported" },
      { status: 415 }
    );
  }

  if (file.size > maxBytes) {
    return Response.json(
      { error: "File too large (max 25MB)" },
      { status: 413 }
    );
  }

  const ext = path.extname(file.name || "").slice(0, 8);
  const id = `${Date.now()}-${randomUUID()}${ext}`;
  const dest = path.join(uploadDir, id);

  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  return Response.json({ url: `/api/uploads/${id}` });
}
