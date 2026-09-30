"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MetalRate = {
  id: string;
  metal: string;
  purity: string;
  rate_per_gram: number;
  currency: string;
  source: string;
  source_reference: string | null;
  effective_at: string;
};

type RateCardProps = {
  title: string;
  purity: string;
  rate: MetalRate | null;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
};

export default function Rates() {
  const supabase = createSupabaseBrowserClient();

  const [goldRate, setGoldRate] = useState<MetalRate | null>(null);
  const [silverRate, setSilverRate] = useState<MetalRate | null>(null);

  const [goldValue, setGoldValue] = useState("");
  const [silverValue, setSilverValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingMetal, setSavingMetal] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRates() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("metal_rates")
      .select(
        "id, metal, purity, rate_per_gram, currency, source, source_reference, effective_at"
      )
      .in("metal", ["gold", "silver"])
      .order("effective_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const rates = data as MetalRate[];

    const latestGold =
      rates.find((rate) => rate.metal === "gold" && rate.purity === "22K") ??
      null;

    const latestSilver =
      rates.find(
        (rate) => rate.metal === "silver" && rate.purity === "925"
      ) ?? null;

    setGoldRate(latestGold);
    setSilverRate(latestSilver);

    if (latestGold) {
      setGoldValue(String(latestGold.rate_per_gram));
    }

    if (latestSilver) {
      setSilverValue(String(latestSilver.rate_per_gram));
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRates();
  }, []);

  async function saveRate(
    metal: "gold" | "silver",
    purity: "22K" | "925",
    value: string
  ) {
    setSavingMetal(metal);
    setMessage("");
    setError("");

    const rate = Number(value);

    if (!Number.isFinite(rate) || rate <= 0) {
      setError(
        `Please enter a valid ${metal === "gold" ? "gold" : "silver"} rate.`
      );
      setSavingMetal(null);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Please log in again.");
      setSavingMetal(null);
      return;
    }

    const { error } = await supabase.from("metal_rates").insert({
      metal,
      purity,
      rate_per_gram: rate,
      currency: "INR",
      source: "manual",
      source_reference: `Admin manual update by ${user.id}`,
      effective_at: new Date().toISOString(),
    });

    if (error) {
      setError(error.message);
      setSavingMetal(null);
      return;
    }

    setMessage(
      `${metal === "gold" ? "22K Gold" : "925 Silver"} rate updated successfully.`
    );

    await loadRates();
    setSavingMetal(null);
  }

  return (
    <main className="min-h-screen bg-[#f1ece2]">
      <AdminNav />

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-8">
        <p className="text-xs text-ink/50">Rates</p>

        <h1 className="serif text-5xl">Metal rates</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/50">
          Manage the active 22K gold and 925 silver reference rates. Each
          manual update creates a new rate record so previous rates remain in
          the history.
        </p>

        {loading ? (
          <div className="mt-7 rounded-2xl bg-white p-8">
            <p className="text-sm text-ink/50">Loading metal rates...</p>
          </div>
        ) : (
          <>
            <div className="mt-7 grid gap-6 lg:grid-cols-2">
              <RateCard
                title="22K Gold"
                purity="22K"
                rate={goldRate}
                value={goldValue}
                onChange={setGoldValue}
                onSave={() => saveRate("gold", "22K", goldValue)}
                saving={savingMetal === "gold"}
              />

              <RateCard
                title="925 Silver"
                purity="925"
                rate={silverRate}
                value={silverValue}
                onChange={setSilverValue}
                onSave={() => saveRate("silver", "925", silverValue)}
                saving={savingMetal === "silver"}
              />
            </div>

            {message && (
              <p className="mt-5 text-sm text-green-700">{message}</p>
            )}

            {error && (
  <p className="mt-5 text-sm text-red-700">{error}</p>
)}
</>
)}
      </section>
    </main>
  );
}

function RateCard({
  title,
  purity,
  rate,
  value,
  onChange,
  onSave,
  saving,
}: RateCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-ink/45">
            {purity}
          </p>

          <h2 className="serif mt-2 text-3xl">{title}</h2>
        </div>

        <span className="rounded-full bg-ink/[0.04] px-3 py-1 text-[10px] uppercase tracking-[.12em] text-ink/50">
          {rate?.source ?? "Unavailable"}
        </span>
      </div>

      <div className="mt-7">
        <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink/45">
          Current rate
        </p>

        <p className="serif mt-2 text-4xl">
          {rate
            ? `₹${Number(rate.rate_per_gram).toLocaleString("en-IN")}/g`
            : "No rate"}
        </p>
      </div>

      {rate && (
        <div className="mt-4 border-t border-ink/10 pt-4 text-xs text-ink/45">
          <div className="flex justify-between gap-4">
            <span>Effective</span>
            <span>
              {new Date(rate.effective_at).toLocaleString("en-IN")}
            </span>
          </div>

          {rate.source_reference && (
            <div className="mt-2 flex justify-between gap-4">
              <span>Reference</span>
              <span className="text-right">{rate.source_reference}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-7 border-t border-ink/10 pt-6">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink/45">
            New rate per gram
          </span>

          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink/45">
              ₹
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              disabled={saving}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-4 pl-9 text-base text-ink outline-none focus:border-ink/30 disabled:bg-ink/[0.02]"
            />
          </div>
        </label>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="mt-4 w-full rounded-full bg-ink px-6 py-4 text-xs font-semibold uppercase tracking-[.15em] text-ivory transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : `Save ${title} rate`}
        </button>
      </div>
    </div>
  );
}
