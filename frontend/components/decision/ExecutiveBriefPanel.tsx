"use client";

import type { ExecutiveNarrative } from "@/lib/types/decision-intelligence";
import type { CrisisAssessment } from "@/lib/types/crisis";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  narrative: ExecutiveNarrative | null | undefined;
  assessment: CrisisAssessment | null | undefined;
  lang?: Lang;
}

function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 0.75) return { label: "CRITICAL", color: "text-red-400" };
  if (score >= 0.5) return { label: "HIGH", color: "text-amber-400" };
  if (score >= 0.25) return { label: "ELEVATED", color: "text-yellow-300" };
  return { label: "MODERATE", color: "text-emerald-400" };
}

export function ExecutiveBriefPanel({ narrative, assessment, lang = "en" }: Props) {
  const c = decisionCopy.executive;

  /* ── Empty state ── */
  if (!narrative && !assessment) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>
        <p className="mt-3 text-sm text-white/30">{t(c.awaiting, lang)}</p>
      </div>
    );
  }

  /* ── Derive risk level from assessment ── */
  const topScore = assessment?.airport_impacts
    ? Math.max(...assessment.airport_impacts.map((a) => a.disruption_score), 0)
    : 0;
  const risk = getRiskLevel(topScore);

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${risk.color}`}>
          {risk.label}
        </span>
      </div>

      {/* Situation — What is happening */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">
          {t(c.situation, lang)}
        </p>
        <p className="text-sm leading-relaxed text-white/80">
          {narrative?.situation ?? assessment?.summary ?? "—"}
        </p>
      </div>

      {/* Impact — Why it matters */}
      {narrative?.implications && narrative.implications.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">
            {t(c.implications, lang)}
          </p>
          <div className="space-y-2">
            {narrative.implications.map((imp, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation — What should we do */}
      {narrative?.recommended_actions && narrative.recommended_actions.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">
            {t(c.recommendation, lang)}
          </p>
          <div className="space-y-2">
            {narrative.recommended_actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/60" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgency — When to act */}
      {narrative?.decision_deadline && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-red-300/60 mb-1">
            {t(c.urgency, lang)}
          </p>
          <p className="text-sm font-medium text-red-200">
            {narrative.decision_deadline}
          </p>
        </div>
      )}

      {/* Confidence — How confident are we */}
      {narrative?.confidence_statement && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">
            {t(c.confidence, lang)}
          </p>
          <p className="text-xs text-white/50 leading-relaxed">
            {narrative.confidence_statement}
          </p>
        </div>
      )}
    </div>
  );
}
