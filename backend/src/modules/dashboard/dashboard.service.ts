import { Product } from "../catalog/product.model.js";
import { Subscriber } from "../newsletter/subscriber.model.js";
import { Order } from "../orders/order.model.js";
import { OPEN_RETURN_STATUSES, ReturnRequest } from "../returns/return.model.js";
import { User } from "../users/user.model.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const LOW_STOCK = 3;

/** Numbers for the admin home screen, fetched in parallel. */
export async function getDashboard(now = new Date()) {
  const oneDayAgo = new Date(now.getTime() - DAY_MS);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);

  const [statusCounts, sales, ordersLast24Hours, recentOrders, lowStock, topProducts, customers, subscribers, openReturns] = await Promise.all([
    Order.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate<{ revenue: number; orders: number }>([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $nin: ["CANCELLED", "RETURNED"] } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    Order.find().sort({ createdAt: -1 }).limit(6).select("number customerName status paymentStatus total createdAt"),
    Product.aggregate<{ productId: string; name: string; sku: string; size: string; color: string | null; stock: number }>([
      { $match: { status: "ACTIVE" } },
      { $unwind: "$variants" },
      { $match: { "variants.isActive": true, "variants.stock": { $lte: LOW_STOCK } } },
      { $sort: { "variants.stock": 1 } },
      { $limit: 20 },
      { $project: { _id: 0, productId: "$_id", name: 1, sku: "$variants.sku", size: "$variants.size", color: "$variants.color", stock: "$variants.stock" } },
    ]),
    Product.find({ status: "ACTIVE" }).sort({ soldCount: -1 }).limit(5).select("name slug soldCount images"),
    User.countDocuments({ role: "CUSTOMER" }),
    Subscriber.countDocuments({ isActive: true }),
    ReturnRequest.countDocuments({ status: { $in: OPEN_RETURN_STATUSES } }),
  ]);

  const last30Days = sales[0] ?? { revenue: 0, orders: 0 };
  return {
    ordersByStatus: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    ordersLast24Hours,
    last30Days: {
      revenue: last30Days.revenue,
      orders: last30Days.orders,
      averageOrder: last30Days.orders ? Math.round(last30Days.revenue / last30Days.orders) : 0,
    },
    customers,
    subscribers,
    openReturns,
    recentOrders,
    lowStock,
    topProducts: topProducts.map((p) => ({ id: p.id as string, name: p.name, slug: p.slug, soldCount: p.soldCount, image: p.images[0]?.url ?? null })),
  };
}
