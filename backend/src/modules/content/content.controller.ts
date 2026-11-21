import type { Request, Response } from "express";
import { badRequest } from "../../lib/http-error.js";
import { validate } from "../../lib/validate.js";
import * as content from "./content.service.js";
import { bannerInput, galleryImageInput, pageInput } from "./content.validation.js";
import { getSettings, saveSettingsGroup } from "./settings.service.js";
import { isSettingKey } from "./settings.schema.js";

type IdParams = { id: string };

/* storefront */

export async function settings(_req: Request, res: Response) {
  res.json(await getSettings());
}

export async function pages(_req: Request, res: Response) {
  res.json(await content.listPublishedPages());
}

export async function page(req: Request<{ slug: string }>, res: Response) {
  res.json(await content.getPublishedPage(req.params.slug));
}

export async function banners(_req: Request, res: Response) {
  res.json(await content.listActiveBanners());
}

export async function gallery(_req: Request, res: Response) {
  res.json(await content.listActiveGallery());
}

/* admin */

export async function saveSettings(req: Request<{ key: string }>, res: Response) {
  const { key } = req.params;
  if (!isSettingKey(key)) throw badRequest(`Unknown settings group “${key}”.`);
  res.json(await saveSettingsGroup(key, req.body));
}

export async function adminPages(_req: Request, res: Response) {
  res.json(await content.listAllPages());
}

export async function createPage(req: Request, res: Response) {
  res.status(201).json(await content.createPage(validate(pageInput, req.body)));
}

export async function updatePage(req: Request<IdParams>, res: Response) {
  res.json(await content.updatePage(req.params.id, validate(pageInput, req.body)));
}

export async function deletePage(req: Request<IdParams>, res: Response) {
  await content.deletePage(req.params.id);
  res.status(204).end();
}

export async function adminBanners(_req: Request, res: Response) {
  res.json(await content.listAllBanners());
}

export async function createBanner(req: Request, res: Response) {
  res.status(201).json(await content.createBanner(validate(bannerInput, req.body)));
}

export async function updateBanner(req: Request<IdParams>, res: Response) {
  res.json(await content.updateBanner(req.params.id, validate(bannerInput, req.body)));
}

export async function deleteBanner(req: Request<IdParams>, res: Response) {
  await content.deleteBanner(req.params.id);
  res.status(204).end();
}

export async function adminGallery(_req: Request, res: Response) {
  res.json(await content.listAllGallery());
}

export async function createGalleryImage(req: Request, res: Response) {
  res.status(201).json(await content.createGalleryImage(validate(galleryImageInput, req.body)));
}

export async function updateGalleryImage(req: Request<IdParams>, res: Response) {
  res.json(await content.updateGalleryImage(req.params.id, validate(galleryImageInput, req.body)));
}

export async function deleteGalleryImage(req: Request<IdParams>, res: Response) {
  await content.deleteGalleryImage(req.params.id);
  res.status(204).end();
}
