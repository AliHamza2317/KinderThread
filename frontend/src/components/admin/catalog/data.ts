import { CATEGORIES, SIZE_GUIDES } from "@/data/catalog";

export async function getProductFormOptions() {
  const categories = [...CATEGORIES]
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((c) => ({ id: c.id, name: c.name, kind: c.kind }));
  const sizeGuides = [...SIZE_GUIDES].sort((a, b) => a.name.localeCompare(b.name)).map((g) => ({ id: g.id, name: g.name, isDefault: g.isDefault }));
  return { categories, sizeGuides };
}
