/**
 * Shared Mongoose schema options: documents are sent to clients with `id` instead of
 * `_id` and without the internal `__v` field.
 */
export const toJSON = {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    return ret;
  },
};

/** Options for top-level collections: createdAt / updatedAt are added automatically. */
export const baseOptions = { timestamps: true, toJSON } as const;

/** Options for embedded documents (variants, addresses, order items …). */
export const subOptions = { toJSON };
