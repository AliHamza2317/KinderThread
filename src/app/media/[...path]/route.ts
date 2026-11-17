import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/storage";

/** Serves files uploaded through the admin (local storage driver). */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const rel = parts.join("/");
  if (!/^[a-z0-9-]+\/[a-z0-9-]+\.(webp|png|jpe?g|avif|gif)$/i.test(rel)) return new Response("Not found", { status: 404 });
  const file = path.join(UPLOAD_DIR, rel);
  if (!file.startsWith(UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });
  try {
    await stat(file);
    const data = await readFile(file);
    const ext = path.extname(file).slice(1).toLowerCase();
    const type = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
