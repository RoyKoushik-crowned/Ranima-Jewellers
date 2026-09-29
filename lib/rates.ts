/**
 * V1 demo adapter.
 * Replace getCurrentGoldRate() with the selected market-rate API once
 * GOLD_RATE_API_URL / GOLD_RATE_API_KEY are configured.
 *
 * Do not expose provider keys to the browser.
 */

const DEMO_22K_RATE = 6125;

export async function getCurrentGoldRate(): Promise<number> {
  const url = process.env.GOLD_RATE_API_URL;
  const key = process.env.GOLD_RATE_API_KEY;

  if (!url) return DEMO_22K_RATE;

  try {
    const response = await fetch(url, {
      headers: key ? { Authorization: `Bearer ${key}` } : undefined,
      next: { revalidate: 300 }
    });

    if (!response.ok) throw new Error(`Rate provider returned ${response.status}`);
    const data = await response.json();

    // Adapt this mapping to the selected provider.
    const rate = Number(data?.gold_22k_inr_per_gram ?? data?.gold_22k ?? data?.rate);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("Invalid rate");
    return rate;
  } catch {
    return DEMO_22K_RATE;
  }
}