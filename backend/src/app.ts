import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { connectDb } from "./db/connect.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes.js";

/**
 * The Express application.
 * - On Vercel this file is the entry point: its default export becomes one Vercel Function.
 * - Locally, src/local-server.ts imports it and listens on a port.
 */
const app = express();

app.set("trust proxy", 1); // behind Vercel's proxy, so rate limits see the visitor's IP
app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ name: "Kinder Thread API", health: "/api/health" });
});

// for uptime checks: 200 when the database answers, 503 when it doesn't
app.get("/api/health", async (_req, res) => {
  try {
    await connectDb();
    await mongoose.connection.db?.admin().ping();
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "not connected" });
  }
});

// every other /api request needs MongoDB; the connection is opened once and then reused
app.use("/api", async (_req, _res, next) => {
  await connectDb();
  next();
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
