import { z } from "zod";

/**
 * All configuration comes from environment variables and is checked once at start-up,
 * so a missing or malformed value fails fast with a clear message.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string({ error: "is missing (your MongoDB connection string)" }).min(1, "is missing (your MongoDB connection string)"),
  JWT_SECRET: z.string({ error: "is missing (a long random secret)" }).min(32, "must be at least 32 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")} ${issue.message}`).join("\n");
  throw new Error(`Invalid environment variables:\n${problems}\nSee .env.example.`);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
