import type { PropagationStep } from "@/lib/types/crisis";

interface Props {
  steps: PropagationStep[];
}

export function PropagationTimeline({ steps }: Props) {
  if (!steps || steps.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Propagation Timeline
        </p>
        <p className="mt-3 text-sm text-white/50">No propagation data.</p>
      </div>
    );
  }

  const maxEnergy = Math.max(...steps.map((s) => s.total_energy), 1);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Propagation Timeline
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        Crisis Energy Flow
      </h3>

      <div className="mt-4 space-y-3">
        {steps.map((step) => {
          const topNodes = Object.entries(step.node_scores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

          return (
            <div
              key={step.step}
              className="rounded-2xl border border-white/8 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">
                    {step.step}
                  </span>
                  <span className="text-sm text-white/70">Step {step.step}</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {step.total_energy.toFixed(2)}
                </span>
              </div>

              {/* Energy bar */}
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-blue-500/60"
                  style={{
                    width: `${(step.total_energy / maxEnergy) * 100}%`,
                  }}
                />
              </div>

              {/* Top nodes */}
              <div className="mt-2 flex flex-wrap gap-2">
                {topNodes.map(([nodeId, score]) => (
                  <span
                    key={nodeId}
                    className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/50"
                  >
                    {nodeId}: {score.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
