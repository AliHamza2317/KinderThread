"use client";

import { useEffect } from "react";
import { syncWishlistAction } from "@/actions/storefront";
import { useWishlist } from "@/stores/wishlist";

/** Merge the guest wishlist into the account once signed in. */
export function WishlistSync({ signedIn }: { signedIn: boolean }) {
  useEffect(() => {
    if (!signedIn) return;
    const run = () =>
      syncWishlistAction(useWishlist.getState().ids)
        .then((ids) => ids && useWishlist.getState().set(ids))
        .catch(() => {});
    if (useWishlist.persist.hasHydrated()) run();
    else return useWishlist.persist.onFinishHydration(run);
  }, [signedIn]);
  return null;
}
