import type { FinancialStressImpact } from "@/lib/types/crisis";

interface Props {
  finance?: FinancialStressImpact | null;
}

export function FinancialStressPanel({ finance }: Props) {
  if (!finance) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Financial Stress
        </p>
        <p className="mt-3 text-sm text-white/50">No financial data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Financial Stress
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        Market Stability Layer
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Oil Volatility</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {finance.oil_volatility.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Liquidity Stress</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {finance.liquidity_stress.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Sentiment Shock</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {finance.sentiment_shock.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-black/25 p-4">
          <p className="text-xs text-white/45">Insurance Repricing</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {finance.insurance_repricing.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-yellow-400/15 bg-yellow-500/10 p-4">
        <p className="text-xs text-white/50">Market Stress Score</p>
        <p className="mt-2 text-2xl font-semibold text-yellow-300">
          {finance.market_stress_score.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
