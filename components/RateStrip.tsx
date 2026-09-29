import { getCurrentGoldRate } from "@/lib/rates";

export async function RateStrip() {
  const rate = await getCurrentGoldRate();
  return (
    <section className="border-b border-ink/10 bg-ivory">
      <div className="container-luxury grid gap-4 py-6 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
        <div>
          <p className="eyebrow">Today&apos;s 22K gold rate</p>
          <p className="serif mt-1 text-3xl">₹{rate.toLocaleString("en-IN")} <span className="font-sans text-xs text-ink/50">/ gram</span></p>
        </div>
        <div className="hidden h-10 w-px bg-ink/10 sm:block" />
        <div className="text-xs text-ink/55">
          <p>Updated automatically</p>
          <p className="mt-1">{rate === 6125 ? "Demo rate — configure provider" : "Market reference rate"}</p>
        </div>
        <a href="/jewellery" className="text-xs font-semibold uppercase tracking-[.15em] text-maroon">View jewellery →</a>
      </div>
    </section>
  );
}