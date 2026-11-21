import mongoose from "mongoose";
import { env } from "../config/env.js";

/**
 * One shared connection per process. On Vercel the same function instance serves many
 * requests, so the promise is cached and reused instead of reconnecting every time.
 */
let connection: Promise<typeof mongoose> | null = null;

export function connectDb(): Promise<typeof mongoose> {
  if (!connection) {
    connection = mongoose
      .connect(env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((error: unknown) => {
        connection = null; // let the next request try again
        throw error;
      });
  }
  return connection;
}

export async function disconnectDb(): Promise<void> {
  connection = null;
  await mongoose.disconnect();
}
