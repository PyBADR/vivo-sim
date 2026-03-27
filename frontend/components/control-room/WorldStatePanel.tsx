import type { GraphBuildResponse, GraphEnrichResponse } from "@/lib/types/graph";

type GraphLike = GraphBuildResponse | GraphEnrichResponse | null;

interface Props {
  graph: GraphLike;
  selectedBranchId?: string | null;
}

export function WorldStatePanel({ graph, selectedBranchId }: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
            World State
          </p>
          <h3 className="mt-1 text-lg font-semibold">Graph Canvas</h3>
        </div>
        {selectedBranchId && (
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] text-blue-300">
            Branch: {selectedBranchId}
          </span>
        )}
      </div>

      <div className="grid h-[380px] place-items-center rounded-xl border border-white/[0.04] bg-black/30">
        {graph ? (
          <div className="space-y-3 text-center">
            {/* Node cluster visualization */}
            <div className="flex items-center justify-center gap-1">
              {graph.nodes.slice(0, 20).map((node, i) => {
                const size = 8 + (node.importance_score ?? 0.5) * 24;
                const opacity = 0.3 + (node.importance_score ?? 0.5) * 0.7;
                return (
                  <div
                    key={node.id}
                    className="rounded-full bg-blue-400"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      opacity,
                      transform: `translateY(${Math.sin(i * 0.7) * 20}px)`,
                    }}
                    title={`${node.label} (${node.type ?? "node"})`}
                  />
                );
              })}
            </div>
            <div>
              <p className="text-lg font-medium text-white">
                {graph.nodes.length} nodes · {graph.edges.length} edges
              </p>
              {"graph_summary" in graph && graph.graph_summary?.density != null && (
                <p className="mt-1 text-xs text-white/40">
                  Density: {graph.graph_summary.density.toFixed(3)}
                </p>
              )}
              <p className="mt-2 text-xs text-white/30">
                Full graph visualization with react-force-graph / deck.gl
                renders here.
              </p>
            </div>
            {/* Top nodes by importance */}
            <div className="flex flex-wrap justify-center gap-2">
              {graph.nodes
                .slice()
                .sort(
                  (a, b) =>
                    (b.importance_score ?? 0) - (a.importance_score ?? 0)
                )
                .slice(0, 6)
                .map((node) => (
                  <span
                    key={node.id}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[10px] text-white/60"
                  >
                    {node.label}
                    {node.importance_score != null && (
                      <span className="ml-1 text-blue-400/70">
                        {(node.importance_score * 100).toFixed(0)}
                      </span>
                    )}
                  </span>
                ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/20">
            No graph loaded yet. Run a scenario to build the world state.
          </p>
        )}
      </div>
    </div>
  );
}
