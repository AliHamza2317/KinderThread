import Link from "next/link";
import { redirect } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { WishlistSync } from "@/components/layout/wishlist-sync";
import { QuickAddModal } from "@/components/product/quick-add";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getNavCategories } from "@/lib/catalog";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, user, categories, pages] = await Promise.all([
    getSettings(),
    getCurrentUser(),
    getNavCategories(),
    db.page.findMany({ where: { isPublished: true }, select: { slug: true, title: true } }),
  ]);
  const staff = isStaff(user);
  if (settings.prelaunch.enabled && !staff) redirect("/coming-soon");

  const messages = settings.announcement.enabled ? settings.announcement.messages.filter((m) => m.text.trim()) : [];

  return (
    <>
      {settings.prelaunch.enabled && staff && (
        <div className="bg-sun-100 py-2 text-center text-[0.8rem] font-semibold text-sun-700">
          Pre-launch mode is ON — visitors see the coming-soon page. You are previewing the full store as staff.{" "}
          <Link href="/admin/settings" className="underline">
            Settings
          </Link>
        </div>
      )}
      <AnnouncementBar messages={messages} />
      <Header categories={categories.filter((c) => c.showInNav)} signedIn={!!user} />
      <main id="main">{children}</main>
      <Footer settings={settings} categories={categories.filter((c) => c.kind === "category")} pages={pages} />
      <MobileMenu categories={categories} signedIn={!!user} />
      <SearchOverlay categories={categories} />
      <CartDrawer freeThreshold={settings.shipping.freeThreshold} />
      <QuickAddModal />
      <WishlistSync signedIn={!!user} />
      <SmoothScroll enabled={settings.features.smoothScroll} />
    </>
  );
}
