import { z } from "zod";
import { paging } from "../../lib/pagination.js";
import { RETURN_REASONS, RETURN_STATUSES, RETURN_TYPES } from "./return.model.js";

export const returnRequestInput = z.object({
  type: z.enum(RETURN_TYPES, { message: "Choose return or exchange." }),
  reason: z.enum(RETURN_REASONS, { message: "Choose a reason." }),
  details: z.string().trim().max(1000, "Please keep it under 1000 characters.").nullish().transform((v) => v || null),
});

export const adminReturnQuery = z.object({
  status: z.enum(RETURN_STATUSES).optional(),
  ...paging(),
});

export const returnUpdateInput = z.object({
  status: z.enum(RETURN_STATUSES).optional(),
  adminNote: z.string().trim().max(1000).optional(),
  markOrderReturned: z.boolean().default(false),
  restock: z.boolean().default(true),
});

export type ReturnRequestInput = z.infer<typeof returnRequestInput>;
