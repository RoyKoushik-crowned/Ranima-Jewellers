"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, RotateCcw } from "lucide-react";

import {
  calculateGoldPrice,
  DEFAULT_PRICING_SETTINGS,
  type PricingSettings,
} from "@/lib/pricing";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

export default function CalculatorPage() {
  const supabase = createSupabaseBrowserClient();

  const [goldRate, setGoldRate] = useState("");
  const [weight, setWeight] = useState("");
  const [additionalCharges, setAdditionalCharges] = useState("");

  const [settings, setSettings] = useState<PricingSettings>(
    DEFAULT_PRICING_SETTINGS
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCalculatorData() {
      setLoading(true);
      setError("");

      const [rateResult, settingsResult] = await Promise.all([
        supabase
          .from("metal_rates")
          .select("metal, purity, rate_per_gram, effective_at")
          .eq("metal", "gold")
          .eq("purity", "22K")
          .order("effective_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("pricing_settings")
          .select(
            "gold_making_percentage, lightweight_threshold, lightweight_making_charge, gold_gst_percentage, making_gst_percentage"
          )
          .order("active_from", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (rateResult.error) {
        setError(rateResult.error.message);
        setLoading(false);
        return;
      }

      if (settingsResult.error) {
        setError(settingsResult.error.message);
        setLoading(false);
        return;
      }

      if (rateResult.data?.rate_per_gram != null) {
        setGoldRate(String(rateResult.data.rate_per_gram));
      }

      if (settingsResult.data) {
setSettings({
  makingPercentage: Number(
    settingsResult.data.gold_making_percentage
  ),
  lightweightThreshold: Number(
    settingsResult.data.lightweight_threshold
  ),
  lightweightMakingCharge: Number(
    settingsResult.data.lightweight_making_charge
  ),
  goldGstPercentage: Number(
    settingsResult.data.gold_gst_percentage
  ),
  makingGstPercentage: Number(
    settingsResult.data.making_gst_percentage
  ),
});
      }

      setLoading(false);
    }

    loadCalculatorData();
  }, [supabase]);

  const calculation = useMemo(() => {
    const rate = Number(goldRate);
    const goldWeight = Number(weight);
    const extra = Number(additionalCharges || 0);

    if (
      !Number.isFinite(rate) ||
      !Number.isFinite(goldWeight) ||
      rate <= 0 ||
      goldWeight <= 0
    ) {
      return null;
    }

    return calculateGoldPrice(goldWeight, rate, extra, settings);
  }, [goldRate, weight, additionalCharges, settings]);

  const isLightweight =
    calculation !== null &&
    Number(weight) < settings.lightweightThreshold;

  function resetCalculator() {
    setGoldRate("");
    setWeight("");
    setAdditionalCharges("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[.15em] text-ink/50 transition hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin dashboard
            </Link>

            <p className="text-xs uppercase tracking-[.16em] text-ink/50">
              Admin tool
            </p>

            <h1 className="mt-1 font-serif text-5xl text-ink">
              Price calculator
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-ink/55">
              Calculate a complete 22K gold selling price using the current
              pricing settings.
            </p>
          </div>

          <button
            type="button"
            onClick={resetCalculator}
            className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-xs uppercase tracking-[.12em] text-ink/65 transition hover:bg-ink/5"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          <section className="rounded-2xl bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-ink/10 pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[.16em] text-ink/40">
                  Inputs
                </p>
                <h2 className="mt-1 font-serif text-3xl text-ink">
                  Item details
                </h2>
              </div>

              <Calculator className="h-6 w-6 text-gold" />
            </div>

            <div className="mt-7 space-y-6">
              <Field
                label="22K GOLD RATE / GRAM"
                value={goldRate}
                onChange={setGoldRate}
                suffix="₹"
                type="number"
                step="0.01"
                min="0"
                disabled={loading}
                note="Loaded from the latest 22K gold rate."
              />

              <Field
                label="GOLD WEIGHT"
                value={weight}
                onChange={setWeight}
                suffix="g"
                type="number"
                step="0.001"
                min="0"
                note={
  Number(weight) > 0 &&
  Number(weight) < settings.lightweightThreshold
    ? `Below ${settings.lightweightThreshold}g: fixed lightweight making charge applies.`
    : `At or above ${settings.lightweightThreshold}g: standard making percentage applies.`
}
              />

              <Field
                label="ADDITIONAL CHARGES"
                value={additionalCharges}
                onChange={setAdditionalCharges}
                suffix="₹"
                type="number"
                step="0.01"
                min="0"
                note="Optional charges added directly to the final total."
              />
            </div>

            <div className="mt-8 border-t border-ink/10 pt-6">
              <p className="text-[10px] uppercase tracking-[.16em] text-ink/40">
                Active pricing rules
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <Rule
                  label="Standard making"
                  value={`${settings.makingPercentage * 100}%`}
                />

                <Rule
                  label="Lightweight charge"
                  value={formatCurrency(settings.lightweightMakingCharge)}
                />

                <Rule
                  label="Gold GST"
                  value={`${settings.goldGstPercentage * 100}%`}
                />

                <Rule
                  label="Making GST"
                  value={`${settings.makingGstPercentage * 100}%`}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 sm:p-8">
            <div className="border-b border-ink/10 pb-5">
              <p className="text-[10px] uppercase tracking-[.16em] text-ink/40">
                Calculation
              </p>

              <h2 className="mt-1 font-serif text-3xl text-ink">
                Price breakdown
              </h2>
            </div>

            {!calculation ? (
              <div className="flex min-h-[420px] items-center justify-center text-center">
                <div>
                  <Calculator className="mx-auto h-8 w-8 text-ink/20" />
                  <p className="mt-4 font-serif text-2xl text-ink/45">
                    Enter weight to calculate
                  </p>
                  <p className="mt-2 text-sm text-ink/40">
                    The complete price breakdown will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-7">
                {isLightweight ? (
                  <div className="mb-5 rounded-xl bg-[#f6f1e8] px-4 py-3 text-sm text-ink/65">
                    <span className="font-medium text-ink">
                      Lightweight rule applied:
                    </span>{" "}
                    fixed making charge of{" "}
                    <span className="font-medium text-ink">
                      {formatCurrency(settings.lightweightMakingCharge)}
                    </span>
                  </div>
                ) : (
                  <div className="mb-5 rounded-xl bg-[#f6f1e8] px-4 py-3 text-sm text-ink/65">
                    <span className="font-medium text-ink">
                      Standard making rule applied:
                    </span>{" "}
                    {settings.makingPercentage * 100}% of gold value
                  </div>
                )}

                <div className="space-y-5">
                  <BreakdownRow
                    label="Gold value"
                    detail={`${weight} g × ${formatCurrency(Number(goldRate))}`}
                    value={calculation.goldValue}
                  />

                  <BreakdownRow
                    label="Making charge"
                    detail={
                      isLightweight
                        ? "Fixed lightweight charge"
                        : `${settings.makingPercentage * 100}% of gold value`
                    }
                    value={calculation.makingCharge}
                  />

                  <BreakdownRow
                    label="GST on gold"
                    detail={`${settings.goldGstPercentage * 100}% of gold value`}
                    value={calculation.goldGst}
                  />

                  <BreakdownRow
                    label="GST on making"
                    detail={`${settings.makingGstPercentage * 100}% of making charge`}
                    value={calculation.makingGst}
                  />

                  <BreakdownRow
                    label="Additional charges"
                    detail="Added directly"
                    value={calculation.additionalCharges}
                  />
                </div>

                <div className="mt-7 border-t border-ink/15 pt-6">
                  <p className="text-[10px] uppercase tracking-[.16em] text-ink/40">
                    Total calculation
                  </p>

                  <div className="mt-4 rounded-2xl bg-[#f6f1e8] p-5">
                    <div className="space-y-2 text-sm text-ink/65">
                      <EquationRow
                        label="Gold value"
                        value={calculation.goldValue}
                      />
                      <EquationRow
                        label="Making charge"
                        value={calculation.makingCharge}
                      />
                      <EquationRow
                        label="GST on gold"
                        value={calculation.goldGst}
                      />
                      <EquationRow
                        label="GST on making"
                        value={calculation.makingGst}
                      />
                      <EquationRow
                        label="Additional charges"
                        value={calculation.additionalCharges}
                      />
                    </div>

                    <div className="my-4 border-t border-ink/15" />

                    <div className="flex items-end justify-between gap-4">
                      <span className="font-serif text-2xl text-ink">
                        Total
                      </span>

                      <span className="text-right font-serif text-4xl text-ink">
                        {formatCurrency(calculation.finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
  type,
  step,
  min,
  disabled,
  note,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  type: string;
  step: string;
  min: string;
  disabled?: boolean;
  note: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[.16em] text-ink/50">
        {label}
      </label>

      <div className="mt-2 flex items-center rounded-2xl border border-ink/10 bg-white px-4 transition focus-within:border-ink/30">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          step={step}
          min={min}
          disabled={disabled}
          className="w-full bg-transparent py-4 text-lg text-ink outline-none disabled:opacity-50"
          placeholder="0"
        />

        <span className="ml-3 text-sm text-ink/45">{suffix}</span>
      </div>

      <p className="mt-2 text-xs text-ink/40">{note}</p>
    </div>
  );
}

function Rule({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-l border-ink/10 pl-3">
      <p className="text-[10px] uppercase tracking-[.1em] text-ink/40">
        {label}
      </p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}

function BreakdownRow({
  label,
  detail,
  value,
}: {
  label: string;
  detail: string;
  value: number;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-ink/8 pb-4">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-1 text-xs text-ink/40">{detail}</p>
      </div>

      <p className="whitespace-nowrap text-right text-sm text-ink">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function EquationRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
