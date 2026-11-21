import type { Request, Response } from "express";
import { getDashboard } from "./dashboard.service.js";

/** GET /api/admin/dashboard */
export async function dashboard(_req: Request, res: Response) {
  res.json(await getDashboard());
}
