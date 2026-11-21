import app from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./db/connect.js";

/** Local development only (`npm run dev`). On Vercel, src/app.ts is used directly. */
await connectDb();

app.listen(env.PORT, () => {
  console.log(`Kinder Thread API running on http://localhost:${env.PORT}`);
});
