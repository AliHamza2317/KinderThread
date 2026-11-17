import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/ui";
import { BannersManager } from "@/components/admin/content/banners";
import { GalleryManager } from "@/components/admin/content/gallery";
import { AnnouncementForm, BenefitsForm } from "@/components/admin/content/list-forms";
import { SettingsForm } from "@/components/admin/content/settings-form";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Homepage & marketing" };

const SECTIONS = [
  { id: "announcement", label: "Announcement bar" },
  { id: "hero", label: "Hero" },
  { id: "story", label: "Brand story" },
  { id: "benefits", label: "Why Kinder Thread" },
  { id: "banners", label: "Banners" },
  { id: "gallery", label: "Gallery" },
  { id: "copy", label: "Newsletter & gallery text" },
  { id: "sections", label: "Section visibility" },
  { id: "products", label: "Featured products" },
];

export default async function MarketingPage() {
  await requireStaff();
  const [settings, banners, gallery] = await Promise.all([
    getSettings(),
    db.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
  ]);
  const { home, announcement } = settings;

  return (
    <>
      <PageHeader
        title="Homepage & marketing"
        description="Everything visitors see on the homepage — edit text, images and promotions without touching code."
        actions={
          <Link href="/" target="_blank" className="rounded-full border border-cocoa-200 px-4 py-2 text-sm font-semibold hover:border-cocoa">
            Preview homepage ↗
          </Link>
        }
      />

      <nav aria-label="Sections" className="scrollbar-none sticky top-16 z-20 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-cream/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full border border-cocoa-100 bg-white/70 px-3.5 py-1.5 text-[0.8rem] font-semibold text-cocoa-600 hover:border-cocoa hover:text-cocoa">
            {s.label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        <div id="announcement" className="scroll-mt-32">
          <Card title="Announcement bar" description="The slim bar above the navigation. Use it for welcome messages, delivery offers or launches.">
            <AnnouncementForm initial={{ enabled: announcement.enabled, messages: announcement.messages.map((m) => ({ text: m.text, href: m.href ?? "" })) }} />
          </Card>
        </div>

        <div id="hero" className="scroll-mt-32">
          <Card title="Hero" description="The first thing visitors see: a large photograph with your headline and buttons.">
            <SettingsForm
              settingKey="home"
              root="hero"
              initial={home.hero}
              submitLabel="Save hero"
              images={[{ path: "image", label: "Hero photograph", aspect: "aspect-[4/5]" }]}
              fields={[
                { path: "eyebrow", label: "Eyebrow", hint: "Short label above the heading" },
                { path: "heading", label: "Heading", wide: true },
                { path: "subheading", label: "Supporting text", type: "textarea" },
                { path: "imageAlt", label: "Photograph description (alt text)", wide: true },
                { type: "heading", label: "Buttons" },
                { path: "primary.label", label: "Primary button label" },
                { path: "primary.href", label: "Primary button link", placeholder: "/shop" },
                { path: "secondary.label", label: "Secondary button label" },
                { path: "secondary.href", label: "Secondary button link", placeholder: "/about" },
              ]}
            />
          </Card>
        </div>

        <div id="story" className="scroll-mt-32">
          <Card title="Brand story" description="The editorial “Made for Little Moments.” section. Please don't add manufacturing or sustainability claims you can't verify.">
            <SettingsForm
              settingKey="home"
              root="story"
              initial={home.story}
              submitLabel="Save brand story"
              images={[
                { path: "image", label: "Main image", aspect: "aspect-[4/5]" },
                { path: "image2", label: "Detail image", aspect: "aspect-[4/5]" },
              ]}
              fields={[
                { path: "eyebrow", label: "Eyebrow" },
                { path: "heading", label: "Heading" },
                { path: "body", label: "Body text", type: "textarea", rows: 4 },
                { path: "imageAlt", label: "Main image description (alt text)" },
                { path: "image2Alt", label: "Detail image description (alt text)" },
                {
                  path: "imagesAreSamples",
                  label: "Show a “Placeholder imagery” note",
                  type: "checkbox",
                  wide: true,
                  hint: "Optional small note under the story photos while you use placeholder photography.",
                },
                { path: "cta.label", label: "Link label" },
                { path: "cta.href", label: "Link URL", placeholder: "/about" },
              ]}
            />
          </Card>
        </div>

        <div id="benefits" className="scroll-mt-32">
          <Card title="Why Kinder Thread" description="Up to 8 benefits shown as a row of icons.">
            <BenefitsForm initial={home.benefits} />
          </Card>
        </div>

        <div id="banners" className="scroll-mt-32">
          <Card title="Promotional banners" description="Image tiles that link to a collection or campaign. Only active banners are shown.">
            <BannersManager banners={banners} />
          </Card>
        </div>

        <div id="gallery" className="scroll-mt-32">
          <Card title="Instagram gallery" description="Images for the “Follow Our Little World” section. Link each one to its Instagram post if you like.">
            <GalleryManager images={gallery} />
          </Card>
        </div>

        <div id="copy" className="scroll-mt-32">
          <Card title="Newsletter & gallery text">
            <SettingsForm
              settingKey="home"
              initial={{ newsletter: home.newsletter, gallery: home.gallery }}
              submitLabel="Save text"
              fields={[
                { type: "heading", label: "Newsletter section" },
                { path: "newsletter.heading", label: "Heading", wide: true },
                { path: "newsletter.body", label: "Text", type: "textarea" },
                { type: "heading", label: "Gallery section", hint: "The Instagram link and handle are set in Settings → Social." },
                { path: "gallery.heading", label: "Heading", wide: true },
                { path: "gallery.body", label: "Text", type: "textarea", rows: 2 },
              ]}
            />
          </Card>
        </div>

        <div id="sections" className="scroll-mt-32">
          <Card title="Section visibility" description="Hide a homepage section without losing its content.">
            <SettingsForm
              settingKey="home"
              root="sections"
              initial={home.sections}
              submitLabel="Save visibility"
              fields={[
                { path: "categories", label: "Featured categories", type: "checkbox" },
                { path: "newArrivals", label: "New arrivals", type: "checkbox" },
                { path: "story", label: "Brand story", type: "checkbox" },
                { path: "shopByAge", label: "Shop by age", type: "checkbox" },
                { path: "bestSellers", label: "Best sellers", type: "checkbox" },
                { path: "banners", label: "Promotional banners", type: "checkbox" },
                { path: "benefits", label: "Why Kinder Thread", type: "checkbox" },
                { path: "gallery", label: "Instagram gallery", type: "checkbox" },
                { path: "newsletter", label: "Newsletter sign-up", type: "checkbox" },
              ]}
            />
          </Card>
        </div>

        <div id="products" className="scroll-mt-32">
          <Card title="Featured, new & best-selling products">
            <p className="text-sm text-cocoa-600">
              Which products appear in <strong>New Arrivals</strong>, <strong>Best Sellers</strong> and featured spots is controlled per product. Open a product in{" "}
              <Link href="/admin/products" className="font-semibold text-sage-700 underline underline-offset-2">
                Products
              </Link>{" "}
              and tick <em>Featured</em>, <em>New arrival</em> or <em>Best seller</em>. Coupons live under{" "}
              <Link href="/admin/coupons" className="font-semibold text-sage-700 underline underline-offset-2">
                Coupons
              </Link>
              .
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
