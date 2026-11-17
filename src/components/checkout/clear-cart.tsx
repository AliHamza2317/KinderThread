"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";

export function ClearCart() {
  useEffect(() => {
    const run = () => {
      useCart.getState().clear();
      // drop ?placed=1 so a later refresh doesn't empty a new bag
      window.history.replaceState(null, "", window.location.pathname);
    };
    if (useCart.persist.hasHydrated()) run();
    else return useCart.persist.onFinishHydration(run);
  }, []);
  return null;
}
