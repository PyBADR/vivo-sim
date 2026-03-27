import type { NodeImpact } from "@/lib/types/crisis";
import { getRiskColor } from "@/lib/config/crisis-visuals";

interface Props {
  nodes?: NodeImpact[];
}

export function SeverityPanel({ nodes }: Props) {
  const sorted = [...(nodes ?? [])]
    .sort((a, b) => b.severity_score - a.severity_score)
    .slice(0, 5);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Severity Score
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
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getRiskColor(node.severity_score) }}
                />
                <span className="text-xs text-white/70">{node.label}</span>
              </div>
              <span className="text-sm font-semibold text-white">
                {node.severity_score.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
