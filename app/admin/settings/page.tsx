"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type PricingSettings = {
  id: string;
  gold_making_percentage: number;
  lightweight_threshold: number;
  lightweight_making_percentage: number;
  gold_gst_percentage: number;
  making_gst_percentage: number;
};

export default function Settings() {
  const supabase = createSupabaseBrowserClient();

  const [settingsId, setSettingsId] = useState("");
  const [goldMaking, setGoldMaking] = useState("10");
  const [lightweightThreshold, setLightweightThreshold] = useState("1.0");
  const [lightweightMaking, setLightweightMaking] = useState("10");
  const [goldGst, setGoldGst] = useState("3");
  const [makingGst, setMakingGst] = useState("3");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("pricing_settings")
        .select(
          "id, gold_making_percentage, lightweight_threshold, lightweight_making_percentage, gold_gst_percentage, making_gst_percentage"
        )
        .order("active_from", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const settings = data as PricingSettings;

        setSettingsId(settings.id);
        setGoldMaking(String(settings.gold_making_percentage * 100));
        setLightweightThreshold(String(settings.lightweight_threshold));
        setLightweightMaking(
          String(settings.lightweight_making_percentage * 100)
        );
        setGoldGst(String(settings.gold_gst_percentage * 100));
        setMakingGst(String(settings.making_gst_percentage * 100));
      }

      setLoading(false);
    }

    loadSettings();
  }, []);

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    setError("");

    const goldMakingValue = Number(goldMaking);
    const thresholdValue = Number(lightweightThreshold);
    const lightweightMakingValue = Number(lightweightMaking);
    const goldGstValue = Number(goldGst);
    const makingGstValue = Number(makingGst);

    if (
      !Number.isFinite(goldMakingValue) ||
      !Number.isFinite(thresholdValue) ||
      !Number.isFinite(lightweightMakingValue) ||
      !Number.isFinite(goldGstValue) ||
      !Number.isFinite(makingGstValue)
    ) {
      setError("Please enter valid numeric values.");
      setSaving(false);
      return;
    }

    if (
      goldMakingValue < 0 ||
      thresholdValue <= 0 ||
      lightweightMakingValue < 0 ||
      goldGstValue < 0 ||
      makingGstValue < 0
    ) {
      setError("Please enter valid positive values.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Please log in again.");
      setSaving(false);
      return;
    }

    if (!settingsId) {
      setError("Pricing settings record was not found.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("pricing_settings")
      .update({
        gold_making_percentage: goldMakingValue / 100,
        lightweight_threshold: thresholdValue,
        lightweight_making_percentage: lightweightMakingValue / 100,
        gold_gst_percentage: goldGstValue / 100,
        making_gst_percentage: makingGstValue / 100,
        active_from: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq("id", settingsId);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage("Pricing settings saved successfully.");
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-[#f1ece2]">
      <AdminNav />

      <section className="mx-auto max-w-3xl px-4 py-7 sm:px-8">
        <p className="text-xs text-ink/50">Pricing</p>

        <h1 className="serif text-5xl">Pricing settings</h1>

        <div className="mt-7 space-y-5 rounded-2xl bg-white p-6">
          {loading ? (
            <p className="text-sm text-ink/50">Loading pricing settings...</p>
          ) : (
            <>
              <Setting
                label="Gold making percentage"
                value={goldMaking}
                suffix="%"
                note="Applied to the gold value for products weighing 1.0g or more."
                onChange={setGoldMaking}
                disabled={saving}
              />

              <Setting
                label="Lightweight threshold"
                value={lightweightThreshold}
                suffix="g"
                note="Products below this weight use the lightweight making rule."
                onChange={setLightweightThreshold}
                disabled={saving}
              />

              <Setting
                label="Lightweight making percentage"
                value={lightweightMaking}
                suffix="%"
                note="Fixed percentage of the current gold rate per gram for products below the threshold."
                onChange={setLightweightMaking}
                disabled={saving}
              />

              <Setting
                label="GST on gold"
                value={goldGst}
                suffix="%"
                note="GST applied to the gold value."
                onChange={setGoldGst}
                disabled={saving}
              />

              <Setting
                label="GST on making"
                value={makingGst}
                suffix="%"
                note="GST applied to the making charge."
                onChange={setMakingGst}
                disabled={saving}
              />

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="w-full rounded-full bg-ink px-6 py-4 text-xs font-semibold uppercase tracking-[.15em] text-ivory transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save settings"}
              </button>

              {message && (
                <p className="text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="text-sm text-red-700">{error}</p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function Setting({
  label,
  value,
  suffix,
  note,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  suffix: string;
  note: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <label className="block border-b border-ink/10 pb-5">
      <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink/45">
        {label}
      </span>

      <div className="relative mt-2">
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-4 pr-14 text-base text-ink outline-none transition focus:border-ink/30 disabled:bg-ink/[0.02]"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/45">
          {suffix}
        </span>
      </div>

      <span className="mt-2 block text-[10px] leading-5 text-ink/40">
        {note}
      </span>
    </label>
  );
}
