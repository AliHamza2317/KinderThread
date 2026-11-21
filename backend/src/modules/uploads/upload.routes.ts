import { put } from "@vercel/blob";
import express, { Router, type Request, type Response } from "express";
import { env } from "../../config/env.js";
import { badRequest, HttpError } from "../../lib/http-error.js";
import { slugify } from "../../lib/text.js";

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * POST /api/admin/uploads?name=linen-shirt — the image file is the request body
 * (Content-Type: image/jpeg|png|webp|avif, up to 4 MB). Files are stored in Vercel Blob,
 * because a Vercel Function can't keep files on its own disk. Returns { url }.
 */
export async function uploadImage(req: Request, res: Response) {
  if (!env.BLOB_READ_WRITE_TOKEN) {
    throw new HttpError(503, "Image uploads aren't set up yet. Connect a Vercel Blob store (BLOB_READ_WRITE_TOKEN).");
  }
  const contentType = String(req.headers["content-type"] ?? "").split(";")[0].trim();
  const extension = IMAGE_TYPES[contentType];
  if (!extension) throw badRequest("Upload a JPG, PNG, WebP or AVIF image.");
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) throw badRequest("Send the image file as the request body.");

  const name = slugify(String(req.query.name ?? "")) || "image";
  const blob = await put(`products/${name}.${extension}`, req.body, {
    access: "public",
    addRandomSuffix: true,
    contentType,
    token: env.BLOB_READ_WRITE_TOKEN,
  });
  res.status(201).json({ url: blob.url });
}

export const uploadAdminRouter = Router();

uploadAdminRouter.post("/", express.raw({ type: Object.keys(IMAGE_TYPES), limit: "4mb" }), uploadImage);
