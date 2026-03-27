import type { BranchedSimulationResponse } from "@/lib/types/simulation";

interface Props {
  simulation: BranchedSimulationResponse | null;
  selectedInterventionId?: string | null;
}

export function InterventionPanel({
  simulation,
  selectedInterventionId,
}: Props) {
  const interventions = simulation?.interventions ?? [];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
        Interventions
      </p>
      <h3 className="mt-1 text-lg font-semibold">Action Comparison</h3>

      <div className="mt-4 space-y-2">
        {interventions.length > 0 ? (
          interventions.map((item) => {
            const isSelected = selectedInterventionId === item.intervention_id;
            return (
              <div
                key={item.intervention_id}
                className={`rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-blue-400/30 bg-blue-500/[0.08]"
                    : "border-white/[0.04] bg-black/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-white/80">
                    {item.label}
                  </p>
                  {item.confidence != null && (
                    <span className="text-[10px] text-white/40">
                      {Math.round(item.confidence * 100)}%
                    </span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                  <div className="text-white/40">
                    Reduction:{" "}
                    <span className="text-emerald-400/70">
                      {item.reduction_in_peak_impact?.toFixed(3) ?? "—"}
                    </span>
                  </div>
                  <div className="text-white/40">
                    Efficiency:{" "}
                    <span className="text-blue-400/70">
                      {item.efficiency_score?.toFixed(2) ?? "—"}
                    </span>
                  </div>
                  <div className="text-white/40">
                    Cost:{" "}
                    <span className="text-amber-400/70">
                      {item.estimated_cost?.toFixed(2) ?? "—"}
                    </span>
                  </div>
                </div>
                {item.intended_effect && (
                  <p className="mt-1.5 text-[9px] text-white/25">
                    {item.intended_effect}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className="py-6 text-center text-xs text-white/20">
            No interventions returned yet.
          </p>
        )}
      </div>
    </div>
  );
}
