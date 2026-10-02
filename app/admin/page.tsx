import Link from "next/link";
import {
  Package,
  Settings,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { sampleProducts } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const { data: rates } = await supabase
    .from("metal_rates")
    .select("metal, purity, rate_per_gram, effective_at")
    .in("metal", ["gold", "silver"])
    .order("effective_at", { ascending: false });

  const goldRate =
    rates?.find(
      (rate) => rate.metal === "gold" && rate.purity === "22K"
    )?.rate_per_gram ?? null;

  const silverRate =
    rates?.find(
      (rate) => rate.metal === "silver" && rate.purity === "925"
    )?.rate_per_gram ?? null;

  const available = sampleProducts.filter(
    (product) => product.availability === "AVAILABLE"
  ).length;

  const sold = sampleProducts.filter(
    (product) => product.availability === "SOLD"
  ).length;

  return (
    <main className="min-h-screen bg-[#f1ece2]">
      <AdminNav />

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-8">
        <p className="text-xs text-ink/50">Admin dashboard</p>

        <h1 className="serif mt-1 text-5xl">
          Good morning 👋
        </h1>

        {/* Dashboard stats */}
        <div className="mt-7 grid gap-4 md:grid-cols-3">

          {/* Metal rates */}
          <Link
            href="/admin/rates"
            className="rounded-2xl bg-white p-6 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-gold">
              <TrendingUp className="h-6 w-6" />
              <ArrowRight className="h-4 w-4" />
            </div>

            <p className="mt-8 text-[10px] uppercase tracking-[.16em] text-ink/45">
              Metal rates
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[.12em] text-ink/40">
                  22K Gold
                </p>

                <p className="serif mt-1 text-3xl">
                  {goldRate !== null
                    ? `₹${Number(goldRate).toLocaleString("en-IN")}`
                    : "—"}
                  <span className="ml-1 text-lg text-ink/50">/g</span>
                </p>
              </div>

              <div className="border-l border-ink/10 pl-4">
                <p className="text-[10px] uppercase tracking-[.12em] text-ink/40">
                  925 Silver
                </p>

                <p className="serif mt-1 text-3xl">
                  {silverRate !== null
                    ? `₹${Number(silverRate).toLocaleString("en-IN")}`
                    : "—"}
                  <span className="ml-1 text-lg text-ink/50">/g</span>
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs text-ink/40">
              Click to update rates
            </p>
          </Link>

          {/* Products */}
          <Stat
            title="Products"
            value={sampleProducts.length.toString()}
            icon={<Package className="h-6 w-6" />}
          />

          {/* Available */}
          <Stat
            title="Available"
            value={available.toString()}
            icon={<ShieldCheck className="h-6 w-6" />}
          />
        </div>

        {/* Main actions */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
<Link
  href="/admin/calculator"
  className="rounded-2xl bg-white p-6 transition-transform hover:-translate-y-0.5"
>
  <Calculator className="h-6 w-6 text-gold" />

  <h2 className="mt-8 font-serif text-3xl">
    Price Calculator
  </h2>

  <p className="mt-2 text-sm text-ink/55">
    Calculate gold value, making charges, GST and the final selling price.
  </p>
</Link>

          <Link
            href="/admin/products/new"
            className="rounded-2xl bg-ink p-6 text-ivory transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-6 w-6 text-gold" />

            <h2 className="serif mt-8 text-3xl">
              Add Product
            </h2>

            <p className="mt-2 text-sm text-ivory/60">
              Create a catalogue item and upload photos.
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="rounded-2xl bg-white p-6 transition-transform hover:-translate-y-0.5"
          >
            <Package className="h-6 w-6 text-gold" />

            <h2 className="serif mt-8 text-3xl">
              Inventory
            </h2>

            <p className="mt-2 text-sm text-ink/55">
              Manage availability, sold items and product details.
            </p>
          </Link>

          <Link
            href="/admin/rates/history"
            className="rounded-2xl bg-white p-6 transition-transform hover:-translate-y-0.5"
          >
            <TrendingUp className="h-6 w-6 text-gold" />

            <h2 className="serif mt-8 text-3xl">
              Rate History
            </h2>

          </Link>

          <Link
            href="/admin/settings"
            className="rounded-2xl bg-white p-6 transition-transform hover:-translate-y-0.5"
          >
            <Settings className="h-6 w-6 text-gold" />

            <h2 className="serif mt-8 text-3xl">
              Pricing Settings
            </h2>

            <p className="mt-2 text-sm text-ink/55">
              Manage making charge and GST rules.
            </p>
          </Link>
        </div>

        <p className="mt-6 text-xs text-ink/35">
          {sold} sold item{sold === 1 ? "" : "s"} currently recorded.
        </p>
      </section>
    </main>
  );
}

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6">
      <div className="flex items-center justify-between text-gold">
        {icon}
      </div>

      <p className="mt-8 text-[10px] uppercase tracking-[.16em] text-ink/45">
        {title}
      </p>

      <p className="serif mt-1 text-4xl">
        {value}
      </p>
    </div>
  );
}

function AdminNav() {
  return (
    <header className="border-b border-ink/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Link
          href="/admin"
          className="serif text-xl tracking-[.15em]"
        >
          RANIMA
          <span className="ml-2 text-[8px] font-sans tracking-[.3em] text-gold">
            ADMIN
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[.15em] text-ink/50 transition hover:text-ink"
          >
            View site
          </Link>

          <AdminLogoutButton />
        </div>
      </div>
    </header>
  );
}
