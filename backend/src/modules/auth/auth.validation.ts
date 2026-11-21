import { z } from "zod";
import { email, optionalPhone, password } from "../../lib/fields.js";

export const registerInput = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email,
  phone: optionalPhone.optional().transform((v) => v ?? null),
  password,
});

export const loginInput = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(200),
});

export type RegisterInput = z.infer<typeof registerInput>;
export type LoginInput = z.infer<typeof loginInput>;
