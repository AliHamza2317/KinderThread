import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { HttpError } from "../lib/http-error.js";

/** 404 for any /api route that doesn't exist. */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** MongoDB "duplicate key" (a unique field such as email or slug is already used). */
function duplicateField(error: unknown): string | null {
  if (typeof error !== "object" || error === null || (error as { code?: number }).code !== 11000) return null;
  const keys = Object.keys((error as { keyValue?: object }).keyValue ?? {});
  return keys[0] ?? "value";
}

/**
 * Turns every error into a JSON response: { message, errors? }.
 * Known errors keep their status; anything unexpected is logged and becomes a generic 500,
 * so internal details never reach the client.
 */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message, errors: error.errors });
    return;
  }

  const bodyError = (error as { type?: string })?.type;
  if (bodyError === "entity.parse.failed") {
    res.status(400).json({ message: "The request body is not valid JSON." });
    return;
  }
  if (bodyError === "entity.too.large") {
    res.status(413).json({ message: "The request is too large." });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Invalid ${error.path}.` });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.fromEntries(Object.entries(error.errors).map(([field, e]) => [field, [e.message]]));
    res.status(400).json({ message: "Please check the highlighted fields.", errors });
    return;
  }

  const field = duplicateField(error);
  if (field) {
    res.status(409).json({ message: `That ${field} is already in use.`, errors: { [field]: ["Already in use."] } });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Something went wrong on our side. Please try again." });
}
