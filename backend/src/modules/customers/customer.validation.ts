import { z } from "zod";
import { paging } from "../../lib/pagination.js";

export const customerQuery = z.object({
  q: z.string().trim().max(80).optional(),
  ...paging(),
});

/** "VIP, Repeat buyer" → ["vip", "repeat-buyer"] */
export const tagsInput = z.object({
  tags: z
    .array(z.string())
    .max(20, "Use up to 20 tags.")
    .transform((tags) => [...new Set(tags.map((t) => t.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")).filter(Boolean))])
    .refine((tags) => tags.every((t) => t.length <= 30), "Tags can be up to 30 characters."),
});

export const activeInput = z.object({ isActive: z.boolean() });
