import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const bricolage = localFont({
  src: [{ path: "../fonts/bricolage.woff2", style: "normal", weight: "200 800" }],
  variable: "--font-bricolage",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// the serif is only used for single italic accent words, so it is not preloaded
const instrument = localFont({
  src: [{ path: "../fonts/instrument-serif-italic.woff2", style: "italic", weight: "400" }],
  variable: "--font-instrument",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

const inter = localFont({
  src: [{ path: "../fonts/inter.woff2", style: "normal", weight: "100 900" }],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { seo, store } = await getSettings();
  const base = process.env.SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(base),
    title: { default: seo.title, template: `%s · ${store.name}` },
    description: seo.description,
    keywords: seo.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    applicationName: store.name,
    openGraph: {
      type: "website",
      siteName: store.name,
      title: seo.title,
      description: seo.description,
      locale: "en_PK",
      images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: store.name }],
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: ["/brand/og.jpg"] },
    manifest: "/manifest.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: "#f5f1ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="grain">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-cocoa focus:px-4 focus:py-2 focus:text-cream">
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
