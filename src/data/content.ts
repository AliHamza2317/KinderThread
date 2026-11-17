/** DUMMY homepage content and CMS pages for the frontend-only build. */
import type { Banner, GalleryImage, Page } from "@/lib/types";

const UPDATED = new Date("2026-11-01T10:00:00+05:00");

const BANNER_DEFS = [
  {
    eyebrow: "Seasonal",
    title: "Knits for cooler days",
    subtitle: "Cardigans, sweaters and soft layers.",
    image: "/images/editorial/banner-knitwear.webp",
    ctaLabel: "Shop knitwear",
    ctaHref: "/collections/seasonal",
    tone: "cream",
  },
  {
    eyebrow: "First days",
    title: "Newborn essentials",
    subtitle: "Bodysuits, booties and gentle first pieces.",
    image: "/images/editorial/nursery.webp",
    ctaLabel: "Shop newborn",
    ctaHref: "/collections/newborn",
    tone: "cream",
  },
];

const GALLERY_DEFS = [
  { url: "/images/gallery/g1.webp", alt: "A toddler in a tulle skirt walking across a sunny lawn" },
  { url: "/images/gallery/g2.webp", alt: "Soft baby clothes bundled on a woven rug" },
  { url: "/images/gallery/g3.webp", alt: "Tiny toes on a soft white blanket" },
  { url: "/images/gallery/g4.webp", alt: "A calm wooden nursery" },
  { url: "/images/gallery/g5.webp", alt: "Close-up of a patterned knit" },
  { url: "/images/gallery/g6.webp", alt: "A little foot on a striped sheet" },
  { url: "/images/gallery/g7.webp", alt: "Baby clothes hanging on a rail" },
  { url: "/images/gallery/g8.webp", alt: "A white clothing rail with wooden hangers" },
];

export const BANNERS: Banner[] = BANNER_DEFS.map((b, i) => ({ id: `banner_${i + 1}`, ...b, sortOrder: i, isActive: true, createdAt: UPDATED }));

export const GALLERY: GalleryImage[] = GALLERY_DEFS.map((g, i) => ({ id: `gallery_${i + 1}`, ...g, href: null, isSample: true, sortOrder: i, isActive: true, createdAt: UPDATED }));

const PAGES: { slug: string; title: string; body: string; seoDescription: string; showInFooter?: boolean }[] = [
  {
    slug: "shipping",
    title: "Shipping & Delivery",
    seoDescription: "Delivery charges, timelines and cash on delivery for Kinder Thread orders across Pakistan.",
    body: `We deliver across Pakistan.

## Delivery charges
- Standard delivery: **{{flatRate}}** per order
- **Free delivery** on orders of {{freeThreshold}} or more

## Delivery time
{{estimate}}. {{dispatchNote}}

## Cash on delivery
Cash on delivery is available on all orders. Please keep the exact amount ready when your parcel arrives.

## Tracking your order
Once your order ships you'll receive the courier name and tracking number. You can check your order at any time on the [Track Order](/track-order) page using your order number and phone number.

> Please review this policy and update the details to match your courier agreement before launch.`,
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    seoDescription: "How to return or exchange Kinder Thread items.",
    body: `We want every outfit to fit just right.

## Our policy
- You can request a return or exchange within **{{returnDays}} days** of delivery.
- Items must be unworn, unwashed and have their original tags attached.
- For hygiene reasons, items marked as final sale cannot be returned.

## How to request
1. If you have an account, open the order in **My Account → Orders** and choose *Request return / exchange*.
2. Otherwise, contact us with your order number and we'll guide you.

## Exchanges
Need a different size? We'll arrange an exchange for the same item, subject to availability.

## Refunds
Approved refunds are processed to your original payment method or by bank transfer for cash on delivery orders.

> Please review this policy before launch.`,
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    seoDescription: "Answers to common questions about sizing, delivery, payments and returns.",
    body: `## How do I choose the right size?
Our sizes follow your child's age. Every product page has a size guide with measurements. If your little one is between sizes, we recommend sizing up.

## Which payment methods do you accept?
Cash on delivery is available nationwide. Other methods available at checkout are shown there.

## How long does delivery take?
{{estimate}}.

## How much is delivery?
{{flatRate}} per order, and free on orders of {{freeThreshold}} or more.

## Can I return or exchange an item?
Yes — within {{returnDays}} days of delivery for unworn items with tags. See [Returns & Exchanges](/pages/returns).

## How can I track my order?
Use the [Track Order](/track-order) page with your order number and phone number.`,
  },
  {
    slug: "contact",
    title: "Contact Us",
    seoDescription: "Get in touch with Kinder Thread.",
    body: `We're happy to help with sizing questions, orders and anything else.

{{contactBlock}}

We usually reply within one working day.`,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    seoDescription: "How Kinder Thread collects and uses your information.",
    body: `This policy explains what information we collect and how we use it.

## What we collect
- Details you give us when ordering: name, phone number, email, delivery address.
- Account details if you create an account.
- Your email address if you subscribe to our newsletter.

## How we use it
- To process, deliver and support your orders.
- To send newsletters if you subscribed (you can unsubscribe anytime).

## What we don't do
We do not sell your personal information. We only share delivery details with our courier partners to deliver your order.

## Your choices
You can ask us to update or delete your information at any time by contacting us.

> Please have this policy reviewed before launch.`,
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    seoDescription: "Terms of use for the Kinder Thread online store.",
    body: `By using this website and placing an order you agree to these terms.

## Orders
All orders are subject to availability and confirmation. We may contact you by phone to confirm cash on delivery orders.

## Prices
Prices are in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise.

## Product images
We try to show colours as accurately as possible; screens can vary slightly.

> Please have these terms reviewed before launch.`,
  },
  {
    slug: "about",
    title: "Our Story",
    showInFooter: false,
    seoDescription: "Kinder Thread — thoughtfully selected clothing for little ones aged 0–5.",
    body: `Every little outfit is part of a bigger story.

Kinder Thread began with a simple idea: dressing little ones should feel joyful, not complicated. We look for pieces that are soft, practical and quietly beautiful — the kind of clothes that are reached for again and again.

## What we care about
- **Thoughtful selection.** Each style is chosen for its colour, cut and everyday practicality.
- **Simple sizing.** Clear sizes by age, from newborn to five years.
- **Friendly service.** Real people, ready to help on WhatsApp and email.

Our first collection is being prepared now. Thank you for being part of our little world.`,
  },
];

export const PAGES_DATA: Page[] = PAGES.map((p) => ({
  id: `page_${p.slug}`,
  slug: p.slug,
  title: p.title,
  body: p.body,
  seoDescription: p.seoDescription,
  isPublished: true,
  showInFooter: p.showInFooter ?? true,
  updatedAt: UPDATED,
}));
