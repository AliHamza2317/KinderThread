import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import { adminProductQuery, categoryInput, productInput, sizeGuideInput, slugQuery, stockInput } from "./catalog.validation.js";
import * as categoriesService from "./category.service.js";
import * as productsService from "./product.service.js";
import * as sizeGuidesService from "./size-guide.service.js";

type IdParams = { id: string };

/* products */

export async function listProducts(req: Request, res: Response) {
  res.json(await productsService.listAdminProducts(validate(adminProductQuery, req.query)));
}

export async function getProduct(req: Request<IdParams>, res: Response) {
  res.json(await productsService.getProductById(req.params.id));
}

export async function createProduct(req: Request, res: Response) {
  res.status(201).json(await productsService.createProduct(validate(productInput, req.body)));
}

export async function updateProduct(req: Request<IdParams>, res: Response) {
  res.json(await productsService.updateProduct(req.params.id, validate(productInput, req.body)));
}

export async function deleteProduct(req: Request<IdParams>, res: Response) {
  await productsService.deleteProduct(req.params.id);
  res.status(204).end();
}

export async function deleteSampleProducts(_req: Request, res: Response) {
  res.json(await productsService.deleteSampleProducts());
}

export async function checkSlug(req: Request, res: Response) {
  const { slug, excludeId } = validate(slugQuery, req.query);
  res.json(await productsService.checkSlug(slug, excludeId));
}

export async function updateStock(req: Request, res: Response) {
  const { updates } = validate(stockInput, req.body);
  res.json(await productsService.updateStock(updates));
}

/* categories */

export async function listCategories(_req: Request, res: Response) {
  res.json(await categoriesService.listAllCategories());
}

export async function createCategory(req: Request, res: Response) {
  res.status(201).json(await categoriesService.createCategory(validate(categoryInput, req.body)));
}

export async function updateCategory(req: Request<IdParams>, res: Response) {
  res.json(await categoriesService.updateCategory(req.params.id, validate(categoryInput, req.body)));
}

export async function deleteCategory(req: Request<IdParams>, res: Response) {
  await categoriesService.deleteCategory(req.params.id);
  res.status(204).end();
}

/* size guides */

export async function listSizeGuides(_req: Request, res: Response) {
  res.json(await sizeGuidesService.listSizeGuides());
}

export async function getSizeGuide(req: Request<IdParams>, res: Response) {
  res.json(await sizeGuidesService.getSizeGuide(req.params.id));
}

export async function createSizeGuide(req: Request, res: Response) {
  res.status(201).json(await sizeGuidesService.createSizeGuide(validate(sizeGuideInput, req.body)));
}

export async function updateSizeGuide(req: Request<IdParams>, res: Response) {
  res.json(await sizeGuidesService.updateSizeGuide(req.params.id, validate(sizeGuideInput, req.body)));
}

export async function deleteSizeGuide(req: Request<IdParams>, res: Response) {
  await sizeGuidesService.deleteSizeGuide(req.params.id);
  res.status(204).end();
}
