import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentGoldRate(): Promise<number> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("metal_rates")
    .select("rate_per_gram")
    .eq("metal", "gold")
    .eq("purity", "22K")
    .order("effective_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Unable to fetch 22K gold rate: ${error.message}`);
  }

  const rate = Number(data?.[0]?.rate_per_gram);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("No valid 22K gold rate is available.");
  }

  return rate;
}

export async function getCurrentSilverRate(): Promise<number> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("metal_rates")
    .select("rate_per_gram")
    .eq("metal", "silver")
    .eq("purity", "925")
    .order("effective_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Unable to fetch 925 silver rate: ${error.message}`);
  }

  const rate = Number(data?.[0]?.rate_per_gram);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("No valid 925 silver rate is available.");
  }

  return rate;
}
