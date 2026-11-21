import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { formLimiter } from "../../middleware/rate-limit.js";
import * as account from "./account.controller.js";

/** /api/account — the signed-in customer's own data. */
export const accountRouter = Router();

accountRouter.use(requireAuth);

accountRouter.put("/profile", account.updateProfile);
accountRouter.post("/password", formLimiter, account.changePassword);

accountRouter.get("/addresses", account.listAddresses);
accountRouter.post("/addresses", account.addAddress);
accountRouter.put("/addresses/:id", account.updateAddress);
accountRouter.post("/addresses/:id/default", account.setDefaultAddress);
accountRouter.delete("/addresses/:id", account.deleteAddress);

accountRouter.get("/wishlist", account.getWishlist);
accountRouter.put("/wishlist", account.setWishlist);
accountRouter.post("/wishlist/:productId", account.addToWishlist);
accountRouter.delete("/wishlist/:productId", account.removeFromWishlist);

accountRouter.get("/orders", account.listOrders);
accountRouter.get("/orders/:number", account.getOrder);
accountRouter.post("/orders/:number/returns", formLimiter, account.requestReturn);
