"use client";

import type { DecisionWindow } from "@/lib/types/decision-intelligence";
import type { PropagationStep } from "@/lib/types/crisis";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  windows?: DecisionWindow[];
  propagation?: PropagationStep[];
  lang?: Lang;
}

const URGENCY_STYLES: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  critical: { border: "border-red-500/20", bg: "bg-red-500/5", text: "text-red-300", dot: "bg-red-400" },
  high: { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-300", dot: "bg-amber-400" },
  medium: { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-300", dot: "bg-blue-400" },
  low: { border: "border-white/[0.08]", bg: "bg-white/[0.02]", text: "text-white/60", dot: "bg-white/40" },
};

const URGENCY_LABELS: Record<string, keyof typeof decisionCopy.timing> = {
  critical: "critical",
  high: "high",
  medium: "medium_label",
  low: "low",
};

export function DecisionWindowPanel({ windows, propagation, lang = "en" }: Props) {
  const c = decisionCopy.timing;
  const hasWindows = windows && windows.length > 0;
  const hasPropagation = propagation && propagation.length > 0;

  if (!hasWindows && !hasPropagation) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>
        <p className="mt-3 text-sm text-white/30">{t(c.noWindows, lang)}</p>
      </div>
    );
  }

  /* ── Decision Windows from DI bundle ── */
  if (hasWindows) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>

        <div className="relative space-y-3">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" />

          {windows.map((win) => {
            const style = URGENCY_STYLES[win.urgency] ?? URGENCY_STYLES.low;
            const labelKey = URGENCY_LABELS[win.urgency] ?? "low";

            return (
              <div key={win.window_id} className="relative pl-6">
                <div className={`absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-[#06070B] ${style.dot}`} />

                <div className={`rounded-2xl border p-4 space-y-2 ${style.border} ${style.bg}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white/80">{win.title}</h4>
                    <span className={`text-[10px] uppercase tracking-wider ${style.text}`}>
                      {t(c[labelKey] as { en: string; ar: string }, lang)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>{win.opens}</span>
                    <span className="text-white/20">→</span>
                    <span>{win.closes}</span>
                  </div>

                  {win.actions_available.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">
                        {t(c.actionsAvailable, lang)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {win.actions_available.map((actionId) => (
                          <span key={actionId} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/40">
                            {actionId.replace("opt_", "").replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl bg-white/[0.03] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">
                      {t(c.costOfDelay, lang)}
                    </p>
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      {win.cost_of_delay}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Fallback: Derive windows from propagation steps ── */
  const timeGroups = [
    { key: "immediate", label: c.immediate, steps: propagation!.filter((s) => s.step <= 2), urgency: "critical" },
    { key: "short", label: c.short, steps: propagation!.filter((s) => s.step === 3), urgency: "high" },
    { key: "medium", label: c.medium, steps: propagation!.filter((s) => s.step >= 4), urgency: "medium" },
  ].filter((g) => g.steps.length > 0);

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
        {t(c.title, lang)}
      </p>

      <div className="relative space-y-3">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" />

        {timeGroups.map((group) => {
          const style = URGENCY_STYLES[group.urgency];
          const totalEnergy = group.steps.reduce((sum, s) => sum + s.total_energy, 0);
          const nodeCount = new Set(group.steps.flatMap((s) => Object.keys(s.node_scores))).size;

          return (
            <div key={group.key} className="relative pl-6">
              <div className={`absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-[#06070B] ${style.dot}`} />

              <div className={`rounded-2xl border p-4 space-y-2 ${style.border} ${style.bg}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white/80">
                    {t(group.label, lang)}
                  </h4>
                  <span className={`text-[10px] uppercase tracking-wider ${style.text}`}>
                    {nodeCount} nodes
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-white/40">
                  <span>Energy: {totalEnergy.toFixed(1)}</span>
                  <span>Steps: {group.steps.map((s) => s.step).join(", ")}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
