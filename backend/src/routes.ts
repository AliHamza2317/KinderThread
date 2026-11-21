import { Router } from "express";
import { requireAuth, requireStaff } from "./middleware/auth.js";
import { accountRouter } from "./modules/account/account.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { catalogAdminRouter, catalogRouter } from "./modules/catalog/catalog.routes.js";
import { contentAdminRouter, contentRouter } from "./modules/content/content.routes.js";
import { couponAdminRouter } from "./modules/coupons/coupon.routes.js";
import { customerAdminRouter } from "./modules/customers/customer.routes.js";
import { dashboardAdminRouter } from "./modules/dashboard/dashboard.routes.js";
import { newsletterRouter, subscriberAdminRouter } from "./modules/newsletter/newsletter.routes.js";
import { orderAdminRouter, orderRouter } from "./modules/orders/order.routes.js";
import { returnAdminRouter } from "./modules/returns/return.routes.js";
import { staffAdminRouter } from "./modules/staff/staff.routes.js";
import { uploadAdminRouter } from "./modules/uploads/upload.routes.js";

/**
 * Map of the whole API (everything below is mounted under /api).
 * Each module keeps its own routes → controller → service → model files.
 */
export const apiRouter = Router();

/* ---------------------------- storefront (public) ---------------------------- */
apiRouter.use(catalogRouter); // /categories, /products, /size-guides
apiRouter.use(contentRouter); // /settings, /pages, /banners, /gallery
apiRouter.use("/cart", cartRouter); // /cart/quote
apiRouter.use("/orders", orderRouter); // checkout, /orders/track
apiRouter.use("/newsletter", newsletterRouter);

/* ------------------------------ customer account ----------------------------- */
apiRouter.use("/auth", authRouter); // register, login, me, logout-all
apiRouter.use("/account", accountRouter); // profile, password, addresses, wishlist, orders, returns

/* --------------------------- admin (staff sign-in) --------------------------- */
const adminRouter = Router();
adminRouter.use(requireAuth, requireStaff);

adminRouter.use("/dashboard", dashboardAdminRouter);
adminRouter.use(catalogAdminRouter); // /products, /categories, /size-guides
adminRouter.use(contentAdminRouter); // /settings, /pages, /banners, /gallery
adminRouter.use("/orders", orderAdminRouter);
adminRouter.use("/returns", returnAdminRouter);
adminRouter.use("/customers", customerAdminRouter);
adminRouter.use("/coupons", couponAdminRouter);
adminRouter.use("/subscribers", subscriberAdminRouter);
adminRouter.use("/staff", staffAdminRouter); // admins only
adminRouter.use("/uploads", uploadAdminRouter);

apiRouter.use("/admin", adminRouter);
