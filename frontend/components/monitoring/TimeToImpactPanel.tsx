import type { NodeImpact } from "@/lib/types/crisis";

interface Props {
  nodes?: NodeImpact[];
}

export function TimeToImpactPanel({ nodes }: Props) {
  const withTTI = (nodes ?? [])
    .filter((n) => n.time_to_impact_hours != null)
    .sort((a, b) => (a.time_to_impact_hours ?? 999) - (b.time_to_impact_hours ?? 999))
    .slice(0, 5);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Time to Impact
      </p>
      <h3 className="mt-2 text-lg font-semibold text-white">Earliest Impact</h3>

      {withTTI.length === 0 ? (
        <p className="mt-3 text-sm text-white/50">No TTI data available.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {withTTI.map((node) => (
            <div
              key={node.node_id}
              className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2"
            >
              <span className="text-xs text-white/70">{node.label}</span>
              <span className="text-sm font-semibold text-amber-300">
                {node.time_to_impact_hours}h
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
