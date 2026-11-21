import { Router } from "express";
import * as content from "./content.controller.js";

/** Storefront: /api/settings, /api/pages, /api/banners, /api/gallery */
export const contentRouter = Router();

contentRouter.get("/settings", content.settings);
contentRouter.get("/pages", content.pages);
contentRouter.get("/pages/:slug", content.page);
contentRouter.get("/banners", content.banners);
contentRouter.get("/gallery", content.gallery);

/** Admin: /api/admin/settings, /api/admin/pages, /api/admin/banners, /api/admin/gallery */
export const contentAdminRouter = Router();

contentAdminRouter.get("/settings", content.settings);
contentAdminRouter.put("/settings/:key", content.saveSettings);

contentAdminRouter.get("/pages", content.adminPages);
contentAdminRouter.post("/pages", content.createPage);
contentAdminRouter.put("/pages/:id", content.updatePage);
contentAdminRouter.delete("/pages/:id", content.deletePage);

contentAdminRouter.get("/banners", content.adminBanners);
contentAdminRouter.post("/banners", content.createBanner);
contentAdminRouter.put("/banners/:id", content.updateBanner);
contentAdminRouter.delete("/banners/:id", content.deleteBanner);

contentAdminRouter.get("/gallery", content.adminGallery);
contentAdminRouter.post("/gallery", content.createGalleryImage);
contentAdminRouter.put("/gallery/:id", content.updateGalleryImage);
contentAdminRouter.delete("/gallery/:id", content.deleteGalleryImage);
