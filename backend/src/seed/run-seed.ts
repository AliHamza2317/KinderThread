import { connectDb, disconnectDb } from "../db/connect.js";
import { seedDatabase } from "./seed.js";

/** `npm run seed` */
await connectDb();
await seedDatabase();
await disconnectDb();
console.log("Done.");
