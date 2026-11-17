"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { searchAction } from "@/actions/storefront";
import { Price } from "@/components/ui/price";
import { useDebounced, useLockScroll } from "@/lib/hooks";
import { useUi } from "@/stores/ui";
import type { NavCategory } from "./types";

type Result = Awaited<ReturnType<typeof searchAction>>;

export function SearchOverlay({ categories }: { categories: NavCategory[] }) {
  const open = useUi((s) => s.searchOpen);
  const setSearch = useUi((s) => s.setSearch);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  const dq = useDebounced(q, 220);
  useLockScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearch(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setSearch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setSearch]);

  useEffect(() => {
    if (dq.trim().length < 2) {
      setRes(null);
      return;
    }
    let cancelled = false;
    start(async () => {
      const r = await searchAction(dq);
      if (!cancelled) setRes(r);
    });
    return () => {
      cancelled = true;
    };
  }, [dq]);

  const close = () => setSearch(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    close();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-lenis-prevent>
          <div className="absolute inset-0 bg-cocoa-900/30 backdrop-blur-sm" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="relative max-h-[90dvh] overflow-y-auto bg-cream shadow-lift"
          >
            <div className="container-kt py-6 md:py-10">
              <form onSubmit={submit} className="flex items-center gap-3 border-b-2 border-cocoa pb-3" role="search">
                <Search className="h-6 w-6 shrink-0 text-cocoa-500" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search rompers, dresses, SKU…"
                  className="min-w-0 flex-1 bg-transparent font-display text-2xl placeholder:text-cocoa-300 focus:outline-none md:text-4xl"
                  aria-label="Search products"
                  enterKeyHint="search"
                />
                {pending && <span className="text-xs text-cocoa-400">Searching…</span>}
                <button type="button" onClick={close} className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-cocoa-50" aria-label="Close search">
                  <X className="h-5 w-5" />
                </button>
              </form>

              {!res ? (
                <div className="mt-8">
                  <p className="eyebrow mb-4">Popular</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 7).map((c) => (
                      <Link key={c.id} href={`/collections/${c.slug}`} onClick={close} className="rounded-[3px] border border-cocoa-100 px-4 py-2 text-sm font-semibold transition hover:border-cocoa hover:bg-cocoa hover:text-cream">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : res.products.length === 0 && res.categories.length === 0 ? (
                <p className="mt-8 text-cocoa-500">No results for “{dq}”. Try a different word, like “romper” or “dress”.</p>
              ) : (
                <div className="mt-8 grid gap-8 md:grid-cols-12">
                  {res.categories.length > 0 && (
                    <div className="md:col-span-3">
                      <p className="eyebrow mb-4">Categories</p>
                      <ul className="space-y-2">
                        {res.categories.map((c) => (
                          <li key={c.slug}>
                            <Link href={`/collections/${c.slug}`} onClick={close} className="font-display text-xl hover:text-coral-600">
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className={res.categories.length ? "md:col-span-9" : "md:col-span-12"}>
                    <p className="eyebrow mb-4">Products · {res.total}</p>
                    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                      {res.products.map((p) => (
                        <li key={p.id}>
                          <Link href={`/products/${p.slug}`} onClick={close} className="group block">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-cream-100">
                              {p.images[0] && <Image src={p.images[0].url} alt={p.images[0].alt} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                            </div>
                            <p className="mt-2 text-sm font-semibold leading-snug">{p.name}</p>
                            <Price price={p.price} compareAt={p.compareAtPrice} size="sm" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {res.total > res.products.length && (
                      <Link href={`/search?q=${encodeURIComponent(dq)}`} onClick={close} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sage-700">
                        View all {res.total} results <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
