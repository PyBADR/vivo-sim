"use client";

import type { EnergyImpact } from "@/lib/types/crisis";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  energy?: EnergyImpact | null;
  lang?: Lang;
}

function getRiskColor(value: number): string {
  if (value >= 0.7) return "text-red-400";
  if (value >= 0.5) return "text-amber-400";
  return "text-white";
}

export function EnergyShockPanel({ energy, lang = "en" }: Props) {
  const c = decisionCopy.impact.energy;

  if (!energy) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          {t(c.title, lang)}
        </p>
        <p className="mt-3 text-sm text-white/30">{t(c.noData, lang)}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        {t(c.title, lang)}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-black/25 p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-white/40">{t(c.oilShock, lang)}</p>
          <p className={`text-xl font-semibold ${getRiskColor(energy.oil_shock)}`}>{Math.round(energy.oil_shock * 100)}%</p>
        </div>
        <div className="rounded-2xl bg-black/25 p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-white/40">{t(c.refiningStress, lang)}</p>
          <p className={`text-xl font-semibold ${getRiskColor(energy.refining_stress)}`}>{Math.round(energy.refining_stress * 100)}%</p>
        </div>
        <div className="rounded-2xl bg-black/25 p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-white/40">{t(c.logisticsDelay, lang)}</p>
          <p className={`text-xl font-semibold ${getRiskColor(energy.logistics_delay)}`}>{Math.round(energy.logistics_delay * 100)}%</p>
        </div>
        <div className="rounded-2xl bg-blue-500/10 p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-white/40">{t(c.fuelScore, lang)}</p>
          <p className="text-xl font-semibold text-blue-300">{Math.round(energy.fuel_impact_score * 100)}%</p>
        </div>
      </div>
    </div>
  );
}
