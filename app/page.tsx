 	import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";
import { ProductCard } from "@/components/ProductCard";
import { RateStrip } from "@/components/RateStrip";
import { sampleProducts } from "@/lib/demo-data";

export default function HomePage() {
  const featured = sampleProducts.slice(0, 6);

  return (
    <main>
      <section className="relative min-h-[88vh] overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(212,175,87,.18),transparent_30%),linear-gradient(90deg,rgba(23,22,20,.98),rgba(23,22,20,.35))]" />
        <div className="absolute right-0 top-0 h-full w-full bg-[url('https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
        <header className="relative z-10">
          <Nav dark />
        </header>
        <div className="container-luxury relative z-10 flex min-h-[76vh] items-end pb-16 pt-24 sm:items-center sm:pb-24">
          <MotionReveal className="max-w-2xl">
            <p className="eyebrow">Ranima Jewellers · Guwahati</p>
            <h1 className="serif mt-5 text-6xl leading-[.9] sm:text-7xl lg:text-8xl">
              Jewellery that carries a legacy.
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-ivory/75 sm:text-base">
              Nearly three decades of family heritage, craftsmanship and celebrations — reimagined for today.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/jewellery" className="luxury-button">
                Explore the collection <ArrowRight size={15} />
              </Link>
              <Link href="/our-story" className="ghost-button border-ivory/40 text-ivory hover:border-gold hover:text-gold">
                Our story
              </Link>
            </div>
          </MotionReveal>
        </div>
        <div className="absolute bottom-6 right-8 hidden text-right sm:block">
          <p className="serif text-xl italic text-gold">A name. A family. A legacy.</p>
        </div>
      </section>

      <RateStrip />

      <section className="container-luxury py-20 sm:py-28">
        <MotionReveal>
          <p className="eyebrow">Explore our collections</p>
          <div className="mt-3 flex items-end justify-between gap-6">
            <h2 className="serif max-w-xl text-5xl leading-none sm:text-6xl">Timeless pieces. For every story.</h2>
            <Link href="/jewellery" className="hidden text-xs font-semibold uppercase tracking-[.18em] sm:block">View all →</Link>
          </div>
        </MotionReveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Rings", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"],
            ["Earrings", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"],
            ["Necklaces", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"],
            ["Bangles", "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80"],
            ["Chains", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80"],
            ["Mangalsutra", "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80"]
          ].map(([name, image]) => (
            <Link href={`/jewellery?category=${name.toLowerCase()}`} key={name} className="group relative aspect-[3/4] overflow-hidden bg-ink">
              <img src={image} alt={name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 text-ivory">
                <p className="serif text-2xl">{name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.2em] text-gold">Discover →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white/55 py-20 sm:py-28">
        <div className="container-luxury">
          <MotionReveal>
            <p className="eyebrow">Featured pieces</p>
            <h2 className="serif mt-3 text-5xl leading-none sm:text-6xl">Chosen for today.</h2>
          </MotionReveal>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {featured.map((p) => <ProductCard product={p} key={p.id} />)}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 text-ivory sm:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-20" />
        <div className="container-luxury relative grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <MotionReveal>
            <p className="eyebrow">Our story</p>
            <h2 className="serif mt-4 text-6xl leading-[.92] sm:text-7xl">A name. A family. A legacy.</h2>
          </MotionReveal>
          <MotionReveal delay={0.1}>
            <p className="text-sm leading-7 text-ivory/75">
              Named after our paternal grandmother, Ranima Jewellers carries a story rooted in family, trust and craftsmanship. For nearly three decades, we have been part of celebrations and everyday moments across Guwahati.
            </p>
            <Link href="/our-story" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-gold">
              Discover our story <ArrowRight size={14} />
            </Link>
          </MotionReveal>
        </div>
      </section>

      <section className="container-luxury grid gap-5 py-20 sm:grid-cols-2 sm:py-28">
        <div className="card p-8 sm:p-12">
          <p className="eyebrow">Custom jewellery</p>
          <h2 className="serif mt-4 text-5xl">Something only you could wear.</h2>
          <p className="mt-5 text-sm leading-7 text-ink/65">Have an idea in mind? Tell us what you are imagining and our team can discuss the possibilities.</p>
          <Link href="/custom" className="luxury-button mt-8">Discuss your design <ArrowRight size={15} /></Link>
        </div>
        <div className="card overflow-hidden bg-sage text-ivory">
          <div className="grid min-h-[320px] grid-cols-[1fr_.9fr]">
            <div className="p-8 sm:p-12">
              <p className="eyebrow">Visit Ranima Jewellers</p>
              <h2 className="serif mt-4 text-5xl">Guwahati, Assam.</h2>
              <div className="mt-8 flex items-start gap-3 text-sm"><MapPin size={18} className="mt-1 text-gold" /><span>Our physical showroom in Guwahati.</span></div>
              <Link href="/contact" className="mt-8 inline-flex rounded-full border border-ivory/40 px-5 py-3 text-xs font-semibold uppercase tracking-[.15em]">Store details</Link>
            </div>
            <div className="bg-[url('https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center" />
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white/50">
        <div className="container-luxury grid gap-8 py-10 sm:grid-cols-4">
		{[
  {
    Icon: BadgeCheck,
    title: "22K Gold",
    copy: "Gold jewellery collection",
  },
  {
    Icon: ShieldCheck,
    title: "Hallmarked",
    copy: "HUID verification support",
  },
  {
    Icon: Sparkles,
    title: "Transparent pricing",
    copy: "Current reference rate + calculation",
  },
  {
    Icon: MapPin,
    title: "Visit our store",
    copy: "Guwahati, Assam",
  },
].map(({ Icon, title, copy }) => (
  <div key={title} className="flex gap-4">
    <Icon className="mt-1 text-gold" size={24} />
    <div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-ink/55">{copy}</p>
    </div>
  </div>
))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Nav({ dark = false }: { dark?: boolean }) {
  const text = dark ? "text-ivory" : "text-ink";
  return (
    <nav className={`container-luxury flex items-center justify-between py-6 ${text}`}>
      <Link href="/" className="serif text-2xl tracking-[.18em]">
        RANIMA <span className="block text-center text-[9px] font-sans tracking-[.42em] text-gold">JEWELLERS</span>
      </Link>
      <div className="hidden items-center gap-7 text-[10px] font-semibold uppercase tracking-[.15em] md:flex">
        <Link href="/jewellery">Jewellery</Link>
        <Link href="/silver">Silver</Link>
        <Link href="/custom">Custom</Link>
        <Link href="/our-story">Our Story</Link>
        <Link href="/huid">HUID</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <Link href="/jewellery" className="hidden rounded-full border border-gold px-4 py-2 text-[10px] font-semibold uppercase tracking-[.12em] text-gold sm:block">Explore</Link>
      <Link href="/jewellery" className="md:hidden text-xs uppercase tracking-[.15em]">Menu</Link>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-ink py-12 text-ivory">
      <div className="container-luxury grid gap-10 sm:grid-cols-3">
        <div>
          <p className="serif text-3xl tracking-[.15em]">RANIMA</p>
          <p className="mt-1 text-[9px] tracking-[.4em] text-gold">JEWELLERS</p>
          <p className="mt-5 max-w-xs text-xs leading-6 text-ivory/55">Jewellery for today. A legacy for generations.</p>
        </div>
        <div className="text-xs leading-7 text-ivory/65">
          <p className="mb-2 font-semibold uppercase tracking-[.16em] text-ivory">Explore</p>
          <Link className="block hover:text-gold" href="/jewellery">Jewellery</Link>
          <Link className="block hover:text-gold" href="/silver">Silver</Link>
          <Link className="block hover:text-gold" href="/custom">Custom Jewellery</Link>
          <Link className="block hover:text-gold" href="/our-story">Our Story</Link>
        </div>
        <div className="text-xs leading-7 text-ivory/65">
          <p className="mb-2 font-semibold uppercase tracking-[.16em] text-ivory">Visit</p>
          <p>Guwahati, Assam</p>
          <p>Store hours to be configured</p>
          <Link className="text-gold" href="/contact">Contact Ranima →</Link>
        </div>
      </div>
      <div className="container-luxury mt-10 border-t border-ivory/10 pt-6 text-[10px] text-ivory/40">© {new Date().getFullYear()} Ranima Jewellers. All rights reserved.</div>
    </footer>
  );
}
