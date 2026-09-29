import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/AdminNav";
import { ProductPhotoPicker } from "@/components/ProductPhotoPicker";

async function createProduct(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
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

  const photoFiles = formData
    .getAll("product_photos")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (photoFiles.length > 4) {
    throw new Error("You can upload a maximum of 4 product photos.");
  }

  for (const file of photoFiles) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error(
        "Only JPG, PNG and WebP product photos are supported."
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Each product photo must be 8MB or smaller.");
    }
  }

  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (categoryError || !category) {
    throw new Error("Selected category could not be found.");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name,
      slug,
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
      archived: false,
    })
    .select("id")
    .single();

  if (productError || !product) {
    throw new Error(productError?.message || "Could not create product.");
  }

  const uploadedPaths: string[] = [];

  try {
    for (let index = 0; index < photoFiles.length; index++) {
      const file = photoFiles[index];

      const extension =
        file.type === "image/jpeg"
          ? "jpg"
          : file.type === "image/png"
            ? "png"
            : "webp";

      const storagePath =
        `${product.id}/${crypto.randomUUID()}.${extension}`;

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

      const { error: imageError } = await supabase
        .from("product_images")
        .insert({
          product_id: product.id,
          storage_path: storagePath,
          alt_text: name,
          sort_order: index,
          is_primary: index === 0,
        });

      if (imageError) {
        throw new Error(imageError.message);
      }
    }
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage
        .from("product-images")
        .remove(uploadedPaths);
    }

    await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    throw error;
  }

  redirect("/admin/products");
}

export default async function NewProductPage() {
  const supabase = await createSupabaseServerClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("active", true)
    .order("sort_order");

  return (
    <main className="min-h-screen bg-[#f1ece2]">
      <AdminNav />

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <p className="eyebrow">Products / Add</p>

          <h1 className="serif mt-3 text-5xl">
            Add Product
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-ink/60">
            Add a jewellery item to the Ranima Jewellers catalogue.
          </p>
        </div>

        <form
          action={createProduct}
          className="space-y-6 rounded-2xl bg-white p-5 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Product name"
              name="name"
              placeholder="e.g. Floral Heritage Ring"
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
                className="admin-input"
                defaultValue=""
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
                className="admin-input"
                defaultValue="gold"
              >
                <option value="gold">22K Gold</option>
                <option value="silver">925 Silver</option>
              </select>
            </div>

            <Field
              label="Purity"
              name="purity"
              placeholder="22K"
              defaultValue="22K"
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
            />

            <Field
              label="Gross weight (grams)"
              name="gross_weight"
              placeholder="e.g. 5.10"
              type="number"
              step="0.001"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Size"
              name="size"
              placeholder="e.g. 16, 18, 2.4, 20 in"
            />

            <Field
              label="HUID"
              name="huid"
              placeholder="Enter HUID"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Hallmark status"
              name="hallmark_status"
              placeholder="e.g. Hallmarked"
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
                className="admin-input"
                defaultValue="AVAILABLE"
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
              placeholder="Short product description"
              className="admin-input resize-none"
            />
          </div>

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
              />

              <Field
                label="Stone unit"
                name="stone_unit"
                placeholder="carat / gram"
              />

              <Field
                label="Stone type"
                name="stone_type"
                placeholder="e.g. Ruby"
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
              defaultValue="0"
            />

            <p className="mt-2 text-xs leading-5 text-ink/50">
              Use this for pearls, stones, or other additions included
              in the displayed price.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 p-4">
              <input
                type="checkbox"
                name="modification_available"
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

          <ProductPhotoPicker />

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="luxury-button w-full sm:w-fit"
            >
              Save product
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
