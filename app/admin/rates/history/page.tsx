import { AdminNav } from "@/components/AdminNav";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RateRow = {
  id: string;
  metal: string;
  purity: string;
  rate_per_gram: number;
  currency: string;
  source: string;
  source_reference: string | null;
  effective_at: string;
};

function formatRate(rate: number) {
  return `₹${rate.toLocaleString("en-IN")}/g`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function RateChart({
  rates,
  label,
}: {
  rates: RateRow[];
  label: string;
}) {
  if (rates.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-ink/10 bg-[#faf8f3] text-sm text-ink/45">
        More rate changes are needed to display the graph.
      </div>
    );
  }

  const width = 900;
  const height = 300;
  const padding = 40;

  const values = rates.map((rate) => Number(rate.rate_per_gram));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = rates
    .map((rate, index) => {
      const x =
        padding +
        (index / (rates.length - 1)) * (width - padding * 2);

      const y =
        height -
        padding -
        ((Number(rate.rate_per_gram) - min) / range) *
          (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  const latest = rates[rates.length - 1];

  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-ink/45">
            {label}
          </p>
          <p className="serif mt-2 text-4xl">
            {formatRate(Number(latest.rate_per_gram))}
          </p>
        </div>

        <p className="text-xs text-ink/45">
          {rates.length} recorded rates
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-[#faf8f3] p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-72 min-w-[700px] w-full"
          role="img"
          aria-label={`${label} price history`}
        >
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="currentColor"
          />

          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="currentColor"
            strokeOpacity="0.12"
          />

          <polyline
            points={points}
            fill="none"
            stroke="#c89b3c"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {rates.map((rate, index) => {
            const x =
              padding +
              (index / (rates.length - 1)) *
                (width - padding * 2);

            const y =
              height -
              padding -
              ((Number(rate.rate_per_gram) - min) / range) *
                (height - padding * 2);

            return (
              <circle
                key={rate.id}
                cx={x}
                cy={y}
                r="5"
                fill="#c89b3c"
              >
                <title>
                  {formatRate(Number(rate.rate_per_gram))} —{" "}
                  {formatDate(rate.effective_at)}
                </title>
              </circle>
            );
          })}

          <text
            x={padding}
            y={height - 10}
            fontSize="11"
            fill="currentColor"
            opacity="0.45"
          >
            {formatDate(rates[0].effective_at)}
          </text>

          <text
            x={width - padding}
            y={height - 10}
            textAnchor="end"
            fontSize="11"
            fill="currentColor"
            opacity="0.45"
          >
            {formatDate(rates[rates.length - 1].effective_at)}
          </text>

          <text
            x={padding}
            y={padding - 10}
            fontSize="11"
            fill="currentColor"
            opacity="0.45"
          >
            ₹{max.toLocaleString("en-IN")}
          </text>

          <text
            x={padding}
            y={height - padding + 22}
            fontSize="11"
            fill="currentColor"
            opacity="0.45"
          >
            ₹{min.toLocaleString("en-IN")}
          </text>
        </svg>
      </div>
    </div>
  );
}

export default async function RateHistory() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("metal_rates")
    .select(
      "id, metal, purity, rate_per_gram, currency, source, source_reference, effective_at"
    )
    .order("effective_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rates = (data ?? []) as RateRow[];

  const goldRates = rates.filter(
    (rate) =>
      rate.metal.toLowerCase() === "gold" &&
      rate.purity.toLowerCase() === "22k"
  );

  const silverRates = rates.filter(
    (rate) =>
      rate.metal.toLowerCase() === "silver" &&
      rate.purity === "925"
  );

  return (
    <main className="min-h-screen bg-[#f1ece2]">
      <AdminNav />

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-8">
        <p className="text-xs text-ink/50">Rates</p>

        <h1 className="serif mt-1 text-5xl">
          Rate history
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55">
          Track historical 22K gold and 925 silver reference rates.
          Every manual rate update is retained with its timestamp and
          source reference.
        </p>

        <div className="mt-8 space-y-6">
          <section className="rounded-2xl bg-white p-6 sm:p-8">
            <RateChart
              rates={goldRates}
              label="22K Gold price history"
            />
          </section>

          <section className="rounded-2xl bg-white p-6 sm:p-8">
            <RateChart
              rates={silverRates}
              label="925 Silver price history"
            />
          </section>

          <section className="rounded-2xl bg-white p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-ink/45">
                Recorded changes
              </p>

              <h2 className="serif mt-2 text-3xl">
                Rate history
              </h2>
            </div>

            {rates.length === 0 ? (
              <p className="py-8 text-sm text-ink/45">
                No rate history has been recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[.14em] text-ink/45">
                      <th className="pb-4 pr-4">Metal</th>
                      <th className="pb-4 pr-4">Rate</th>
                      <th className="pb-4 pr-4">Effective</th>
                      <th className="pb-4 pr-4">Source</th>
                      <th className="pb-4">Reference</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[...rates].reverse().map((rate) => (
                      <tr
                        key={rate.id}
                        className="border-b border-ink/10 last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <div className="font-medium">
                            {rate.metal === "gold"
                              ? "22K Gold"
                              : "925 Silver"}
                          </div>
                          <div className="mt-1 text-xs text-ink/40">
                            {rate.purity}
                          </div>
                        </td>

                        <td className="py-4 pr-4 font-medium">
                          {formatRate(Number(rate.rate_per_gram))}
                        </td>

                        <td className="py-4 pr-4 text-ink/55">
                          {formatDate(rate.effective_at)}
                        </td>

                        <td className="py-4 pr-4 capitalize text-ink/55">
                          {rate.source}
                        </td>

                        <td className="max-w-xs py-4 text-ink/55">
                          {rate.source_reference || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
