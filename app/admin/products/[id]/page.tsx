import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/AdminNav";
import { ProductPhotoPicker } from "@/components/ProductPhotoPicker";
async function updateProduct(id: string, formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Verify that the authenticated user is a Ranima admin.
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    adminError ||
    !adminUser ||
    !["owner", "admin"].includes(adminUser.role)
  ) {
    redirect("/");
  }

  const name = String(formData.get("name") || "").trim();
  const categorySlug = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();

  const metal = String(formData.get("metal") || "gold");
  const purity = String(formData.get("purity") || "").trim();

  const goldWeightRaw = String(formData.get("gold_weight") || "").trim();
  const grossWeightRaw = String(formData.get("gross_weight") || "").trim();
  const stoneWeightRaw = String(formData.get("stone_weight") || "").trim();

  const stoneUnit = String(formData.get("stone_unit") || "").trim();
  const stoneType = String(formData.get("stone_type") || "").trim();
  const size = String(formData.get("size") || "").trim();
  const huid = String(formData.get("huid") || "").trim();

  const hallmarkStatus = String(
    formData.get("hallmark_status") || ""
  ).trim();

  const availability = String(
    formData.get("availability") || "AVAILABLE"
  );

  const additionalChargesRaw = String(
    formData.get("additional_charges") || "0"
  ).trim();

  const modificationAvailable =
    formData.get("modification_available") === "on";

  const featured = formData.get("featured") === "on";

  if (!name || !categorySlug || !purity) {
    throw new Error("Product name, category and purity are required.");
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (categoryError || !category) {
    throw new Error("Selected category could not be found.");
  }

  // Read the current product images before applying image changes.
  const { data: currentImages, error: currentImagesError } = await supabase
    .from("product_images")
    .select("id, storage_path, is_primary, sort_order")
    .eq("product_id", id)
    .order("sort_order");

  if (currentImagesError) {
    throw new Error(currentImagesError.message);
  }

  const existingImages = currentImages ?? [];

  // Images selected for deletion.
  const deleteImageIds = formData
    .getAll("delete_images")
    .map((value) => String(value))
    .filter(Boolean);

  const imagesToDelete = existingImages.filter((image) =>
    deleteImageIds.includes(image.id)
  );

  const remainingImages = existingImages.filter(
    (image) => !deleteImageIds.includes(image.id)
  );

  // Newly selected image files.
  const photoFiles = formData
    .getAll("product_photos")
    .filter(
      (value): value is File =>
        value instanceof File && value.size > 0
    );

  // Never allow more than 4 images for a product.
  if (remainingImages.length + photoFiles.length > 4) {
    throw new Error("A product can have a maximum of 4 photos.");
  }

  // Delete selected image files from Supabase Storage first.
  const storagePathsToDelete = imagesToDelete.map(
    (image) => image.storage_path
  );

  if (storagePathsToDelete.length > 0) {
    const { error: storageDeleteError } = await supabase.storage
      .from("product-images")
      .remove(storagePathsToDelete);

    if (storageDeleteError) {
      throw new Error(storageDeleteError.message);
    }

    const { error: imageDeleteError } = await supabase
      .from("product_images")
      .delete()
      .in("id", deleteImageIds)
      .eq("product_id", id);

    if (imageDeleteError) {
      throw new Error(imageDeleteError.message);
    }
  }

  // Make sure there is a primary image among the remaining images.
// Determine which existing image should be primary.
const requestedPrimaryImageId = String(
  formData.get("primary_image_id") || ""
).trim();

const primaryImage =
  remainingImages.find(
    (image) => image.id === requestedPrimaryImageId
  ) ||
  remainingImages.find((image) => image.is_primary) ||
  remainingImages[0] ||
  null;

// Make exactly one remaining image primary.
if (primaryImage) {
  const { error: clearPrimaryError } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", id);

  if (clearPrimaryError) {
    throw new Error(clearPrimaryError.message);
  }

  const { error: setPrimaryError } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", primaryImage.id)
    .eq("product_id", id);

  if (setPrimaryError) {
    throw new Error(setPrimaryError.message);
  }
}
  // Upload newly selected photos.
  const uploadedPaths: string[] = [];

  try {
    const hasRemainingImages = remainingImages.length > 0;

    for (let index = 0; index < photoFiles.length; index++) {
      const file = photoFiles[index];

      const extension =
        file.type === "image/jpeg"
          ? "jpg"
          : file.type === "image/png"
            ? "png"
            : "webp";

      const storagePath =
        `${id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      uploadedPaths.push(storagePath);

      const { error: imageInsertError } = await supabase
        .from("product_images")
        .insert({
          product_id: id,
          storage_path: storagePath,
          alt_text: name,
          sort_order: remainingImages.length + index,
          is_primary:
            !hasRemainingImages && index === 0,
        });

      if (imageInsertError) {
        throw new Error(imageInsertError.message);
      }
    }
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage
        .from("product-images")
        .remove(uploadedPaths);
    }

    throw error;
  }

  // Update the product itself.
  const { error } = await supabase
    .from("products")
    .update({
      name,
      category_id: category.id,
      description: description || null,
      metal,
      purity,
      gold_weight:
        metal === "gold" && goldWeightRaw
          ? Number(goldWeightRaw)
          : null,
      gross_weight: grossWeightRaw
        ? Number(grossWeightRaw)
        : null,
      stone_weight: stoneWeightRaw
        ? Number(stoneWeightRaw)
        : null,
      stone_unit: stoneUnit || null,
      stone_type: stoneType || null,
      size: size || null,
      huid: huid || null,
      hallmark_status: hallmarkStatus || null,
      modification_available: modificationAvailable,
      availability,
      featured,
      additional_charges: additionalChargesRaw
        ? Number(additionalChargesRaw)
        : 0,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/products");
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const [{ data: product, error: productError }, { data: categories }] =
    await Promise.all([
      supabase
        .from("products")
        .select(`
  *,
  categories (
    slug
  ),
  product_images (
    id,
    storage_path,
    is_primary,
    sort_order
  )
`)
        .eq("id", id)
        .single(),

      supabase
        .from("categories")
        .select("name, slug")
        .eq("active", true)
        .order("sort_order"),
    ]);

  if (productError || !product) {
    notFound();
  }

  const categorySlug =
    Array.isArray(product.categories)
      ? product.categories[0]?.slug
      : product.categories?.slug;

 type ProductImage = {
  id: string;
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
};

const productImages = (product.product_images ?? []) as ProductImage[];

const existingImages = await Promise.all(
  [...productImages]
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) {
        return a.is_primary ? -1 : 1;
      }

      return a.sort_order - b.sort_order;
    })
    .map(async (image) => {
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(image.storage_path);

      return {
        id: image.id,
        url: data.publicUrl,
        is_primary: image.is_primary,
      };
    })
);  
return (
    <main className="min-h-screen bg-[#f1ece2]">
      <AdminNav />

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <p className="eyebrow">Products / Edit</p>

          <h1 className="serif mt-3 text-5xl">
            Edit Product
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-ink/60">
            Update the catalogue information for this Ranima
            Jewellers product.
          </p>
        </div>

        <form
          action={updateProduct.bind(null, product.id)}
          className="space-y-6 rounded-2xl bg-white p-5 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Product name"
              name="name"
              placeholder="Product name"
              defaultValue={product.name}
              required
            />

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em]"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                required
                defaultValue={categorySlug || ""}

                className="admin-input"
              >
                <option value="" disabled>
                  Select category
                </option>

                {categories?.map((category) => (
                  <option
                    key={category.slug}
                    value={category.slug}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="metal"

                className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em]"
              >
                Metal
              </label>

              <select
                id="metal"
                name="metal"
                defaultValue={product.metal}
                className="admin-input"
              >
                <option value="gold">22K Gold</option>
                <option value="silver">925 Silver</option>
              </select>
            </div>

            <Field
              label="Purity"
              name="purity"
              placeholder="22K"
              defaultValue={product.purity}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Gold weight (grams)"
              name="gold_weight"
              placeholder="e.g. 4.82"
              type="number"
              step="0.001"
              defaultValue={
                product.gold_weight != null
                  ? String(product.gold_weight)
                  : ""
              }
            />

            <Field
              label="Gross weight (grams)"
              name="gross_weight"
              placeholder="e.g. 5.10"
              type="number"
              step="0.001"
              defaultValue={
                product.gross_weight != null
                  ? String(product.gross_weight)
                  : ""
              }
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Size"
              name="size"
              placeholder="e.g. 16, 18, 2.4, 20 in"
              defaultValue={product.size || ""}
            />

            <Field
              label="HUID"
              name="huid"
              placeholder="Enter HUID"
              defaultValue={product.huid || ""}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Hallmark status"
              name="hallmark_status"
              placeholder="e.g. Hallmarked"
              defaultValue={product.hallmark_status || ""}
            />

            <div>
              <label
                htmlFor="availability"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em]"
              >
                Availability
              </label>

              <select
                id="availability"
                name="availability"
                defaultValue={product.availability}
                className="admin-input"
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
                <option value="MADE_TO_ORDER">
                  Made to Order
                </option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em]"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={product.description || ""}
              placeholder="Short product description"
              className="admin-input resize-none"
            />
          </div>
<ProductPhotoPicker existingImages={existingImages} />
          <div className="rounded-xl border border-ink/10 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">
              Astrological stone / additions
            </p>

            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              <Field
                label="Stone weight"
                name="stone_weight"
                placeholder="e.g. 0.25"
                type="number"
                step="0.001"
                defaultValue={
                  product.stone_weight != null
                    ? String(product.stone_weight)
                    : ""
                }
              />

              <Field
                label="Stone unit"
                name="stone_unit"
                placeholder="carat / gram"
                defaultValue={product.stone_unit || ""}
              />

              <Field
                label="Stone type"
                name="stone_type"
                placeholder="e.g. Ruby"
                defaultValue={product.stone_type || ""}
              />
            </div>
          </div>

          <div>
            <Field
              label="Additional charges (₹)"
              name="additional_charges"
              placeholder="0"
              type="number"
              step="0.01"
              defaultValue={String(
                product.additional_charges ?? 0
              )}
            />

            <p className="mt-2 text-xs leading-5 text-ink/50">
              Use this for pearls, stones, or other additions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 p-4">
              <input
                type="checkbox"
                name="modification_available"
                defaultChecked={product.modification_available}
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold">
                  Modification available
                </span>

                <span className="mt-1 block text-xs text-ink/50">
                  Size can be modified by enquiry.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 p-4">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product.featured}
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold">
                  Featured product
                </span>

                <span className="mt-1 block text-xs text-ink/50">
                  Show this product in featured sections.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="luxury-button w-full sm:w-fit"
            >
              Save changes
            </button>

            <Link
              href="/admin/products"
              className="ghost-button w-full text-center sm:w-fit"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  defaultValue,
  required = false,
  step,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        step={step}
        className="admin-input"
      />
    </div>
  );
}
