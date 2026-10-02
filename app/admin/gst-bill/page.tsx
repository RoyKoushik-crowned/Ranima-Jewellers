"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type PricingSettings = {
  goldMakingPercentage: number;
  lightweightThreshold: number;
  lightweightMakingCharge: number;
  goldGstPercentage: number;
  makingGstPercentage: number;
};

const DEFAULT_SETTINGS: PricingSettings = {
  goldMakingPercentage: 0.1,
  lightweightThreshold: 1,
  lightweightMakingCharge: 1500,
  goldGstPercentage: 0.015,
  makingGstPercentage: 0.015,
};

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function GstBillPage() {
  const [billNumber, setBillNumber] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [goldRate, setGoldRate] = useState("");
  const [goldWeight, setGoldWeight] = useState("");
  const [additionalCharges, setAdditionalCharges] = useState("0");

  const [settings, setSettings] =
    useState<PricingSettings>(DEFAULT_SETTINGS);

useEffect(() => {
  async function loadSettings() {
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("pricing_settings")
      .select(
        "gold_making_percentage, lightweight_threshold, lightweight_making_charge, gold_gst_percentage, making_gst_percentage"
      )
      .order("active_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return;
    }

    setSettings({
      goldMakingPercentage:
        Number(data.gold_making_percentage) || 0.1,

      lightweightThreshold:
        Number(data.lightweight_threshold) || 1,

      lightweightMakingCharge:
        Number(data.lightweight_making_charge) || 1500,

      // Database stores combined 3% GST.
      // Bill splits it equally into CGST and SGST.
      goldGstPercentage:
        (Number(data.gold_gst_percentage) || 0.03) / 2,

      makingGstPercentage:
        (Number(data.making_gst_percentage) || 0.03) / 2,
    });
  }

  loadSettings();
}, []);
  const calculation = useMemo(() => {
    const rate = Number(goldRate) || 0;
    const weight = Number(goldWeight) || 0;
    const additional = Number(additionalCharges) || 0;

    const goldValue = rate * weight;

    const isLightweight =
      weight > 0 && weight < settings.lightweightThreshold;

    const makingCharge = isLightweight
      ? settings.lightweightMakingCharge
      : goldValue * settings.goldMakingPercentage;

    const cgstOnGold = goldValue * settings.goldGstPercentage;
    const sgstOnGold = goldValue * settings.goldGstPercentage;

    const cgstOnMaking = makingCharge * settings.makingGstPercentage;
    const sgstOnMaking = makingCharge * settings.makingGstPercentage;

    const subtotal =
      goldValue +
      makingCharge +
      cgstOnGold +
      sgstOnGold +
      cgstOnMaking +
      sgstOnMaking +
      additional;

    const roundedTotal = Math.round(subtotal);
    const roundOff = roundedTotal - subtotal;

    return {
      goldValue,
      makingCharge,
      cgstOnGold,
      sgstOnGold,
      cgstOnMaking,
      sgstOnMaking,
      additional,
      subtotal,
      roundOff,
      roundedTotal,
      isLightweight,
    };
  }, [
    goldRate,
    goldWeight,
    additionalCharges,
    settings,
  ]);

  function resetBill() {
    setBillNumber("");
    setDate(new Date().toISOString().split("T")[0]);
    setCustomerName("");
    setCustomerPhone("");
    setGoldWeight("");
    setAdditionalCharges("0");
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink/45">
              GST billing
            </p>

            <h1 className="mt-2 font-serif text-5xl text-ink">
              GST Bill Printer
            </h1>

            <p className="mt-3 text-sm text-ink/55">
              Create a basic printable bill using the active pricing rules.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetBill}
              className="flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-3 text-sm transition hover:bg-ink/5"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-white transition hover:bg-ink/90"
            >
              <Printer className="h-4 w-4" />
              Print Bill
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl bg-white p-7">
            <h2 className="font-serif text-3xl">Bill details</h2>

            <div className="mt-7 space-y-5">
              <Field
                label="Bill number"
                value={billNumber}
                onChange={setBillNumber}
                placeholder="INV-001"
              />

              <Field
                label="Date"
                type="date"
                value={date}
                onChange={setDate}
              />

              <Field
                label="Customer name"
                value={customerName}
                onChange={setCustomerName}
                placeholder="Customer name"
              />

              <Field
                label="Customer phone"
                value={customerPhone}
                onChange={setCustomerPhone}
                placeholder="Phone number"
              />

              <Field
                label="22K gold rate / gram"
                type="number"
                value={goldRate}
                onChange={setGoldRate}
                placeholder="13800"
                suffix="₹"
              />

              <Field
                label="Gold weight"
                type="number"
                step="0.001"
                value={goldWeight}
                onChange={setGoldWeight}
                placeholder="1.000"
              />

              <Field
                label="Additional charges"
                type="number"
                value={additionalCharges}
                onChange={setAdditionalCharges}
                placeholder="0"
                suffix="₹"
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-7 print-area">
            <div className="border-b border-ink/10 pb-6 text-center">
              <p className="font-serif text-3xl tracking-[0.08em]">
                RANIMA JEWELLERS
              </p>

              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/45">
                Guwahati, Assam
              </p>

              <h2 className="mt-6 text-sm font-medium uppercase tracking-[0.2em]">
                GST Invoice
              </h2>
            </div>

            <div className="grid gap-4 border-b border-ink/10 py-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/40">
                  Bill number
                </p>
                <p className="mt-1">{billNumber || "—"}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/40">
                  Date
                </p>
                <p className="mt-1">{date || "—"}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/40">
                  Customer
                </p>
                <p className="mt-1">{customerName || "—"}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/40">
                  Phone
                </p>
                <p className="mt-1">{customerPhone || "—"}</p>
              </div>
            </div>

            <div className="py-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ink/40">
                    Item
                  </p>

                  <p className="mt-1 font-serif text-2xl">
                    22K Gold Jewellery
                  </p>
                </div>

                <p className="text-sm text-ink/55">
                  {goldWeight || "0"} g
                </p>
              </div>

              <div className="space-y-4">
                <BillRow
                  label="Gold value"
                  value={money(calculation.goldValue)}
                  detail={
                    goldWeight && goldRate
                      ? `${goldWeight} g × ${money(Number(goldRate))}`
                      : undefined
                  }
                />

                <BillRow
                  label="Making charge"
                  value={money(calculation.makingCharge)}
                  detail={
                    calculation.isLightweight
                      ? "Fixed lightweight charge"
                      : `${settings.goldMakingPercentage * 100}% of gold value`
                  }
                />

                <BillRow
                  label="CGST on gold"
                  value={money(calculation.cgstOnGold)}
                  detail="1.5% of gold value"
                />

                <BillRow
                  label="SGST on gold"
                  value={money(calculation.sgstOnGold)}
                  detail="1.5% of gold value"
                />

                <BillRow
                  label="CGST on making"
                  value={money(calculation.cgstOnMaking)}
                  detail="1.5% of making charge"
                />

                <BillRow
                  label="SGST on making"
                  value={money(calculation.sgstOnMaking)}
                  detail="1.5% of making charge"
                />

                <BillRow
                  label="Additional charges"
                  value={money(calculation.additional)}
                  detail="Added directly"
                />
              </div>
            </div>

            <div className="border-t border-ink/10 pt-5">
              <BillRow
                label="Subtotal"
                value={money(calculation.subtotal)}
              />

              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  <p>Round off</p>
                  <p className="text-xs text-ink/40">
                    Adjusted to nearest whole rupee
                  </p>
                </div>

                <p>
                  {calculation.roundOff >= 0 ? "+" : ""}
                  {money(calculation.roundOff)}
                </p>
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-ink/10 pt-5">
                <p className="font-serif text-3xl">Total</p>

                <p className="font-serif text-4xl">
                  {money(calculation.roundedTotal)}
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-ink/40">
              Thank you for shopping with Ranima Jewellers.
            </p>
          </section>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          .print-area,
          .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            inset: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            box-shadow: none !important;
          }

          @page {
            margin: 12mm;
          }
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.15em] text-ink/45">
        {label}
      </span>

      <div className="relative mt-2">
        <input
          type={type}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-ink/10 bg-white px-5 py-4 pr-12 outline-none transition focus:border-ink/30"
        />

        {suffix && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-ink/45">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function BillRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-ink/5 pb-4">
      <div>
        <p className="text-sm">{label}</p>

        {detail && (
          <p className="mt-1 text-xs text-ink/40">
            {detail}
          </p>
        )}
      </div>

      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
