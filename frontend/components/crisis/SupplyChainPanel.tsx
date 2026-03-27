"use client";

import type { SupplyChainImpact } from "@/lib/types/crisis";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  supply?: SupplyChainImpact | null;
  lang?: Lang;
}

function getRiskColor(value: number): string {
  if (value >= 0.7) return "bg-red-400/60";
  if (value >= 0.5) return "bg-amber-400/60";
  return "bg-emerald-400/60";
}

export function SupplyChainPanel({ supply, lang = "en" }: Props) {
  const c = decisionCopy.impact.supply;

  if (!supply) {
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
    { label: c.foodImports, value: supply.food_imports_stress },
    { label: c.medicineSupply, value: supply.medicine_supply_stress },
    { label: c.airportCargo, value: supply.airport_cargo_stress },
    { label: c.lastMile, value: supply.last_mile_pressure },
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

      <div className="space-y-3">
        {metrics.map(({ label, value }) => (
          <div key={label.en} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span className="text-xs">{t(label, lang)}</span>
              <span className="text-xs font-medium">{Math.round(value * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06]">
              <div
                className={`h-2 rounded-full ${getRiskColor(value)} transition-all`}
                style={{ width: `${Math.min(value * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">{t(c.score, lang)}</p>
          <p className="text-2xl font-semibold text-emerald-300">
            {Math.round(supply.supply_chain_score * 100)}%
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
