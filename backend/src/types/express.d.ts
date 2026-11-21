import type { AuthUser } from "../middleware/auth.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by the auth middleware for signed-in requests. */
      user?: AuthUser;
    }
  }
}

export {};
