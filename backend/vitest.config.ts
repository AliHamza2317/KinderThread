import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // the test files share one in-memory MongoDB per file; run them one after another
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 180_000,
  },
});
