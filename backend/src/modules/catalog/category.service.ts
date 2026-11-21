import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { slugify } from "../../lib/text.js";
import { Category } from "./category.model.js";
import { VIRTUAL_COLLECTIONS, isVirtualCollection } from "./collections.js";
import type { CategoryInput } from "./catalog.validation.js";
import { Product } from "./product.model.js";

/** Visible categories for menus and the collections page, with how many products each has. */
export async function listVisibleCategories() {
  const [categories, counts] = await Promise.all([
    Category.find({ isVisible: true }).sort({ sortOrder: 1, name: 1 }),
    Product.aggregate<{ _id: unknown; count: number }>([
      { $match: { status: "ACTIVE" } },
      { $unwind: "$categories" },
      { $group: { _id: "$categories", count: { $sum: 1 } } },
    ]),
  ]);
  const countById = new Map(counts.map((c) => [String(c._id), c.count]));
  return categories.map((c) => ({ ...c.toJSON(), productCount: countById.get(c.id as string) ?? 0 }));
}

/** A category page, or one of the automatic collections (new-arrivals, best-sellers, sale). */
export async function getCategoryBySlug(slug: string) {
  if (isVirtualCollection(slug)) {
    const { name, description } = VIRTUAL_COLLECTIONS[slug];
    return { slug, name, description, kind: "collection", isVirtual: true };
  }
  const category = await Category.findOne({ slug, isVisible: true });
  if (!category) throw notFound("Collection not found.");
  return { ...category.toJSON(), isVirtual: false };
}

export async function listAllCategories() {
  return Category.find().sort({ sortOrder: 1, name: 1 });
}

async function resolveSlug(input: CategoryInput, excludeId?: string) {
  const slug = input.slug || slugify(input.name);
  if (!slug) throw badRequest("Please enter a valid slug.", { slug: ["Slug is required."] });
  if (isVirtualCollection(slug)) {
    throw badRequest(`“${slug}” is reserved for an automatic collection.`, { slug: ["Reserved — choose another."] });
  }
  const owner = await Category.findOne({ slug }).select("_id");
  if (owner && owner.id !== excludeId) throw conflict("Another category already uses this slug.", { slug: ["Slug already in use."] });
  return slug;
}

export async function createCategory(input: CategoryInput) {
  const slug = await resolveSlug(input);
  return Category.create({ ...input, slug });
}

export async function updateCategory(id: string, input: CategoryInput) {
  const category = await Category.findById(id);
  if (!category) throw notFound("Category not found.");
  category.set({ ...input, slug: await resolveSlug(input, id) });
  return category.save();
}

/** Deletes the category and removes it from every product (the products stay). */
export async function deleteCategory(id: string) {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw notFound("Category not found.");
  await Product.updateMany({ categories: category._id }, { $pull: { categories: category._id } });
}
