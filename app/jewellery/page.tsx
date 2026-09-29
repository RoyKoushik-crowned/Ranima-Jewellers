import { ProductCard } from "@/components/ProductCard";
import { sampleProducts } from "@/lib/demo-data";
import { Search } from "lucide-react";
import Link from "next/link";

const categories = ["All", "Rings", "Earrings", "Necklaces", "Chains", "Bangles", "Bracelets", "Mangalsutra", "Nose Pins", "Silver", "Coins"];

export default async function JewelleryPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const category = params.category?.toLowerCase();
  const products = sampleProducts.filter(p => !category || category === "all" || p.category === category);
  return (
    <main className="min-h-screen">
      <header className="bg-ink text-ivory">
        <nav className="container-luxury flex items-center justify-between py-6">
          <Link href="/" className="serif text-2xl tracking-[.18em]">RANIMA <span className="block text-center text-[9px] font-sans tracking-[.42em] text-gold">JEWELLERS</span></Link>
          <Link href="/" className="text-xs uppercase tracking-[.15em]">Home</Link>
        </nav>
      </header>
      <section className="container-luxury py-14 sm:py-20">
        <p className="eyebrow">The collection</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <div><h1 className="serif text-6xl leading-none">Jewellery</h1><p className="mt-4 max-w-xl text-sm leading-6 text-ink/60">Discover our collection of handcrafted 22K gold jewellery.</p></div>
          <span className="text-xs text-ink/50">{products.length} pieces in demo catalogue</span>
        </div>
        <div className="mt-10 flex flex-wrap gap-2 border-y border-ink/10 py-4">
          {categories.map(c => <Link key={c} href={c === "All" ? "/jewellery" : `/jewellery?category=${c.toLowerCase()}`} className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[.12em] ${category === c.toLowerCase() || (!category && c==="All") ? "border-gold bg-gold text-ink" : "border-ink/15"}`}>{c}</Link>)}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <div className="flex items-center gap-3 rounded-full border border-ink/15 bg-white/60 px-4 py-3 text-sm text-ink/50"><Search size={16}/> Search jewellery…</div>
          <button className="rounded-full border border-ink/15 px-4 py-3 text-[10px] uppercase tracking-[.12em]">Price ▾</button>
          <button className="rounded-full border border-ink/15 px-4 py-3 text-[10px] uppercase tracking-[.12em]">Weight ▾</button>
          <button className="rounded-full border border-ink/15 px-4 py-3 text-[10px] uppercase tracking-[.12em]">Availability ▾</button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {products.map(p => <ProductCard product={p} key={p.id} />)}
        </div>
      </section>
    </main>
  );
}