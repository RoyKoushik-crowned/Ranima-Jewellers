import Link from "next/link";

export default function StoryPage() {
  return (
    <main>
      <header className="bg-ink text-ivory">
        <nav className="container-luxury flex items-center justify-between py-6">
          <Link
            href="/"
            className="serif text-2xl tracking-[.18em]"
          >
            RANIMA
            <span className="block text-center font-sans text-[9px] tracking-[.42em] text-gold">
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

      <section className="container-luxury py-20 sm:py-28">
        <p className="eyebrow">Our story</p>

        <h1 className="serif mt-4 max-w-4xl text-7xl leading-[.9]">
          A name. A family. A legacy.
        </h1>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_.8fr]">
          <div
            className="aspect-[4/5] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1200&q=85')",
            }}
          />

          <div className="max-w-xl text-sm leading-8 text-ink/65">
            <p>
              Ranima Jewellers is a family jewellery business rooted in
              Guwahati, Assam, with nearly three decades of history.
            </p>

            <p className="mt-6">
              The name comes from our paternal grandmother — a personal
              connection that remains at the heart of the brand.
            </p>

            <p className="mt-6">
              Today, we are bringing that heritage into a contemporary digital
              experience while keeping the things that matter most: trust,
              craftsmanship, transparent communication and the personal
              relationship between a jeweller and a family.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

