import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { sampleProducts } from "@/lib/demo-data";
export default function SilverPage() {
  const products = sampleProducts.filter(p => p.metal === "silver");
  return <main><header className="bg-ink text-ivory"><nav className="container-luxury flex items-center justify-between py-6"><Link href="/" className="serif text-2xl tracking-[.18em]">RANIMA <span className="block text-center text-[9px] font-sans tracking-[.42em] text-gold">JEWELLERS</span></Link><Link href="/jewellery" className="text-xs uppercase tracking-[.15em]">Jewellery</Link></nav></header><section className="container-luxury py-16"><p className="eyebrow">925 silver</p><h1 className="serif mt-3 text-6xl">Silver</h1><p className="mt-4 max-w-xl text-sm leading-7 text-ink/60">Explore our 925 silver collection. Pricing is currently available through manual enquiry.</p><div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">{products.map(p=><ProductCard product={p} key={p.id}/>)}</div></section></main>;
}