import type { NodeImpact } from "@/lib/types/crisis";
import { getRiskBand, getRiskColor } from "@/lib/config/crisis-visuals";

interface Props {
  node: NodeImpact | null;
  onClose: () => void;
}

export function NodeDetailsDrawer({ node, onClose }: Props) {
  if (!node) return null;

  const band = getRiskBand(node.severity_score);
  const color = getRiskColor(node.severity_score);

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-96 border-l border-white/10 bg-[#0a0e1a]/95 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{node.label}</h3>
        <button
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/60 hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm capitalize text-white/70">{band} Risk</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/30 p-3">
            <p className="text-[10px] uppercase text-white/30">Probability</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {(node.probability_of_disruption * 100).toFixed(0)}%
            </p>
          </div>
          <div className="rounded-2xl bg-black/30 p-3">
            <p className="text-[10px] uppercase text-white/30">Severity</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {node.severity_score.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl bg-black/30 p-3">
            <p className="text-[10px] uppercase text-white/30">TTI</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {node.time_to_impact_hours != null ? `${node.time_to_impact_hours}h` : "N/A"}
            </p>
          </div>
          <div className="rounded-2xl bg-black/30 p-3">
            <p className="text-[10px] uppercase text-white/30">Type</p>
            <p className="mt-1 text-sm font-medium text-white/80">{node.node_type}</p>
          </div>
        </div>

        {node.tags && node.tags.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-white/40">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {node.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.ripple_effect.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-white/40">Ripple Effects</p>
            <div className="space-y-1.5">
              {node.ripple_effect.map((effect) => (
                <div
                  key={effect}
                  className="rounded-xl bg-black/25 px-3 py-2 text-xs text-white/60"
                >
                  {effect}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
