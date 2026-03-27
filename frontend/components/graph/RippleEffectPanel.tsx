import type { NodeImpact } from "@/lib/types/crisis";

interface Props {
  node?: NodeImpact | null;
}

export function RippleEffectPanel({ node }: Props) {
  if (!node) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Ripple Effect
        </p>
        <p className="mt-3 text-sm text-white/50">
          Select a node to view ripple effects.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Ripple Effect
      </p>
      <h3 className="mt-2 text-lg font-semibold text-white">{node.label}</h3>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-black/25 p-3">
            <p className="text-xs text-white/40">Probability</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {(node.probability_of_disruption * 100).toFixed(0)}%
            </p>
          </div>
          <div className="rounded-2xl bg-black/25 p-3">
            <p className="text-xs text-white/40">Severity</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {node.severity_score.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl bg-black/25 p-3">
            <p className="text-xs text-white/40">Time to Impact</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {node.time_to_impact_hours != null ? `${node.time_to_impact_hours}h` : "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-black/25 p-3">
            <p className="text-xs text-white/40">Type</p>
            <p className="mt-1 text-sm font-medium text-white/80">
              {node.node_type}
            </p>
          </div>
        </div>

        {node.ripple_effect.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-white/40">Downstream Effects</p>
            <div className="space-y-1.5">
              {node.ripple_effect.map((effect, i) => (
                <div
                  key={effect}
                  className="flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2 text-xs text-white/65"
                >
                  <span className="text-white/30">{i + 1}.</span>
                  <span>{effect}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
