import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeEach } from "vitest";

/**
 * Every test file gets a throw-away MongoDB running in memory, and the environment
 * variables the app needs — set before the app is imported.
 */
const mongo = await MongoMemoryServer.create();

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = mongo.getUri("kinder-thread-test");
process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-the-checks-0123456789";

const { clearSettingsCache } = await import("../src/modules/content/settings.service.js");

// start each test from an empty database
beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
  }
  clearSettingsCache();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
