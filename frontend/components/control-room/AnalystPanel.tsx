import type { BranchedAnalysisResponse } from "@/lib/types/decision";

interface Props {
  analysis: BranchedAnalysisResponse | null;
}

export function AnalystPanel({ analysis }: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
        Analyst Layer
      </p>

      {analysis ? (
        <div className="mt-3 space-y-3">
          {/* Answer */}
          <p className="text-xs leading-relaxed text-white/80" dir="auto">
            {analysis.answer}
          </p>

          {/* Uncertainty note */}
          {analysis.uncertainty_note && (
            <div className="rounded-lg bg-amber-500/[0.06] px-3 py-2 text-[10px] text-amber-300/70">
              {analysis.uncertainty_note}
            </div>
          )}

          {/* Evidence */}
          {analysis.evidence?.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-medium text-white/40">
                Evidence
              </p>
              <div className="space-y-1">
                {analysis.evidence.map((ev, i) => (
                  <p key={i} className="text-[10px] text-white/40">
                    {ev}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Dependency trace */}
          {analysis.dependency_trace?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {analysis.dependency_trace.map((dep, i) => (
                <span
                  key={i}
                  className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-white/30"
                >
                  {dep}
                </span>
              ))}
            </div>
          )}

          {/* Next check suggestion */}
          {analysis.suggested_next_check && (
            <p className="text-[10px] italic text-blue-300/50">
              {analysis.suggested_next_check}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 py-6 text-center text-xs text-white/20">
          No analyst response yet.
        </p>
      )}
    </div>
  );
}
