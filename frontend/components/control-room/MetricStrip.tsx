import type { BranchedSimulationResponse } from "@/lib/types/simulation";
import type { BranchedDecisionResponse } from "@/lib/types/decision";

interface Props {
  simulation: BranchedSimulationResponse | null;
  decision: BranchedDecisionResponse | null;
}

interface Metric {
  label: string;
  value: string | number;
  color?: string;
}

export function MetricStrip({ simulation, decision }: Props) {
  const metrics: Metric[] = [
    {
      label: "Branches",
      value: simulation?.branches?.length ?? "—",
    },
    {
      label: "Expected Peak",
      value: simulation?.expected_outcome?.peak_impact?.toFixed(3) ?? "—",
    },
    {
      label: "Worst Case",
      value: simulation?.worst_case_outcome?.peak_impact?.toFixed(3) ?? "—",
      color: "text-red-300",
    },
    {
      label: "Decision Confidence",
      value:
        decision?.decision_confidence != null
          ? `${Math.round(decision.decision_confidence * 100)}%`
          : "—",
      color: "text-blue-300",
    },
    {
      label: "Branch Entropy",
      value:
        simulation?.uncertainty_envelope?.branch_entropy?.toFixed(3) ?? "—",
    },
    {
      label: "Sim Variance",
      value:
        simulation?.uncertainty_envelope?.simulation_variance?.toFixed(4) ??
        "—",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
        >
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
            {m.label}
          </p>
          <p
            className={`mt-1 text-lg font-semibold ${m.color ?? "text-white"}`}
          >
            {m.value}
          </p>
        </div>
      ))}
    </div>
  );
}
