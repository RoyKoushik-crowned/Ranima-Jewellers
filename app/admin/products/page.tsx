import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/AdminNav";
import type { Product, Availability } from "@/lib/types";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  metal: "gold" | "silver";
  purity: string;
  gold_weight: number | null;
  gross_weight: number | null;
  stone_weight: number | null;
  stone_unit: string | null;
  stone_type: string | null;
  size: string | null;
  huid: string | null;
  hallmark_status: string | null;
  modification_available: boolean;
  availability: Availability;
  featured: boolean;
  additional_charges: number;
  archived: boolean;
  category_id: string | null;
  product_images: {
    storage_path: string;
    sort_order: number;
    is_primary: boolean;
  }[];
};

export default async function AdminProducts() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      metal,
      purity,
      gold_weight,
      gross_weight,
      stone_weight,
      stone_unit,
      stone_type,
      size,
      huid,
      hallmark_status,
      modification_available,
      availability,
      featured,
      additional_charges,
      archived,
      category_id,
      product_images (
        storage_path,
        sort_order,
        is_primary
      )
    `)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug");

  const categoryMap = new Map(
    (categories ?? []).map((category) => [category.id, category.name])
  );

  if (error) {
    return (
      <main className="min-h-screen bg-[#f1ece2]">
        <AdminNav />

        <section className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="serif text-4xl">Inventory</h1>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Unable to load products from Supabase.
            <p className="mt-2 font-mono text-xs">{error.message}</p>
          </div>
        </section>
      </main>
    );
  }

  const products: Product[] = (data as ProductRow[]).map((product) => {
    const sortedImages = [...(product.product_images ?? [])].sort(
      (a, b) => {
        if (a.is_primary !== b.is_primary) {
          return a.is_primary ? -1 : 1;
        }

        return a.sort_order - b.sort_order;
      }
    );

    const images = sortedImages.map((image) => {
      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(image.storage_path);

      return publicUrl.publicUrl;
    });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category:
        categoryMap.get(product.category_id ?? "") ??
        "Uncategorised",
      description: product.description ?? "",
      metal: product.metal,
      purity: product.purity,
      gold_weight: product.gold_weight,
      gross_weight: product.gross_weight,
      stone_weight: product.stone_weight,
      stone_type: product.stone_type,
      size: product.size,
      huid: product.huid,
      hallmark_status: product.hallmark_status ?? "",
      modification_available: product.modification_available,
      availability: product.availability,
      featured: product.featured,
      additional_charges: product.additional_charges,
      images,
    };
  });

  return (
    <main className="min-h-screen bg-[#f1ece2]">
      <AdminNav />

      <section className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Inventory</p>

            <h1 className="serif mt-3 text-5xl">
              Jewellery collection
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-ink/60">
              Manage your catalogue, availability, weights and product
              information.
            </p>
          </div>
          <Link
             href="/admin/products/new"  
             className="luxury-button inline-flex w-fit">
            Add product
          </Link>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <div className="border-b border-ink/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/50">
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <h2 className="serif text-3xl">
                Your catalogue is empty
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-ink/55">
                Add your first jewellery item to start building the Ranima
                Jewellers catalogue.
              </p>

              <Link
                href="/admin/products/new"
                className="luxury-button mt-6 inline-flex"
              >
                Add your first product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-ink/10">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sand">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-ink/40">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-gold">
                      {product.category}
                    </p>

                    <h2 className="serif mt-1 text-2xl">
                      {product.name}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/55">
                      <span>{product.purity}</span>

                      {product.gold_weight != null && (
                        <span>{product.gold_weight}g gold</span>
                      )}

                      {product.gross_weight != null && (
                        <span>{product.gross_weight}g gross</span>
                      )}

                      {product.size && (
                        <span>Size {product.size}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className="rounded-full bg-sage/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-ink/60">
                      {product.availability.replace("_", " ")}
                    </span>

                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.12em] transition hover:border-ink/30"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
