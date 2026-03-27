import type { BranchedBriefResponse } from "@/lib/types/decision";

interface Props {
  brief: BranchedBriefResponse | null;
}

export function IntelligenceBriefPanel({ brief }: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
        Intelligence Brief
      </p>

      {brief ? (
        <div className="mt-3 space-y-3">
          {/* Executive summary */}
          <p className="text-xs leading-relaxed text-white/80" dir="auto">
            {brief.executive_summary}
          </p>

          {/* Key actors */}
          {brief.key_actors?.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-medium text-white/40">
                Key Actors
              </p>
              <div className="flex flex-wrap gap-1">
                {brief.key_actors.map((actor, i) => (
                  <span
                    key={i}
                    className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-2 text-xs">
            {brief.spread_pattern && (
              <div>
                <span className="text-white/40">Spread: </span>
                <span className="text-white/70">{brief.spread_pattern}</span>
              </div>
            )}
            {brief.recommended_action && (
              <div>
                <span className="text-white/40">Recommended: </span>
                <span className="text-blue-300/80">
                  {brief.recommended_action}
                </span>
              </div>
            )}
            {brief.uncertainty_statement && (
              <div>
                <span className="text-white/40">Uncertainty: </span>
                <span className="text-amber-300/70">
                  {brief.uncertainty_statement}
                </span>
              </div>
            )}
          </div>

          {/* Top risks */}
          {brief.top_risks?.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-medium text-white/40">
                Top Risks
              </p>
              <div className="space-y-1">
                {brief.top_risks.map((risk, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[10px] text-red-300/60"
                  >
                    <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-red-400/50" />
                    {risk}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 py-6 text-center text-xs text-white/20">
          No brief yet.
        </p>
      )}
    </div>
  );
}
