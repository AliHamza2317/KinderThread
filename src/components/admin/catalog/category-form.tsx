"use client";

import { useActionState, useState } from "react";
import { saveCategoryAction } from "@/actions/admin/catalog";
import { FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { ImageInput } from "@/components/admin/image-input";
import { Card } from "@/components/admin/ui";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { slugify } from "@/lib/utils";

export type CategoryFormData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  kind: string;
  sortOrder: number;
  isVisible: boolean;
  showInNav: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
};

export function CategoryForm({ category }: { category?: CategoryFormData }) {
  const [state, action] = useActionState(saveCategoryAction, null);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!category);
  const errors = state && !state.ok ? state.errors ?? {} : {};
  const e = (k: string) => errors[k]?.[0];

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px] [&>*]:min-w-0">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="flex flex-col gap-6">
        <Card title="Details">
          <div className="grid gap-4">
            <Field label="Name" htmlFor="name" error={e("name")}>
              <Input
                id="name"
                name="name"
                value={name}
                required
                maxLength={80}
                onChange={(ev) => {
                  setName(ev.target.value);
                  if (!slugTouched) setSlug(slugify(ev.target.value));
                }}
                aria-invalid={!!e("name")}
              />
            </Field>
            <Field label="URL slug" htmlFor="slug" error={e("slug")} hint={`Shop URL: /collections/${slug || "…"}`}>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(ev) => {
                  setSlugTouched(true);
                  setSlug(ev.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                }}
                aria-invalid={!!e("slug")}
              />
            </Field>
            <Field label="Description" htmlFor="description" optional hint="Shown at the top of the collection page.">
              <Textarea id="description" name="description" rows={4} defaultValue={category?.description ?? ""} maxLength={600} />
            </Field>
          </div>
        </Card>
        <Card title="Search engine listing" description="Leave blank to use the name and description.">
          <div className="grid gap-4">
            <Field label="SEO title" htmlFor="seoTitle" optional>
              <Input id="seoTitle" name="seoTitle" defaultValue={category?.seoTitle ?? ""} maxLength={160} />
            </Field>
            <Field label="SEO description" htmlFor="seoDescription" optional>
              <Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={category?.seoDescription ?? ""} maxLength={320} />
            </Field>
          </div>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card title="Settings">
          <div className="flex flex-col gap-4">
            <Field label="Type" htmlFor="kind" hint="Categories form the shop structure; collections are curated groups.">
              <Select id="kind" name="kind" defaultValue={category?.kind ?? "category"}>
                <option value="category">Category</option>
                <option value="collection">Collection</option>
              </Select>
            </Field>
            <Field label="Sort order" htmlFor="sortOrder" hint="Lower numbers appear first." error={e("sortOrder")}>
              <Input id="sortOrder" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} />
            </Field>
            <Checkbox name="isVisible" label="Visible in the store" defaultChecked={category?.isVisible ?? true} />
            <Checkbox name="showInNav" label="Show in navigation" defaultChecked={category?.showInNav ?? true} />
            <Checkbox name="isFeatured" label="Feature on the homepage" defaultChecked={category?.isFeatured ?? false} />
          </div>
        </Card>
        <Card title="Image">
          <ImageInput name="image" defaultValue={category?.image} folder="categories" label="Category image (portrait 4:5 works best)" />
        </Card>
        <FormMessage state={state} />
        <SubmitButton className="w-full">{category ? "Save category" : "Create category"}</SubmitButton>
      </div>
    </form>
  );
}
