import type { BranchedDecisionResponse } from "@/lib/types/decision";

interface Props {
  decision: BranchedDecisionResponse | null;
}

export function DecisionPanel({ decision }: Props) {
  return (
    <div className="rounded-2xl border border-blue-500/15 bg-gradient-to-b from-blue-500/[0.08] to-transparent p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-blue-400/70">
        Decision Surface
      </p>
      <h3 className="mt-1 text-lg font-semibold">Recommended Action</h3>

      {decision?.top_action ? (
        <div className="mt-4 space-y-3">
          {/* Top action card */}
          <div className="rounded-xl border border-blue-400/20 bg-black/30 p-4">
            <p className="text-sm font-semibold text-white">
              {decision.top_action.label}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              {decision.top_action.branch_aware_rationale ??
                decision.decision_rationale_summary ??
                "Top-ranked by composite decision score."}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-lg bg-blue-500/20 px-2 py-1 text-[10px] font-medium text-blue-300">
                Score: {decision.top_action.decision_score.toFixed(3)}
              </span>
              {decision.decision_confidence != null && (
                <span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-medium text-emerald-300">
                  Conf: {Math.round(decision.decision_confidence * 100)}%
                </span>
              )}
              {decision.score_margin_to_second != null && (
                <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[10px] text-white/40">
                  Margin: {decision.score_margin_to_second.toFixed(3)}
                </span>
              )}
            </div>
          </div>

          {/* Ranked actions */}
          <div className="space-y-1.5">
            {decision.ranked_actions.map((action, i) => (
              <div
                key={action.action_id ?? i}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  i === 0
                    ? "border-blue-500/20 bg-blue-500/[0.06]"
                    : "border-white/[0.04] bg-black/20"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-white/80">
                    {action.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  {action.risk_reduction != null && (
                    <span className="text-emerald-400/70">
                      Risk: -{(action.risk_reduction * 100).toFixed(0)}%
                    </span>
                  )}
                  <span className="font-medium text-blue-300">
                    {action.decision_score.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 py-6 text-center text-xs text-white/20">
          No decision output yet.
        </p>
      )}
    </div>
  );
}
