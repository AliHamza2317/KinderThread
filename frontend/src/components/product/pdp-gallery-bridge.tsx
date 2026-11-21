"use client";

import { useEffect, useState } from "react";
import { ProductGallery } from "./gallery";

/** Listens for colour changes from the purchase panel so the gallery follows the selected colour. */
export function GalleryBridge(props: { images: { id: string; url: string; alt: string; colorId: string | null }[]; name: string }) {
  const [colorId, setColorId] = useState<string | null>(null);
  useEffect(() => {
    const on = (e: Event) => setColorId((e as CustomEvent<string | null>).detail);
    window.addEventListener("kt:color", on);
    return () => window.removeEventListener("kt:color", on);
  }, []);
  return <ProductGallery {...props} activeColorId={colorId} />;
}
