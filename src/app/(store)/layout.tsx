import { redirect } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { QuickAddModal } from "@/components/product/quick-add";
import { getNavCategories } from "@/lib/catalog";
import { PAGES_DATA } from "@/data/content";
import { getSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getNavCategories()]);
  const pages = PAGES_DATA.filter((p) => p.isPublished).map((p) => ({ slug: p.slug, title: p.title }));
  // pre-launch mode is switched on in src/lib/settings.ts (prelaunch.enabled)
  if (settings.prelaunch.enabled) redirect("/coming-soon");

  const messages = settings.announcement.enabled ? settings.announcement.messages.filter((m) => m.text.trim()) : [];

  return (
    <>
      <AnnouncementBar messages={messages} />
      <Header categories={categories.filter((c) => c.showInNav)} signedIn={false} />
      <main id="main">{children}</main>
      <Footer settings={settings} categories={categories.filter((c) => c.kind === "category")} pages={pages} />
      <MobileMenu categories={categories} signedIn={false} />
      <SearchOverlay categories={categories} />
      <CartDrawer freeThreshold={settings.shipping.freeThreshold} />
      <QuickAddModal />
      <SmoothScroll enabled={settings.features.smoothScroll} />
    </>
  );
}
