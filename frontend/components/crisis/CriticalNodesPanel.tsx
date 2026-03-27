"use client";

import type { CriticalNode } from "@/lib/types/decision-intelligence";

interface Props {
  nodes: CriticalNode[] | undefined;
}

function getCascadeColor(risk: number): string {
  if (risk >= 0.7) return "text-red-400";
  if (risk >= 0.4) return "text-amber-400";
  return "text-emerald-400";
}

function getCascadeBg(risk: number): string {
  if (risk >= 0.7) return "bg-red-400/60";
  if (risk >= 0.4) return "bg-amber-400/60";
  return "bg-emerald-400/60";
}

export function CriticalNodesPanel({ nodes }: Props) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          Critical Nodes
        </p>
        <p className="mt-3 text-sm text-white/30">No critical nodes identified</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          Critical Nodes
        </p>
        <span className="text-xs text-white/30">
          Top {nodes.length} by cascade risk
        </span>
      </div>

      <div className="space-y-2">
        {nodes.map((node, idx) => (
          <div
            key={node.node_id}
            className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-3 space-y-2"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-white/30">
                  #{idx + 1}
                </span>
                <span className="text-sm font-medium text-white/80">
                  {node.label}
                </span>
                {node.country && (
                  <span className="text-[10px] text-white/30 uppercase">
                    {node.country}
                  </span>
                )}
              </div>
              <span
                className={`text-sm font-semibold ${getCascadeColor(node.cascade_risk)}`}
              >
                {Math.round(node.cascade_risk * 100)}%
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div>
                <p className="uppercase tracking-wider text-white/30">
                  Criticality
                </p>
                <p className="text-white/60">
                  {Math.round(node.criticality_score * 100)}%
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wider text-white/30">
                  Cascade Risk
                </p>
                <div className="flex items-center gap-1">
                  <div className="h-1 flex-1 rounded-full bg-white/[0.06]">
                    <div
                      className={`h-1 rounded-full ${getCascadeBg(node.cascade_risk)} transition-all`}
                      style={{ width: `${node.cascade_risk * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="uppercase tracking-wider text-white/30">
                  Downstream
                </p>
                <p className="text-white/60">{node.downstream_count} nodes</p>
              </div>
            </div>

            {/* Interventions */}
            {node.intervention_options.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {node.intervention_options.map((opt, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/40"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
