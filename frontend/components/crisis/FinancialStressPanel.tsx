"use client";

import type { FinancialStressImpact } from "@/lib/types/crisis";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  finance?: FinancialStressImpact | null;
  lang?: Lang;
}

function getRiskColor(value: number): string {
  if (value >= 0.7) return "text-red-400";
  if (value >= 0.5) return "text-amber-400";
  return "text-white";
}

export function FinancialStressPanel({ finance, lang = "en" }: Props) {
  const c = decisionCopy.impact.financial;

  if (!finance) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          {t(c.title, lang)}
        </p>
        <p className="mt-3 text-sm text-white/30">{t(c.noData, lang)}</p>
      </div>
    );
  }

  const metrics = [
    { label: c.oilVolatility, value: finance.oil_volatility },
    { label: c.liquidityStress, value: finance.liquidity_stress },
    { label: c.sentimentShock, value: finance.sentiment_shock },
    { label: c.insuranceRepricing, value: finance.insurance_repricing },
  ];

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          {t(c.title, lang)}
        </p>
        <p className="mt-2 text-sm text-white/60 leading-relaxed">
          {t(c.headline, lang)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ label, value }) => (
          <div key={label.en} className="rounded-2xl bg-black/25 p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              {t(label, lang)}
            </p>
            <p className={`text-xl font-semibold ${getRiskColor(value)}`}>
              {Math.round(value * 100)}%
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-yellow-400/15 bg-yellow-500/10 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">{t(c.score, lang)}</p>
          <p className={`text-2xl font-semibold ${getRiskColor(finance.market_stress_score)}`}>
            {Math.round(finance.market_stress_score * 100)}%
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.03] px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider text-amber-300/60 mb-1">
          {t(decisionCopy.actions.whyItMatters, lang)}
        </p>
        <p className="text-[11px] text-white/50 leading-relaxed">
          {t(c.implication, lang)}
        </p>
      </div>
    </div>
  );
}
