import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/ui";
import { BannersManager } from "@/components/admin/content/banners";
import { GalleryManager } from "@/components/admin/content/gallery";
import { AnnouncementForm, BenefitsForm } from "@/components/admin/content/list-forms";
import { SettingsForm, type FieldSpec } from "@/components/admin/content/settings-form";
import { requireStaff } from "@/lib/auth";
import { BANNERS, GALLERY } from "@/data/content";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Homepage & marketing" };

const SECTIONS = [
  { id: "announcement", label: "Announcement bar" },
  { id: "hero", label: "Banner slider" },
  { id: "ages", label: "Shop by age photos" },
  { id: "banners", label: "Promo banners" },
  { id: "brand-banner", label: "Brand banner" },
  { id: "promo", label: "Campaign / sale" },
  { id: "sections", label: "Section visibility" },
  { id: "shop-banner", label: "Shop page banner" },
  { id: "story", label: "Our Story page" },
  { id: "gallery", label: "Gallery" },
  { id: "copy", label: "Newsletter & gallery text" },
  { id: "products", label: "Featured products" },
];

export default async function MarketingPage() {
  await requireStaff();
  const settings = await getSettings();
  const bySort = <T extends { sortOrder: number; createdAt: Date }>(a: T, b: T) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime();
  const banners = [...BANNERS].sort(bySort);
  const gallery = [...GALLERY].sort(bySort);
  const { home, announcement } = settings;

  return (
    <>
      <PageHeader
        title="Homepage & marketing"
        description="Everything visitors see on the homepage — edit text, images and promotions without touching code."
        actions={
          <Link href="/" target="_blank" className="inline-flex h-9 items-center rounded-lg border border-[var(--adm-line)] bg-white px-3.5 text-[0.82rem] font-semibold transition-colors hover:border-[var(--adm-line-strong)]">
            Preview homepage ↗
          </Link>
        }
      />

      <nav aria-label="Sections" className="scrollbar-none sticky top-16 z-20 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-[#f6f5f2]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full border border-[var(--adm-line)] bg-white px-3.5 py-1.5 text-[0.8rem] font-semibold text-cocoa-600 hover:border-cocoa hover:text-cocoa">
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
          <Card title="Homepage banner slider" description="The full-width photo slides at the top of the homepage. Use wide, landscape photos (at least 1800px wide). Use *word* to set a word in the italic accent. Switch a slide off to hide it.">
            <SettingsForm
              settingKey="home"
              root="slider"
              initial={home.slider}
              submitLabel="Save slider"
              images={(["slide1", "slide2", "slide3", "slide4"] as const).map((k, i) => ({ path: `${k}.image`, label: `Slide ${i + 1} photograph`, aspect: "aspect-[16/9]" }))}
              fields={(["slide1", "slide2", "slide3", "slide4"] as const).flatMap((k, i) => bannerFields(k, i + 1))}
            />
          </Card>
        </div>

        <div id="ages" className="scroll-mt-32">
          <Card title="Shop by age photos" description="The four round photos under the slider (Newborn, Baby, Toddler, Little ones). Square photos work best.">
            <SettingsForm
              settingKey="home"
              root="ages"
              initial={home.ages}
              submitLabel="Save photos"
              images={[
                { path: "newborn", label: "Newborn", aspect: "aspect-square" },
                { path: "baby", label: "Baby", aspect: "aspect-square" },
                { path: "toddler", label: "Toddler", aspect: "aspect-square" },
                { path: "little", label: "Little ones", aspect: "aspect-square" },
              ]}
              fields={[]}
            />
          </Card>
        </div>

        <div id="shop-banner" className="scroll-mt-32">
          <Card title="Shop page banner" description="The full-width photo slides at the top of the Shop page. Use wide photos; *word* sets the italic accent.">
            <SettingsForm
              settingKey="home"
              root="shopSlider"
              initial={home.shopSlider}
              submitLabel="Save shop banner"
              images={(["slide1", "slide2", "slide3"] as const).map((k, i) => ({ path: `${k}.image`, label: `Slide ${i + 1} photograph`, aspect: "aspect-[16/9]" }))}
              fields={(["slide1", "slide2", "slide3"] as const).flatMap((k, i) => bannerFields(k, i + 1))}
            />
          </Card>
        </div>

        <div id="prelaunch-photo" className="scroll-mt-32">
          <Card title="Pre-launch page photo" description="Shown on the coming-soon page while pre-launch mode is on.">
            <SettingsForm
              settingKey="home"
              root="hero"
              initial={home.hero}
              submitLabel="Save photo"
              images={[{ path: "image", label: "Photograph", aspect: "aspect-[4/5]" }]}
              fields={[{ path: "imageAlt", label: "Photograph description (alt text)", wide: true }]}
            />
          </Card>
        </div>

        <div id="story" className="scroll-mt-32">
          <Card title="Our Story page" description="The photo, heading and intro on the Our Story page. Please don't add manufacturing or sustainability claims you can't verify.">
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
          <Card title="What we care about" description="The first three are shown as cards on the Our Story page.">
            <BenefitsForm initial={home.benefits} />
          </Card>
        </div>

        <div id="banners" className="scroll-mt-32">
          <Card title="Promo banners" description="The two photo banners side by side on the homepage (the first two active ones). Use *word* in the title for the italic accent.">
            <BannersManager banners={banners} />
          </Card>
        </div>

        <div id="brand-banner" className="scroll-mt-32">
          <Card title="Brand banner" description="The full-width photo banner lower on the homepage.">
            <SettingsForm
              settingKey="home"
              root="brandBanner"
              initial={home.brandBanner}
              submitLabel="Save brand banner"
              images={[{ path: "image", label: "Photograph", aspect: "aspect-[16/9]" }]}
              fields={[
                { path: "eyebrow", label: "Small label" },
                { path: "title", label: "Heading", wide: true, hint: "Use *word* for the italic accent" },
                { path: "body", label: "Text", type: "textarea", rows: 2 },
                { path: "ctaLabel", label: "Button label" },
                { path: "ctaHref", label: "Button link", placeholder: "/about" },
                { path: "position", label: "Photo focus", hint: "Which part of the photo stays in view, e.g. 50% 50% (centre) or 50% 20% (top)" },
              ]}
            />
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

        <div id="promo" className="scroll-mt-32">
          <Card title="Campaign / sale banner" description="A large banner for Eid, 11.11 or a seasonal sale, with an optional countdown. Only switch it on when the offer is real.">
            <SettingsForm
              settingKey="home"
              root="promo"
              initial={home.promo}
              submitLabel="Save campaign banner"
              images={[{ path: "image", label: "Banner photograph", aspect: "aspect-[4/3]" }]}
              fields={[
                { path: "enabled", label: "Show the campaign banner on the homepage", type: "checkbox", wide: true },
                { path: "eyebrow", label: "Label", hint: "e.g. Eid edit · 11.11" },
                { path: "title", label: "Heading", wide: true },
                { path: "body", label: "Text", type: "textarea", rows: 2 },
                { path: "ctaLabel", label: "Button label" },
                { path: "ctaHref", label: "Button link", placeholder: "/collections/sale" },
                { path: "endsAt", label: "Countdown ends (optional)", type: "date", hint: "Leave empty for no countdown" },
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
                { path: "shopByAge", label: "Shop by age (round photos)", type: "checkbox" },
                { path: "categories", label: "Shop by category", type: "checkbox" },
                { path: "newArrivals", label: "New arrivals (with tabs)", type: "checkbox" },
                { path: "banners", label: "Two promo banners", type: "checkbox" },
                { path: "bestSellers", label: "Best sellers", type: "checkbox" },
                { path: "brandBanner", label: "Brand banner", type: "checkbox" },
                { path: "trust", label: "Trust strip (COD, delivery, exchanges)", type: "checkbox" },
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

/** Form fields for one photo banner slide (settings paths like "slide1.title"). */
function bannerFields(k: string, n: number): FieldSpec[] {
  return [
    { type: "heading", label: `Slide ${n}` },
    { path: `${k}.enabled`, label: "Show this slide", type: "checkbox", wide: true },
    { path: `${k}.eyebrow`, label: "Small label" },
    {
      path: `${k}.text`,
      label: "Text colour",
      type: "select",
      options: [
        { value: "light", label: "Light text — for darker photos" },
        { value: "dark", label: "Dark text — for light photos" },
      ],
    },
    { path: `${k}.title`, label: "Heading", wide: true, hint: "Use *word* for the italic accent" },
    { path: `${k}.body`, label: "Text (hidden on phones)", type: "textarea", rows: 2 },
    { path: `${k}.ctaLabel`, label: "Button label" },
    { path: `${k}.ctaHref`, label: "Button link", placeholder: "/shop" },
    { path: `${k}.imageAlt`, label: "Photograph description (alt text)", wide: true },
    { path: `${k}.position`, label: "Photo focus on computers", hint: "e.g. 50% 50% (centre), 30% 50% (more left)" },
    { path: `${k}.mobilePosition`, label: "Photo focus on phones", hint: "Leave empty to use the computer setting" },
  ];
}
