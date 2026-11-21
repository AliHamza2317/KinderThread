import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.js";
import * as admin from "./catalog.admin.controller.js";
import * as store from "./catalog.controller.js";

/** Storefront: /api/categories, /api/products, /api/size-guides */
export const catalogRouter = Router();

catalogRouter.get("/categories", store.categories);
catalogRouter.get("/categories/:slug", store.category);
catalogRouter.get("/products", store.products);
catalogRouter.get("/products/facets", store.facets);
catalogRouter.get("/products/by-ids", store.productsByIds);
catalogRouter.get("/products/:slug", store.product);
catalogRouter.get("/size-guides", store.sizeGuides);

/** Admin: /api/admin/products, /api/admin/categories, /api/admin/size-guides */
export const catalogAdminRouter = Router();

catalogAdminRouter.get("/products", admin.listProducts);
catalogAdminRouter.post("/products", admin.createProduct);
catalogAdminRouter.get("/products/check-slug", admin.checkSlug);
catalogAdminRouter.patch("/products/stock", admin.updateStock);
catalogAdminRouter.delete("/products/samples", requireAdmin, admin.deleteSampleProducts);
catalogAdminRouter.get("/products/:id", admin.getProduct);
catalogAdminRouter.put("/products/:id", admin.updateProduct);
catalogAdminRouter.delete("/products/:id", admin.deleteProduct);

catalogAdminRouter.get("/categories", admin.listCategories);
catalogAdminRouter.post("/categories", admin.createCategory);
catalogAdminRouter.put("/categories/:id", admin.updateCategory);
catalogAdminRouter.delete("/categories/:id", admin.deleteCategory);

catalogAdminRouter.get("/size-guides", admin.listSizeGuides);
catalogAdminRouter.post("/size-guides", admin.createSizeGuide);
catalogAdminRouter.get("/size-guides/:id", admin.getSizeGuide);
catalogAdminRouter.put("/size-guides/:id", admin.updateSizeGuide);
catalogAdminRouter.delete("/size-guides/:id", admin.deleteSizeGuide);
