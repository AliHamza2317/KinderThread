import { conflict, notFound } from "../../lib/http-error.js";
import { Banner, GalleryImage, Page } from "./content.models.js";
import type { BannerInput, GalleryImageInput, PageInput } from "./content.validation.js";

/* ---------------------------------- pages --------------------------------- */

export const listPublishedPages = () => Page.find({ isPublished: true }).select("slug title showInFooter").sort({ title: 1 });

export async function getPublishedPage(slug: string) {
  const page = await Page.findOne({ slug, isPublished: true });
  if (!page) throw notFound("Page not found.");
  return page;
}

export const listAllPages = () => Page.find().sort({ title: 1 });

async function assertPageSlugFree(slug: string, excludeId?: string) {
  const owner = await Page.findOne({ slug }).select("_id");
  if (owner && owner.id !== excludeId) throw conflict("Another page already uses this address.", { slug: ["Already in use."] });
}

export async function createPage(input: PageInput) {
  await assertPageSlugFree(input.slug);
  return Page.create(input);
}

export async function updatePage(id: string, input: PageInput) {
  const page = await Page.findById(id);
  if (!page) throw notFound("Page not found.");
  await assertPageSlugFree(input.slug, id);
  page.set(input);
  return page.save();
}

export async function deletePage(id: string) {
  if (!(await Page.findByIdAndDelete(id))) throw notFound("Page not found.");
}

/* --------------------------------- banners -------------------------------- */

export const listActiveBanners = () => Banner.find({ isActive: true }).sort({ sortOrder: 1 });
export const listAllBanners = () => Banner.find().sort({ sortOrder: 1 });

export const createBanner = (input: BannerInput) => Banner.create(input);

export async function updateBanner(id: string, input: BannerInput) {
  const banner = await Banner.findById(id);
  if (!banner) throw notFound("Banner not found.");
  banner.set(input);
  return banner.save();
}

export async function deleteBanner(id: string) {
  if (!(await Banner.findByIdAndDelete(id))) throw notFound("Banner not found.");
}

/* --------------------------------- gallery -------------------------------- */

export const listActiveGallery = () => GalleryImage.find({ isActive: true }).sort({ sortOrder: 1 });
export const listAllGallery = () => GalleryImage.find().sort({ sortOrder: 1 });

export const createGalleryImage = (input: GalleryImageInput) => GalleryImage.create(input);

export async function updateGalleryImage(id: string, input: GalleryImageInput) {
  const image = await GalleryImage.findById(id);
  if (!image) throw notFound("Image not found.");
  image.set(input);
  return image.save();
}

export async function deleteGalleryImage(id: string) {
  if (!(await GalleryImage.findByIdAndDelete(id))) throw notFound("Image not found.");
}
