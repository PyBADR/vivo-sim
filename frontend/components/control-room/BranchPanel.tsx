import type { BranchedSimulationResponse } from "@/lib/types/simulation";

interface Props {
  simulation: BranchedSimulationResponse | null;
  selectedBranchId: string | null;
}

const branchColors: Record<string, string> = {
  baseline: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  amplification: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  containment: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  adverse: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function BranchPanel({ simulation, selectedBranchId }: Props) {
  const branches = simulation?.branches ?? [];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
            Branching
          </p>
          <h3 className="mt-1 text-lg font-semibold">Scenario Branches</h3>
        </div>
        {simulation?.uncertainty_envelope?.branch_entropy != null && (
          <span className="text-xs text-white/40">
            Entropy:{" "}
            {simulation.uncertainty_envelope.branch_entropy.toFixed(3)}
          </span>
        )}
      </div>

      {branches.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {branches.map((branch) => {
            const color =
              branchColors[branch.branch_label] ?? branchColors.baseline;
            const isSelected = selectedBranchId === branch.branch_id;
            return (
              <div
                key={branch.branch_id}
                className={`rounded-xl border p-3 transition-all ${color} ${
                  isSelected ? "ring-1 ring-white/20" : ""
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold capitalize">
                    {branch.branch_label}
                  </span>
                  <span className="text-[10px] opacity-70">
                    p={branch.branch_probability.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1 text-[10px] opacity-70">
                  {branch.peak_impact != null && (
                    <div className="flex justify-between">
                      <span>Peak Impact</span>
                      <span>{branch.peak_impact.toFixed(3)}</span>
                    </div>
                  )}
                  {branch.time_to_peak != null && (
                    <div className="flex justify-between">
                      <span>Time to Peak</span>
                      <span>t{branch.time_to_peak}</span>
                    </div>
                  )}
                </div>
                {branch.trigger && (
                  <p className="mt-2 text-[9px] opacity-50">{branch.trigger}</p>
                )}
                {/* Probability bar */}
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-current opacity-50"
                    style={{
                      width: `${branch.branch_probability * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-6 text-center text-xs text-white/20">
          No branches computed yet.
        </p>
      )}
    </div>
  );
}
