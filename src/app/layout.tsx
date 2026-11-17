import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces-soft.woff2", style: "normal", weight: "100 900" },
    { path: "../fonts/fraunces-soft-italic.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const nunito = localFont({
  src: [
    { path: "../fonts/nunito-sans.woff2", style: "normal", weight: "200 1000" },
    { path: "../fonts/nunito-sans-italic.woff2", style: "italic", weight: "200 1000" },
  ],
  variable: "--font-nunito",
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
  themeColor: "#fefbf4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script
          // marks JS availability for reveal animations; falls back to visible content after 4s
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('reveal-fallback')},4000);`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-cocoa focus:px-4 focus:py-2 focus:text-cream">
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
