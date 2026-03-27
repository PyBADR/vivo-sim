import type { NodeImpact } from "@/lib/types/crisis";

interface Props {
  nodes?: NodeImpact[];
}

export function ProbabilityPanel({ nodes }: Props) {
  const sorted = [...(nodes ?? [])]
    .sort((a, b) => b.probability_of_disruption - a.probability_of_disruption)
    .slice(0, 5);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Probability of Disruption
      </p>
      <h3 className="mt-2 text-lg font-semibold text-white">Top Nodes</h3>

      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-white/50">No node data available.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {sorted.map((node) => (
            <div
              key={node.node_id}
              className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2"
            >
              <span className="text-xs text-white/70">{node.label}</span>
              <span className="text-sm font-semibold text-white">
                {(node.probability_of_disruption * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
