import { Schema, model } from "mongoose";
import { baseOptions } from "../../db/schema-options.js";

/** One settings group (e.g. key "shipping") with its saved values. */
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  baseOptions,
);

/** Help pages such as Shipping, Returns, FAQ (body is Markdown). */
const pageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    seoDescription: { type: String, default: null },
    isPublished: { type: Boolean, default: true },
    showInFooter: { type: Boolean, default: true },
  },
  baseOptions,
);

/** The promo banners on the homepage. */
const bannerSchema = new Schema(
  {
    eyebrow: { type: String, default: null },
    title: { type: String, required: true },
    subtitle: { type: String, default: null },
    image: { type: String, default: null },
    ctaLabel: { type: String, default: null },
    ctaHref: { type: String, default: null },
    tone: { type: String, default: "cream" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  baseOptions,
);

/** Photos for the "Follow our little world" gallery. */
const galleryImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    href: { type: String, default: null },
    isSample: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  baseOptions,
);

export const Setting = model("Setting", settingSchema);
export const Page = model("Page", pageSchema);
export const Banner = model("Banner", bannerSchema);
export const GalleryImage = model("GalleryImage", galleryImageSchema);
