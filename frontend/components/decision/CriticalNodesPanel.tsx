"use client";

import type { CriticalNode } from "@/lib/types/decision-intelligence";
import type { NodeImpact } from "@/lib/types/crisis";
import { decisionCopy } from "@/lib/config/decision-copy";
import { t, interpolate } from "@/lib/utils/i18n";
import type { Lang } from "@/lib/types/i18n";

interface Props {
  criticalNodes?: CriticalNode[];
  nodeImpacts?: NodeImpact[];
  lang?: Lang;
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

export function CriticalNodesPanel({ criticalNodes, nodeImpacts, lang = "en" }: Props) {
  const c = decisionCopy.nodes;

  /* ── Use criticalNodes from DI bundle, fallback to top-5 nodeImpacts ── */
  const hasCritical = criticalNodes && criticalNodes.length > 0;
  const hasImpacts = nodeImpacts && nodeImpacts.length > 0;

  if (!hasCritical && !hasImpacts) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>
        <p className="mt-3 text-sm text-white/30">{t(c.noNodes, lang)}</p>
      </div>
    );
  }

  /* ── Critical Nodes from DI bundle ── */
  if (hasCritical) {
    const top5 = criticalNodes.slice(0, 5);
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
            {t(c.title, lang)}
          </p>
          <span className="text-xs text-white/30">{t(c.subtitle, lang)}</span>
        </div>

        <div className="space-y-2">
          {top5.map((node, idx) => (
            <div key={node.node_id} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-white/30">#{idx + 1}</span>
                  <span className="text-sm font-medium text-white/80">{node.label}</span>
                  {node.country && (
                    <span className="text-[10px] text-white/30 uppercase">{node.country}</span>
                  )}
                </div>
                <span className={`text-sm font-semibold ${getCascadeColor(node.cascade_risk)}`}>
                  {Math.round(node.cascade_risk * 100)}%
                </span>
              </div>

              {/* Impact sentence */}
              <p className="text-[11px] text-white/50 leading-relaxed">
                {interpolate(t(c.impactSentence, lang), { count: node.downstream_count })}
              </p>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <p className="uppercase tracking-wider text-white/30">{t(c.criticality, lang)}</p>
                  <p className="text-white/60">{Math.round(node.criticality_score * 100)}%</p>
                </div>
                <div>
                  <p className="uppercase tracking-wider text-white/30">{t(c.cascadeRisk, lang)}</p>
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
                  <p className="uppercase tracking-wider text-white/30">{t(c.downstream, lang)}</p>
                  <p className="text-white/60">{node.downstream_count}</p>
                </div>
              </div>

              {node.intervention_options.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {node.intervention_options.map((opt, i) => (
                    <span key={i} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/40">
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

  /* ── Fallback: Top 5 node_impacts from crisis assessment ── */
  const top5Impacts = [...nodeImpacts!]
    .sort((a, b) => b.severity_score - a.severity_score)
    .slice(0, 5);

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">
          {t(c.title, lang)}
        </p>
        <span className="text-xs text-white/30">{t(c.subtitle, lang)}</span>
      </div>

      <div className="space-y-2">
        {top5Impacts.map((node, idx) => (
          <div key={node.node_id} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-white/30">#{idx + 1}</span>
                <span className="text-sm font-medium text-white/80">{node.label}</span>
                {node.country && (
                  <span className="text-[10px] text-white/30 uppercase">{node.country}</span>
                )}
              </div>
              <span className={`text-sm font-semibold ${getCascadeColor(node.severity_score)}`}>
                {Math.round(node.severity_score * 100)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div>
                <p className="uppercase tracking-wider text-white/30">{t(decisionCopy.nodes.criticality, lang)}</p>
                <p className="text-white/60">{Math.round(node.probability_of_disruption * 100)}%</p>
              </div>
              <div>
                <p className="uppercase tracking-wider text-white/30">{t(decisionCopy.nodes.cascadeRisk, lang)}</p>
                <div className="h-1 rounded-full bg-white/[0.06]">
                  <div
                    className={`h-1 rounded-full ${getCascadeBg(node.severity_score)} transition-all`}
                    style={{ width: `${node.severity_score * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="uppercase tracking-wider text-white/30">{t(decisionCopy.nodes.downstream, lang)}</p>
                <p className="text-white/60">{node.ripple_effect?.length ?? 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
