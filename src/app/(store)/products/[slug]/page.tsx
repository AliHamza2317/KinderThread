import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { GalleryBridge } from "@/components/product/pdp-gallery-bridge";
import { ProductCard } from "@/components/product/product-card";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import type { SizeGuideData } from "@/components/product/size-guide";
import { Breadcrumbs } from "@/components/shop/shop-view";
import { AccordionItem } from "@/components/ui/accordion";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { sortSizes } from "@/lib/sizes";
import { absoluteUrl, formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const description = p.seoDescription || p.description.slice(0, 155);
  const image = p.images[0]?.url;
  return {
    title: p.seoTitle || p.name,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.name, description, type: "website", images: image ? [{ url: image, alt: p.images[0].alt }] : undefined },
    robots: p.isSample ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!p) notFound();
  const related = await getRelatedProducts(p.id, p.categories.map((c) => c.id));

  const variants = p.variants.map((v) => ({ id: v.id, size: v.size, colorId: v.colorId, stock: v.stock, price: v.price ?? p.price, sku: v.sku }));
  const sizes = sortSizes([...new Set(variants.map((v) => v.size))]);
  const skus = variants.map((v) => v.sku);
  const sizeGuide: SizeGuideData | null = p.sizeGuide
    ? { name: p.sizeGuide.name, unit: p.sizeGuide.unit, rows: (p.sizeGuide.rows as SizeGuideData["rows"]).filter((r) => sizes.includes(r.size) || sizes.length === 0), notes: p.sizeGuide.notes }
    : null;
  const primaryCat = p.categories[0];
  const url = absoluteUrl(`/products/${p.slug}`);
  const inStock = variants.some((v) => v.stock > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    sku: skus[0],
    image: p.images.map((i) => absoluteUrl(i.url)),
    brand: { "@type": "Brand", name: settings.store.name },
    category: primaryCat?.name,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "PKR",
      lowPrice: Math.min(...variants.map((v) => v.price), p.price),
      highPrice: Math.max(...variants.map((v) => v.price), p.price),
      offerCount: variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    },
  };

  return (
    <>
      {!p.isSample && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <div className="container-kt pt-6 pb-16 md:pt-10">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, ...(primaryCat ? [{ label: primaryCat.name, href: `/collections/${primaryCat.slug}` }] : []), { label: p.name }]}
        />
        {p.isSample && (
          <p className="mt-5 flex items-start gap-3 rounded-2xl bg-sun-50 px-4 py-3 text-[0.85rem] text-sun-700 ring-1 ring-sun-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Sample listing.</strong> This product and its illustration are placeholders used while our first collection is prepared — they are not actual Kinder Thread products.
            </span>
          </p>
        )}
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <GalleryBridge images={p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, colorId: i.colorId }))} name={p.name} />
            </div>
          </div>
          <div className="lg:col-span-5">
            <PurchasePanel
              product={{ id: p.id, slug: p.slug, name: p.name, price: p.price, compareAtPrice: p.compareAtPrice, isSample: p.isSample, isNewArrival: p.isNewArrival, colors: p.colors.map((c) => ({ id: c.id, name: c.name, hex: c.hex })), variants, images: p.images.map((i) => ({ url: i.url, colorId: i.colorId })) }}
              sizeGuide={sizeGuide}
              whatsapp={settings.store.whatsapp}
              info={{ freeThreshold: settings.shipping.freeThreshold, estimate: settings.shipping.estimate, cod: settings.payments.cod.enabled, returnDays: settings.policies.returnWindowDays }}
              url={url}
            />
            <div className="mt-8 border-t border-cocoa-100">
              <AccordionItem title="Description" defaultOpen>
                <p className="whitespace-pre-line">{p.description}</p>
                <p className="mt-3 text-[0.8rem] text-cocoa-500">SKU: {skus.length > 1 ? `${skus[0]} (varies by size & colour)` : skus[0] ?? "—"}</p>
              </AccordionItem>
              <AccordionItem title="Fabric & care">
                {p.fabric && (
                  <p>
                    <strong className="text-cocoa">Fabric:</strong> {p.fabric}
                  </p>
                )}
                <p className="mt-2">
                  <strong className="text-cocoa">Care:</strong> {p.care || settings.policies.careDefault}
                </p>
              </AccordionItem>
              <AccordionItem title="Delivery & cash on delivery">
                <p>
                  {settings.shipping.estimate}. Delivery is {formatPrice(settings.shipping.flatRate)}
                  {settings.shipping.freeThreshold > 0 && <>, free on orders of {formatPrice(settings.shipping.freeThreshold)} or more</>}.
                </p>
                {settings.payments.cod.enabled && <p className="mt-2">{settings.policies.codSummary}</p>}
                <Link href="/pages/shipping" className="mt-2 inline-block font-semibold text-sage-700 underline underline-offset-2">
                  Shipping policy
                </Link>
              </AccordionItem>
              <AccordionItem title="Returns & exchanges">
                <p>{settings.policies.returnsSummary}</p>
                <Link href="/pages/returns" className="mt-2 inline-block font-semibold text-sage-700 underline underline-offset-2">
                  Returns policy
                </Link>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-kt py-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="display-md mb-8">
            You may also like
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.id}>
                <ProductCard product={r} showSample={settings.features.showSampleBadges} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <RecentlyViewed excludeId={p.id} showSample={settings.features.showSampleBadges} />
    </>
  );
}
