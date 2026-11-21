import { notFound } from "../../lib/http-error.js";
import type { SizeGuideInput } from "./catalog.validation.js";
import { Product } from "./product.model.js";
import { SizeGuide } from "./size-guide.model.js";

export const listSizeGuides = () => SizeGuide.find().sort({ isDefault: -1, name: 1 });

export async function getSizeGuide(id: string) {
  const guide = await SizeGuide.findById(id);
  if (!guide) throw notFound("Size guide not found.");
  return guide;
}

/** Only one guide can be the default: marking one clears the flag on the others. */
async function clearOtherDefaults(keepId: string) {
  await SizeGuide.updateMany({ _id: { $ne: keepId }, isDefault: true }, { $set: { isDefault: false } });
}

export async function createSizeGuide(input: SizeGuideInput) {
  const isFirst = (await SizeGuide.countDocuments()) === 0;
  const guide = await SizeGuide.create({ ...input, isDefault: input.isDefault || isFirst });
  if (guide.isDefault) await clearOtherDefaults(guide.id as string);
  return guide;
}

export async function updateSizeGuide(id: string, input: SizeGuideInput) {
  const guide = await getSizeGuide(id);
  guide.set(input);
  await guide.save();
  if (guide.isDefault) await clearOtherDefaults(id);
  return guide;
}

/** Products using the deleted guide fall back to the default one. */
export async function deleteSizeGuide(id: string) {
  const guide = await SizeGuide.findByIdAndDelete(id);
  if (!guide) throw notFound("Size guide not found.");
  await Product.updateMany({ sizeGuide: guide._id }, { $set: { sizeGuide: null } });
  if (guide.isDefault) {
    const next = await SizeGuide.findOne().sort({ createdAt: 1 });
    if (next) await SizeGuide.updateOne({ _id: next._id }, { $set: { isDefault: true } });
  }
}
