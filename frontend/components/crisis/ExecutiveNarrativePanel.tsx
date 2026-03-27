"use client";

import type { ExecutiveNarrative } from "@/lib/types/decision-intelligence";

interface Props {
  narrative: ExecutiveNarrative | null | undefined;
}

export function ExecutiveNarrativePanel({ narrative }: Props) {
  if (!narrative) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          Executive Narrative
        </p>
        <p className="mt-3 text-sm text-white/30">Awaiting assessment…</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          Executive Narrative
        </p>
      </div>

      {/* Situation */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">
          Situation
        </p>
        <p className="text-sm leading-relaxed text-white/80">
          {narrative.situation}
        </p>
      </div>

      {/* Implications */}
      {narrative.implications.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">
            Key Implications
          </p>
          <div className="space-y-2">
            {narrative.implications.map((imp, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-white/70"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {narrative.recommended_actions.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">
            Recommended Actions
          </p>
          <div className="space-y-2">
            {narrative.recommended_actions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-white/70"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/60" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Deadline */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
        <p className="text-[11px] uppercase tracking-widest text-red-300/60 mb-1">
          Decision Deadline
        </p>
        <p className="text-sm font-medium text-red-200">
          {narrative.decision_deadline}
        </p>
      </div>

      {/* Confidence */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">
          Confidence
        </p>
        <p className="text-xs text-white/50 leading-relaxed">
          {narrative.confidence_statement}
        </p>
      </div>
    </div>
  );
}
