import { ProductCard } from "@/components/ProductCard";
import { sampleProducts } from "@/lib/demo-data";
import { calculateGoldPrice } from "@/lib/pricing";
import Link from "next/link";
import { Search } from "lucide-react";

const categories = [
  "All",
  "Rings",
  "Earrings",
  "Necklaces",
  "Chains",
  "Bangles",
  "Bracelets",
  "Mangalsutra",
  "Nose Pins",
  "Silver",
  "Coins",
];

const DEMO_GOLD_RATE = 6125;

type SearchParams = {
  category?: string;
  price?: string;
  weight?: string;
  availability?: string;
};

export default async function JewelleryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const category = params.category?.toLowerCase() || "all";
  const priceFilter = params.price || "all";
  const weightFilter = params.weight || "all";
  const availabilityFilter = params.availability || "all";

  let products = sampleProducts.filter(
    (p) =>
      category === "all" ||
      p.category.toLowerCase() === category
  );

  products = products.filter((p) => {
    if (priceFilter === "all") return true;

    if (p.metal !== "gold" || p.gold_weight == null) return false;

    const price = calculateGoldPrice(
      p.gold_weight,
      DEMO_GOLD_RATE,
      p.additional_charges || 0
    ).finalPrice;

    switch (priceFilter) {
      case "under-50000":
        return price < 50000;
      case "50000-100000":
        return price >= 50000 && price < 100000;
      case "100000-200000":
        return price >= 100000 && price < 200000;
      case "200000-plus":
        return price >= 200000;
      default:
        return true;
    }
  });

  products = products.filter((p) => {
    if (weightFilter === "all") return true;
    if (p.gold_weight == null) return false;

    switch (weightFilter) {
      case "under-2":
        return p.gold_weight < 2;
      case "2-5":
        return p.gold_weight >= 2 && p.gold_weight < 5;
      case "5-10":
        return p.gold_weight >= 5 && p.gold_weight < 10;
      case "10-plus":
        return p.gold_weight >= 10;
      default:
        return true;
    }
  });

  products = products.filter((p) => {
    if (availabilityFilter === "all") return true;
    return p.availability === availabilityFilter;
  });

  const makeHref = (changes: Record<string, string>) => {
    const query = new URLSearchParams();

    if (category !== "all") query.set("category", category);
    if (priceFilter !== "all") query.set("price", priceFilter);
    if (weightFilter !== "all") query.set("weight", weightFilter);
    if (availabilityFilter !== "all") {
      query.set("availability", availabilityFilter);
    }

    Object.entries(changes).forEach(([key, value]) => {
      if (value === "all") {
        query.delete(key);
      } else {
        query.set(key, value);
      }
    });

    const qs = query.toString();
    return qs ? `/jewellery?${qs}` : "/jewellery";
  };

  const hasFilters =
    priceFilter !== "all" ||
    weightFilter !== "all" ||
    availabilityFilter !== "all";

  return (
    <main className="min-h-screen">
      <header className="bg-ink text-ivory">
        <nav className="container-luxury flex items-center justify-between py-6">
          <Link
            href="/"
            className="serif text-2xl tracking-[.18em]"
          >
            RANIMA
            <span className="block text-center text-[9px] font-sans tracking-[.42em] text-gold">
              JEWELLERS
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs uppercase tracking-[.15em]"
          >
            Home
          </Link>
        </nav>
      </header>

      <section className="container-luxury py-14 sm:py-20">
        <p className="eyebrow">The collection</p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="serif text-6xl leading-none">
              Jewellery
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-ink/60">
              Discover our collection of handcrafted 22K gold jewellery.
            </p>
          </div>

          <span className="text-xs text-ink/50">
            {products.length} pieces
          </span>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-y border-ink/10 py-4">
          {categories.map((c) => (
            <Link
              key={c}
              href={
                c === "All"
                  ? makeHref({ category: "all" })
                  : makeHref({ category: c.toLowerCase() })
              }
              className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[.12em] ${
                category === c.toLowerCase() ||
                (c === "All" && category === "all")
                  ? "border-gold bg-gold text-ink"
                  : "border-ink/15"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <div className="flex items-center gap-3 rounded-full border border-ink/15 bg-white/60 px-4 py-3 text-sm text-ink/50">
            <Search size={16} />
            <span>Search jewellery...</span>
          </div>

          <details className="relative">
            <summary className="cursor-pointer list-none rounded-full border border-ink/15 px-4 py-3 text-[10px] uppercase tracking-[.12em]">
              Price ▾
            </summary>

            <div className="absolute right-0 z-30 mt-2 min-w-[220px] rounded-2xl border border-ink/10 bg-ivory p-2 shadow-xl">
              <Link href={makeHref({ price: "all" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                All prices
              </Link>
              <Link href={makeHref({ price: "under-50000" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                Under ₹50,000
              </Link>
              <Link href={makeHref({ price: "50000-100000" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                ₹50,000 – ₹1,00,000
              </Link>
              <Link href={makeHref({ price: "100000-200000" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                ₹1,00,000 – ₹2,00,000
              </Link>
              <Link href={makeHref({ price: "200000-plus" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                ₹2,00,000+
              </Link>
            </div>
          </details>

          <details className="relative">
            <summary className="cursor-pointer list-none rounded-full border border-ink/15 px-4 py-3 text-[10px] uppercase tracking-[.12em]">
              Weight ▾
            </summary>

            <div className="absolute right-0 z-30 mt-2 min-w-[180px] rounded-2xl border border-ink/10 bg-ivory p-2 shadow-xl">
              <Link href={makeHref({ weight: "all" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                All weights
              </Link>
              <Link href={makeHref({ weight: "under-2" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                Under 2g
              </Link>
              <Link href={makeHref({ weight: "2-5" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                2g – 5g
              </Link>
              <Link href={makeHref({ weight: "5-10" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                5g – 10g
              </Link>
              <Link href={makeHref({ weight: "10-plus" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                10g+
              </Link>
            </div>
          </details>

          <details className="relative">
            <summary className="cursor-pointer list-none rounded-full border border-ink/15 px-4 py-3 text-[10px] uppercase tracking-[.12em]">
              Availability ▾
            </summary>

            <div className="absolute right-0 z-30 mt-2 min-w-[190px] rounded-2xl border border-ink/10 bg-ivory p-2 shadow-xl">
              <Link href={makeHref({ availability: "all" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                All
              </Link>
              <Link href={makeHref({ availability: "AVAILABLE" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                Available
              </Link>
              <Link href={makeHref({ availability: "RESERVED" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                Reserved
              </Link>
              <Link href={makeHref({ availability: "SOLD" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                Sold
              </Link>
              <Link href={makeHref({ availability: "MADE_TO_ORDER" })} className="block rounded-xl px-4 py-3 text-xs hover:bg-ink/5">
                Made to Order
              </Link>
            </div>
          </details>
        </div>

        {hasFilters && (
          <div className="mt-4">
            <Link
              href={makeHref({
                price: "all",
                weight: "all",
                availability: "all",
              })}
              className="text-[10px] font-semibold uppercase tracking-[.15em] text-gold underline underline-offset-4"
            >
              Clear filters
            </Link>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="mt-10 py-20 text-center">
            <p className="serif text-3xl">No pieces found</p>
            <p className="mt-2 text-sm text-ink/50">
              Try changing your filters.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
