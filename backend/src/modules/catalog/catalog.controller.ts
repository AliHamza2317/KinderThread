import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import { getCategoryBySlug, listVisibleCategories } from "./category.service.js";
import { idsQuery, productListQuery } from "./catalog.validation.js";
import { getFacets, getProductBySlug, getProductsByIds, listProducts } from "./product.service.js";
import { listSizeGuides } from "./size-guide.service.js";

/** Storefront catalogue endpoints (no sign-in needed). */

export async function categories(_req: Request, res: Response) {
  res.json(await listVisibleCategories());
}

export async function category(req: Request<{ slug: string }>, res: Response) {
  res.json(await getCategoryBySlug(req.params.slug));
}

export async function products(req: Request, res: Response) {
  res.json(await listProducts(validate(productListQuery, req.query)));
}

export async function facets(req: Request, res: Response) {
  res.json(await getFacets(validate(productListQuery, req.query)));
}

export async function productsByIds(req: Request, res: Response) {
  const { ids } = validate(idsQuery, req.query);
  res.json(await getProductsByIds(ids));
}

export async function product(req: Request<{ slug: string }>, res: Response) {
  res.json(await getProductBySlug(req.params.slug));
}

export async function sizeGuides(_req: Request, res: Response) {
  res.json(await listSizeGuides());
}
