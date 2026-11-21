import mongoose from "mongoose";
import { env } from "../config/env.js";

/**
 * One shared connection per process. On Vercel the same function instance serves many
 * requests, so the promise is cached and reused instead of reconnecting every time.
 * Mongoose makes sure the indexes exist when a model is first used (cheap when they do);
 * the unique ones (emails, slugs, SKUs, order numbers) are part of the data's safety.
 * Checkout uses transactions, so MongoDB must run as a replica set — Atlas always does.
 */
let connection: Promise<typeof mongoose> | null = null;

export function connectDb(): Promise<typeof mongoose> {
  if (!connection) {
    connection = mongoose
      .connect(env.MONGODB_URI, {
        // each Vercel instance keeps its own pool; small pools stay well inside Atlas connection limits
        maxPoolSize: 5,
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
