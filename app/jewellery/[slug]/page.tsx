import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { sampleProducts } from "@/lib/demo-data";
import { calculateGoldPrice } from "@/lib/pricing";
import { getCurrentGoldRate } from "@/lib/rates";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = sampleProducts.find(p => p.slug === slug);
  if (!product) notFound();

  const rate = product.metal === "gold" ? await getCurrentGoldRate() : null;
  const pricing = rate && product.gold_weight ? calculateGoldPrice(product.gold_weight, rate, product.additional_charges || 0) : null;
  const message = `Hi Ranima Jewellers, I would like to enquire about this product:\n\n${product.name}\n${product.purity} ${product.metal}\nWeight: ${product.gold_weight ? `${product.gold_weight}g` : "On enquiry"}\nSize: ${product.size || "N/A"}\nHUID: ${product.huid || "N/A"}\nEstimated price: ${pricing ? `₹${Math.round(pricing.finalPrice).toLocaleString("en-IN")}` : "On enquiry"}\n${rate ? `22K reference rate: ₹${rate.toLocaleString("en-IN")}/g` : ""}\n\nPlease share availability and final store price.`;
  return (
    <main className="min-h-screen">
      <header className="border-b border-ink/10"><nav className="container-luxury flex items-center justify-between py-6"><Link href="/" className="serif text-2xl tracking-[.18em]">RANIMA <span className="block text-center text-[9px] font-sans tracking-[.42em] text-gold">JEWELLERS</span></Link><Link href="/jewellery" className="text-xs uppercase tracking-[.15em]">Collection</Link></nav></header>
      <section className="container-luxury py-8 sm:py-14">
        <Link href="/jewellery" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.15em] text-ink/55"><ArrowLeft size={14}/> Back to jewellery</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="aspect-square overflow-hidden bg-sand"><img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" /></div>
            <div className="mt-3 grid grid-cols-3 gap-3">{product.images.map((img,i)=><img key={i} src={img} alt="" className="aspect-square object-cover" />)}</div>
          </div>
          <div className="lg:pt-8">
            <p className="eyebrow">{product.purity} · {product.category}</p>
            <h1 className="serif mt-3 text-6xl leading-[.92]">{product.name}</h1>
            <p className="mt-5 text-sm leading-7 text-ink/60">{product.description}</p>
            <div className="mt-8 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[.12em]">
              <span className="rounded-full bg-sage/10 px-3 py-2 text-sage">{product.availability.replace("_"," ")}</span>
              <span className="rounded-full border border-ink/10 px-3 py-2"><CheckCircle2 size={13} className="mr-1 inline text-gold"/> Hallmarked</span>
            </div>
            {pricing ? (
              <div className="mt-8 border-y border-ink/10 py-7">
                <p className="text-[10px] uppercase tracking-[.18em] text-ink/45">Estimated current price</p>
                <p className="serif mt-1 text-5xl">₹{Math.round(pricing.finalPrice).toLocaleString("en-IN")}*</p>
                <div className="mt-6 space-y-3 text-xs">
                  <Row label={`Gold value (${product.gold_weight}g × ₹${rate!.toLocaleString("en-IN")})`} value={pricing.goldValue}/>
                  <Row label={`Making charges (${product.gold_weight! >= 1.5 ? "10%" : "₹1,400 fixed"})`} value={pricing.makingCharge}/>
                  <Row label="GST on gold (3%)" value={pricing.goldGst}/>
                  <Row label="GST on making (3%)" value={pricing.makingGst}/>
                  {pricing.additionalCharges > 0 && <Row label="Additional charges" value={pricing.additionalCharges}/>}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 font-semibold"><span>Estimated total</span><span>₹{Math.round(pricing.finalPrice).toLocaleString("en-IN")}</span></div>
                <p className="mt-4 text-[10px] leading-5 text-ink/45">22K reference rate: ₹{rate!.toLocaleString("en-IN")}/g · Rate timestamp is generated from the active rate record. Final price subject to confirmation at the store.</p>
              </div>
            ) : <div className="mt-8 border-y border-ink/10 py-8"><p className="serif text-4xl">Price on enquiry</p><p className="mt-2 text-xs text-ink/50">Our team will confirm the current 925 silver price.</p></div>}
            <div className="mt-7 grid gap-3">
              <WhatsAppButton message={message}/>
              {product.modification_available && <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999"}?text=${encodeURIComponent(`Hi Ranima Jewellers, can ${product.name} be modified? Current size: ${product.size || "N/A"}.`)}`} target="_blank" rel="noreferrer" className="ghost-button w-full">Ask about size modification</a>}
            </div>
            <div className="mt-8 grid gap-4 border-t border-ink/10 pt-7 sm:grid-cols-2">
              <Info label="Weight" value={product.gold_weight ? `${product.gold_weight}g` : "On enquiry"}/>
              <Info label="Size" value={product.size || "Not specified"}/>
              <Info label="HUID" value={product.huid || "Not listed"}/>
              <Info label="Purity" value={product.purity}/>
            </div>
            <Link href="/huid" className="mt-7 flex items-center gap-3 rounded-sm border border-ink/10 bg-white/50 p-4 text-xs"><ShieldCheck className="text-gold" size={20}/><span><strong>Verify your HUID</strong><br/><span className="text-ink/50">Use the official BIS verification route.</span></span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
function Row({label,value}:{label:string,value:number}) { return <div className="flex justify-between gap-4"><span className="text-ink/55">{label}</span><span>₹{Math.round(value).toLocaleString("en-IN")}</span></div>; }
function Info({label,value}:{label:string,value:string}) { return <div><p className="text-[9px] uppercase tracking-[.18em] text-ink/40">{label}</p><p className="mt-1 text-sm">{value}</p></div>; }