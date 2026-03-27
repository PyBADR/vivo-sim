"use client";

import type { DecisionOption } from "@/lib/types/decision-intelligence";
import type { RankedAction } from "@/lib/types/crisis";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  options?: DecisionOption[];
  rankedActions?: RankedAction[];
  lang?: Lang;
}

const RECOMMENDATION_LABELS: Record<string, { key: keyof typeof decisionCopy.decisions; bg: string; text: string }> = {
  strongly_recommended: { key: "stronglyRecommended", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-300" },
  recommended: { key: "recommended", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-300" },
  conditional: { key: "conditional", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-300" },
  not_recommended: { key: "notRecommended", bg: "bg-red-500/10 border-red-500/20", text: "text-red-300" },
};

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 rounded-full bg-white/[0.06]">
      <div
        className={`h-1 rounded-full ${color} transition-all`}
        style={{ width: `${Math.min(value * 100, 100)}%` }}
      />
    </div>
  );
}

export function DecisionPanel({ options, rankedActions, lang = "en" }: Props) {
  const c = decisionCopy.decisions;
  const hasOptions = options && options.length > 0;
  const hasActions = rankedActions && rankedActions.length > 0;

  /* ── Empty state ── */
  if (!hasOptions && !hasActions) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>
        <p className="mt-3 text-sm text-white/30">{t(c.noOptions, lang)}</p>
      </div>
    );
  }

  /* ── Decision Options (from decision-intelligence endpoint) ── */
  if (hasOptions) {
    const sorted = [...options].sort((a, b) => b.risk_reduction - a.risk_reduction);
    const primary = sorted[0];
    const alternatives = sorted.slice(1);

    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
            {t(c.title, lang)}
          </p>
          <span className="text-xs text-white/30">
            {options.length} {t(c.options, lang)}
          </span>
        </div>

        {/* Primary recommendation */}
        {primary && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-emerald-300/60">
              {t(c.primary, lang)}
            </p>
            <OptionCard option={primary} lang={lang} />
          </div>
        )}

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/40">
              {t(c.alternatives, lang)}
            </p>
            {alternatives.map((opt) => (
              <OptionCard key={opt.option_id} option={opt} lang={lang} />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Fallback: Ranked Actions (from crisis assessment) ── */
  const sortedActions = [...rankedActions!].sort((a, b) => b.action_score - a.action_score);
  const primaryAction = sortedActions[0];
  const altActions = sortedActions.slice(1);

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>
        <span className="text-xs text-white/30">
          {sortedActions.length} {t(c.options, lang)}
        </span>
      </div>

      {/* Primary */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-medium text-white/90">{primaryAction.label}</h4>
          <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300">
            {t(c.primary, lang)}
          </span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{primaryAction.rationale}</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/30">{t(c.riskReduction, lang)}</p>
            <p className="text-sm font-medium text-white/80">{Math.round(primaryAction.risk_reduction * 100)}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/30">{t(c.feasibility, lang)}</p>
            <p className="text-sm font-medium text-white/80">{Math.round(primaryAction.feasibility * 100)}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/30">{t(c.confidence, lang)}</p>
            <p className="text-sm font-medium text-white/80">{Math.round(primaryAction.action_score * 100)}%</p>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      {altActions.map((action) => (
        <div key={action.action_id} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white/80">{action.label}</h4>
            <span className="text-xs text-white/40">{Math.round(action.action_score * 100)}%</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{action.rationale}</p>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <p className="text-white/30">{t(c.riskReduction, lang)}</p>
              <MetricBar value={action.risk_reduction} color="bg-emerald-400/60" />
            </div>
            <div>
              <p className="text-white/30">{t(c.feasibility, lang)}</p>
              <MetricBar value={action.feasibility} color="bg-blue-400/60" />
            </div>
            <div>
              <p className="text-white/30">{t(c.cost, lang)}</p>
              <MetricBar value={1 - action.cost} color="bg-amber-400/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Decision Option Card ── */
function OptionCard({ option, lang }: { option: DecisionOption; lang: Lang }) {
  const c = decisionCopy.decisions;
  const style = RECOMMENDATION_LABELS[option.recommendation] ?? RECOMMENDATION_LABELS.conditional;

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${style.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-medium text-white/90">{option.title}</h4>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${style.text} border ${style.bg}`}>
          {t(c[style.key as keyof typeof c] as { en: string; ar: string }, lang)}
        </span>
      </div>
      <p className="text-xs text-white/60 leading-relaxed">{option.description}</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30">{t(c.riskReduction, lang)}</p>
          <p className="text-sm font-medium text-white/80">{Math.round(option.risk_reduction * 100)}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30">{t(c.cost, lang)}</p>
          <p className="text-xs text-white/60">{option.cost_estimate}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30">{t(c.executionTime, lang)}</p>
          <p className="text-xs text-white/60">{option.time_to_implement}</p>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] uppercase tracking-wider text-white/30">{t(c.confidence, lang)}</p>
          <span className="text-[10px] text-white/40">{Math.round(option.confidence * 100)}%</span>
        </div>
        <MetricBar value={option.confidence} color="bg-blue-400/60" />
      </div>
      {option.trade_offs.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{t(c.tradeoffs, lang)}</p>
          {option.trade_offs.map((tradeoff, i) => (
            <p key={i} className="text-[11px] text-white/40 pl-2 border-l border-white/[0.06]">{tradeoff}</p>
          ))}
        </div>
      )}
    </div>
  );
}
