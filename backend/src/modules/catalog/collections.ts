/**
 * Automatic collections: they have no category document — products appear in them
 * because of a flag (new arrival, best seller) or a sale price.
 */
export const VIRTUAL_COLLECTIONS = {
  "new-arrivals": {
    name: "New Arrivals",
    description: "Fresh pieces for the new season — soft colours, easy fits.",
    filter: { isNewArrival: true },
  },
  "best-sellers": {
    name: "Best Sellers",
    description: "The styles little ones (and their grown-ups) love most.",
    filter: { isBestSeller: true },
  },
  sale: {
    name: "On Sale",
    description: "Little treasures at little prices, while sizes last.",
    filter: { compareAtPrice: { $ne: null } },
  },
} as const;

export type VirtualCollectionSlug = keyof typeof VIRTUAL_COLLECTIONS;

export const isVirtualCollection = (slug: string): slug is VirtualCollectionSlug => slug in VIRTUAL_COLLECTIONS;
