/**
 * Domain types for the frontend-only build. These mirror the shape the future
 * MongoDB backend will return, so pages won't need to change when it's connected.
 */

export const ROLES = ["CUSTOMER", "STAFF", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const GENDERS = ["BOY", "GIRL", "UNISEX"] as const;
export type Gender = (typeof GENDERS)[number];

export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["UNPAID", "PENDING_VERIFICATION", "PAID", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const RETURN_TYPES = ["RETURN", "EXCHANGE"] as const;
export type ReturnType = (typeof RETURN_TYPES)[number];

export const RETURN_STATUSES = ["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "COMPLETED"] as const;
export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export const COUPON_TYPES = ["PERCENT", "FIXED", "FREE_SHIPPING"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const SUBSCRIBER_SOURCES = ["NEWSLETTER", "LAUNCH", "TRYON", "CHECKOUT"] as const;
export type SubscriberSource = (typeof SUBSCRIBER_SOURCES)[number];

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  kind: "category" | "collection";
  sortOrder: number;
  isVisible: boolean;
  showInNav: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SizeGuideRow = { size: string; age?: string; height?: string; chest?: string; waist?: string; length?: string };
export type SizeGuide = { id: string; name: string; unit: string; rows: SizeGuideRow[]; notes: string | null; isDefault: boolean; updatedAt: Date };

export type ProductImage = { id: string; url: string; alt: string; sortOrder: number; colorId: string | null };
export type ProductColor = { id: string; name: string; hex: string; sortOrder: number };
export type ProductVariant = { id: string; sku: string; size: string; colorId: string | null; price: number | null; stock: number; isActive: boolean };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabric: string | null;
  care: string | null;
  price: number;
  compareAtPrice: number | null;
  status: ProductStatus;
  gender: Gender;
  isSample: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  sizeGuideId: string | null;
  categoryIds: string[];
  images: ProductImage[];
  colors: ProductColor[];
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
};

export type Address = { id: string; userId: string; label: string | null; fullName: string; phone: string; city: string; line1: string; line2: string | null; postalCode: string | null; isDefault: boolean; createdAt: Date };

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export type OrderItem = { id: string; productId: string | null; variantId: string | null; name: string; sku: string; size: string; color: string | null; image: string | null; unitPrice: number; quantity: number; lineTotal: number };
export type OrderEvent = { id: string; status: OrderStatus | null; message: string; isPublic: boolean; actor: string | null; createdAt: Date };
export type ReturnRequest = { id: string; orderId: string; type: ReturnType; status: ReturnStatus; reason: string; details: string | null; adminNote: string | null; createdAt: Date; updatedAt: Date };

export type Order = {
  id: string;
  number: string;
  userId: string | null;
  email: string;
  phone: string;
  customerName: string;
  city: string;
  address: string;
  postalCode: string | null;
  notes: string | null;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode: string | null;
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  internalNote: string | null;
  items: OrderItem[];
  events: OrderEvent[];
  createdAt: Date;
  updatedAt: Date;
};

export type Coupon = { id: string; code: string; description: string | null; type: CouponType; value: number; minSubtotal: number | null; maxUses: number | null; usedCount: number; startsAt: Date | null; endsAt: Date | null; isActive: boolean; createdAt: Date };
export type Subscriber = { id: string; email: string; source: SubscriberSource; isActive: boolean; createdAt: Date };
export type Banner = { id: string; eyebrow: string | null; title: string; subtitle: string | null; image: string | null; ctaLabel: string | null; ctaHref: string | null; tone: string; sortOrder: number; isActive: boolean; createdAt: Date };
export type GalleryImage = { id: string; url: string; alt: string; href: string | null; isSample: boolean; sortOrder: number; isActive: boolean; createdAt: Date };
export type Page = { id: string; slug: string; title: string; body: string; seoDescription: string | null; isPublished: boolean; showInFooter: boolean; updatedAt: Date };
