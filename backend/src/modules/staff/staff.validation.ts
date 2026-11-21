import { z } from "zod";
import { email } from "../../lib/fields.js";

export const STAFF_ROLES = ["ADMIN", "STAFF"] as const;

/** Staff passwords are a little longer than customers'. */
const staffPassword = z.string().min(10, "Use at least 10 characters.").max(200);

export const createStaffInput = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(80),
  email,
  role: z.enum(STAFF_ROLES),
  password: staffPassword,
});

export const roleInput = z.object({ role: z.enum(STAFF_ROLES) });
export const activeInput = z.object({ isActive: z.boolean() });
export const resetPasswordInput = z.object({ password: staffPassword });

export type CreateStaffInput = z.infer<typeof createStaffInput>;
