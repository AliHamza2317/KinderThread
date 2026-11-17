import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { db } from "@/lib/db";

/**
 * Media storage adapter.
 *  - Default: local disk under ./uploads, served by the /media/* route (fine for a VPS).
 *  - Set CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud> for serverless / CDN hosting.
 */
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export type StoredMedia = { url: string; width?: number; height?: number; size: number };

export async function storeImage(file: File, folder = "products"): Promise<StoredMedia> {
  if (!ALLOWED.has(file.type)) throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  if (file.size > MAX_BYTES) throw new Error("Images must be 10 MB or smaller");
  const input = Buffer.from(await file.arrayBuffer());

  // Normalise: honour EXIF rotation, strip metadata (privacy), cap at 2400px, encode WebP.
  const pipeline = sharp(input, { failOn: "error" }).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
  const output = await pipeline.webp({ quality: 86 }).toBuffer({ resolveWithObject: true });
  const { width, height, size } = output.info;

  let url: string;
  if (process.env.CLOUDINARY_URL) {
    url = await uploadToCloudinary(output.data, folder);
  } else {
    const safeFolder = folder.replace(/[^a-z0-9-]/gi, "");
    const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.webp`;
    const dir = path.join(UPLOAD_DIR, safeFolder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), output.data);
    url = `/media/${safeFolder}/${name}`;
  }

  await db.media.create({
    data: { url, filename: file.name.slice(0, 200), mimeType: "image/webp", size, width, height },
  });
  return { url, width, height, size };
}

async function uploadToCloudinary(data: Buffer, folder: string) {
  const parsed = new URL(process.env.CLOUDINARY_URL!);
  const apiKey = decodeURIComponent(parsed.username);
  const apiSecret = decodeURIComponent(parsed.password);
  const cloud = parsed.hostname;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = `folder=kinder-thread/${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(params + apiSecret).digest("hex");
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(data)], { type: "image/webp" }));
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", `kinder-thread/${folder}`);
  form.append("signature", signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status})`);
  const json = (await res.json()) as { secure_url: string };
  return json.secure_url;
}
