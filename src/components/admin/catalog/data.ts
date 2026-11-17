import "server-only";
import { db } from "@/lib/db";

export async function getProductFormOptions() {
  const [categories, sizeGuides] = await Promise.all([
    db.category.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, kind: true } }),
    db.sizeGuide.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, isDefault: true } }),
  ]);
  return { categories, sizeGuides };
}
