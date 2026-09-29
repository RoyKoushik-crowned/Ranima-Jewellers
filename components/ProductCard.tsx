import Link from "next/link";
import type { Product } from "@/lib/types";
import { calculateGoldPrice } from "@/lib/pricing";

export function ProductCard({ product }: { product: Product }) {
  const price =
  product.metal === "gold" && product.gold_weight != null
    ? calculateGoldPrice(
        product.gold_weight,
        6125,
        product.additional_charges || 0
      ).finalPrice
    : null;
  return (
    <Link href={`/jewellery/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
        <div className="absolute left-3 top-3 rounded-full bg-ivory/90 px-3 py-1 text-[9px] font-semibold uppercase tracking-[.12em]">{product.availability.replace("_", " ")}</div>
      </div>
      <div className="pt-4">
        <p className="text-[9px] font-semibold uppercase tracking-[.18em] text-gold">{product.metal === "gold" ? "22K Gold" : "925 Silver"}</p>
        <h3 className="serif mt-1 text-xl">{product.name}</h3>
        <div className="mt-1 flex items-center justify-between text-xs text-ink/55">
          <span>{product.gold_weight ? `${product.gold_weight}g` : "Price on enquiry"}</span>
          {price ? <span className="font-semibold text-ink">₹{price.toLocaleString("en-IN")}*</span> : <span>Enquire →</span>}
        </div>
      </div>
    </Link>
  );
}
