"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/overlay";
import { cn } from "@/lib/utils";

type Img = { id: string; url: string; alt: string; colorId: string | null };

export function ProductGallery({ images, name, activeColorId }: { images: Img[]; name: string; activeColorId: string | null }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const count = images.length;

  const go = useCallback(
    (i: number, smooth = true) => {
      const n = (i + count) % count;
      setIndex(n);
      const el = track.current;
      if (el) el.scrollTo({ left: n * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    },
    [count],
  );

  // jump to the first photo of a newly selected colour
  useEffect(() => {
    if (!activeColorId) return;
    const i = images.findIndex((im) => im.colorId === activeColorId);
    if (i >= 0) go(i);
  }, [activeColorId, images, go]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  if (!count) return <div className="aspect-[4/5] rounded-sm bg-cream-100" />;

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {count > 1 && (
        <ul className="scrollbar-none flex gap-3 overflow-x-auto md:max-h-[680px] md:w-20 md:flex-col md:overflow-y-auto" aria-label="Product images">
          {images.map((im, i) => (
            <li key={im.id} className="shrink-0">
              <button
                onClick={() => go(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index}
                className={cn("relative block aspect-[4/5] w-16 overflow-hidden rounded-sm bg-cream-100 transition md:w-20", i === index ? "ring-2 ring-cocoa ring-offset-2 ring-offset-cream" : "opacity-70 hover:opacity-100")}
              >
                <Image src={im.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative min-w-0 flex-1">
        <div
          ref={track}
          onScroll={onScroll}
          className="scrollbar-none flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-sm bg-cream-100"
          role="region"
          aria-roledescription="carousel"
          aria-label={`${name} images`}
        >
          {images.map((im, i) => (
            <div
              key={im.id}
              className="relative h-full w-full shrink-0 snap-center overflow-hidden"
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse" || i !== index) return;
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
              onPointerLeave={() => setZoom(null)}
              onClick={() => setLightbox(true)}
              aria-hidden={i !== index}
            >
              <Image
                src={im.url}
                alt={im.alt || name}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="cursor-zoom-in object-cover transition-transform duration-300 ease-out"
                style={zoom && i === index ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </div>
          ))}
        </div>
        {count > 1 && (
          <>
            <button onClick={() => go(index - 1)} className="absolute top-1/2 left-3 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream-50/90 shadow-soft hover:bg-white md:grid" aria-label="Previous image">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(index + 1)} className="absolute top-1/2 right-3 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream-50/90 shadow-soft hover:bg-white md:grid" aria-label="Next image">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden" aria-hidden>
              {images.map((im, i) => (
                <span key={im.id} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-cocoa" : "w-1.5 bg-cocoa/30")} />
              ))}
            </div>
          </>
        )}
        <button onClick={() => setLightbox(true)} className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-cream-50/90 shadow-soft hover:bg-white" aria-label="View full screen">
          <Expand className="h-4 w-4" />
        </button>
      </div>

      <Modal open={lightbox} onClose={() => setLightbox(false)} title={name} className="sm:max-w-4xl">
        <div className="relative aspect-[4/5] max-h-[78dvh] w-full overflow-hidden rounded-md bg-cream-100">
          <Image src={images[index].url} alt={images[index].alt || name} fill sizes="90vw" className="object-contain" />
        </div>
        {count > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => go(index - 1, false)} className="grid h-11 w-11 place-items-center rounded-full border border-cocoa-100 hover:border-cocoa" aria-label="Previous image">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-cocoa-500">
              {index + 1} / {count}
            </span>
            <button onClick={() => go(index + 1, false)} className="grid h-11 w-11 place-items-center rounded-full border border-cocoa-100 hover:border-cocoa" aria-label="Next image">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
