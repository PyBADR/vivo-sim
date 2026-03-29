'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  ChevronRight,
  Crosshair,
  Layers,
  Network,
  TrendingUp,
  Zap,
} from 'lucide-react'
import type { DemoResult } from '@/lib/visualization/demoScenarios'

/* ── Types ── */

interface PropagationInsightPanelProps {
  result: DemoResult | null
}

/* ── Utility: severity color from impact score ── */
function impactColor(score: number): string {
  if (score >= 0.7) return 'text-ds-danger'
  if (score >= 0.4) return 'text-ds-warning'
  return 'text-ds-success'
}

function impactBg(score: number): string {
  if (score >= 0.7) return 'bg-ds-danger/10 border-ds-danger/20'
  if (score >= 0.4) return 'bg-ds-warning/10 border-ds-warning/20'
  return 'bg-ds-success/10 border-ds-success/20'
}

function confidenceLabel(c: number): string {
  if (c >= 0.8) return 'HIGH'
  if (c >= 0.5) return 'MODERATE'
  if (c >= 0.3) return 'LOW'
  return 'INSUFFICIENT'
}

/* ── Component ── */

export default function PropagationInsightPanel({ result }: PropagationInsightPanelProps) {
  if (!result) {
    return (
      <div className="bg-ds-surface rounded-ds-xl border border-ds-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Network size={14} className="text-ds-text-dim" />
          <span className="text-caption font-semibold text-ds-text-dim">Propagation Analysis</span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-ds-surface-raised border border-ds-border flex items-center justify-center mb-3">
            <Activity size={16} className="text-ds-text-dim" />
          </div>
          <p className="text-caption text-ds-text-dim">Run a simulation to generate propagation analysis</p>
          <p className="text-nano text-ds-text-dim mt-1 font-mono">AWAITING SIGNAL</p>
        </div>
      </div>
    )
  }

  const {
    propagationResult: prop,
    topDrivers,
    propagationChain,
    confidence,
    explanation,
    totalLoss,
    affectedSectors,
    runId,
  } = result

  const sectorAgg = prop.sectorAggregation

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-ds-surface rounded-ds-xl border border-ds-border overflow-hidden"
    >
      {/* Header */}
      <div className="ds-panel-header">
        <div className="ds-panel-header-title">
          <Network size={14} className="text-ds-accent" />
          <span className="text-caption font-semibold text-ds-text tracking-tight">
            Propagation Analysis
          </span>
        </div>
        <span className="text-nano font-mono text-ds-text-dim uppercase tracking-wider">
          {runId}
        </span>
      </div>

      <div className="p-4 space-y-4">

        {/* ── Explanation ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-ds-card rounded-ds-lg p-3.5 border border-ds-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Crosshair size={11} className="text-ds-accent" />
            <span className="text-nano font-semibold text-ds-accent uppercase tracking-[0.12em]">
              Causal Summary
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-ds-text-secondary">{explanation}</p>
        </motion.div>

        {/* ── Metrics row: Confidence + Total Energy + Sectors ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2"
        >
          <div className="bg-ds-card rounded-ds-lg p-3 border border-ds-border text-center">
            <span className="text-nano text-ds-text-dim block mb-1 uppercase tracking-wider font-medium">
              Confidence
            </span>
            <span className="text-h4 font-bold text-ds-accent font-mono block">
              {Math.round(confidence * 100)}%
            </span>
            <span className={`text-nano font-mono mt-0.5 block ${
              confidence >= 0.7 ? 'text-ds-success' : confidence >= 0.4 ? 'text-ds-warning' : 'text-ds-danger'
            }`}>
              {confidenceLabel(confidence)}
            </span>
            <div className="mt-1.5 h-1 bg-ds-border rounded-full overflow-hidden">
              <div
                className="h-full bg-ds-accent rounded-full transition-all duration-700"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-ds-card rounded-ds-lg p-3 border border-ds-border text-center">
            <span className="text-nano text-ds-text-dim block mb-1 uppercase tracking-wider font-medium">
              System Energy
            </span>
            <span className="text-h4 font-bold text-ds-warning font-mono block">
              {totalLoss.toFixed(1)}
            </span>
            <span className="text-nano text-ds-text-dim font-mono mt-0.5 block">
              Σ impact
            </span>
          </div>

          <div className="bg-ds-card rounded-ds-lg p-3 border border-ds-border text-center">
            <span className="text-nano text-ds-text-dim block mb-1 uppercase tracking-wider font-medium">
              Sectors Hit
            </span>
            <span className="text-h4 font-bold text-ds-danger font-mono block">
              {affectedSectors.length}
            </span>
            <span className="text-nano text-ds-text-dim font-mono mt-0.5 block">
              / 14 total
            </span>
          </div>
        </motion.div>

        {/* ── Propagation Chain ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={11} className="text-ds-accent" />
            <span className="text-nano font-semibold text-ds-text-secondary uppercase tracking-[0.12em]">
              Causal Chain
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {propagationChain.map((label, i) => (
              <span key={i} className="inline-flex items-center">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ds-card border border-ds-border text-ds-text-secondary">
                  {label}
                </span>
                {i < propagationChain.length - 1 && (
                  <ChevronRight size={10} className="text-ds-accent/50 mx-0.5" />
                )}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Top Drivers ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap size={11} className="text-ds-accent" />
            <span className="text-nano font-semibold text-ds-text-secondary uppercase tracking-[0.12em]">
              Top Drivers
            </span>
          </div>
          <div className="space-y-1.5">
            {topDrivers.map((driver, i) => (
              <div
                key={driver.nodeId}
                className="flex items-center gap-2.5 px-2.5 py-2 bg-ds-card rounded-ds border border-ds-border"
              >
                <span className="text-nano font-mono text-ds-text-dim w-4 flex-shrink-0">
                  #{i + 1}
                </span>
                <span className="text-[11px] font-mono text-ds-text flex-1 truncate">
                  {driver.label}
                </span>
                <span className={`text-[11px] font-bold font-mono ${impactColor(driver.impact)}`}>
                  {Math.round(driver.impact * 100)}%
                </span>
                <div className="w-12 h-1 bg-ds-border rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      driver.impact >= 0.7 ? 'bg-ds-danger' : driver.impact >= 0.4 ? 'bg-ds-warning' : 'bg-ds-success'
                    }`}
                    style={{ width: `${driver.impact * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Sector Aggregation ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers size={11} className="text-ds-accent" />
            <span className="text-nano font-semibold text-ds-text-secondary uppercase tracking-[0.12em]">
              Sector Impact
            </span>
          </div>
          <div className="space-y-1.5">
            {sectorAgg.slice(0, 8).map((sector) => (
              <div
                key={sector.sector}
                className="flex items-center gap-2.5 px-2.5 py-2 bg-ds-card rounded-ds border border-ds-border"
              >
                <span className="text-[11px] font-mono text-ds-text-secondary capitalize flex-1 truncate">
                  {sector.sector.replace('_', ' ')}
                </span>
                <span className="text-nano font-mono text-ds-text-dim">
                  {sector.nodeCount} nodes
                </span>
                <span className={`text-[11px] font-bold font-mono ${impactColor(sector.maxImpact)}`}>
                  {Math.round(sector.maxImpact * 100)}%
                </span>
                <div className="w-16 h-1.5 bg-ds-border rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sector.maxImpact >= 0.7 ? 'bg-ds-danger' : sector.maxImpact >= 0.4 ? 'bg-ds-warning' : 'bg-ds-success'
                    }`}
                    style={{ width: `${Math.min(sector.maxImpact * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Affected Nodes Count ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between px-3 py-2.5 bg-ds-bg-alt rounded-ds-lg border border-ds-border"
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={11} className="text-ds-text-dim" />
            <span className="text-nano text-ds-text-dim font-mono uppercase">
              Nodes affected
            </span>
          </div>
          <span className="text-[13px] font-bold font-mono text-ds-text">
            {prop.affectedNodes.length}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-nano text-ds-text-dim font-mono uppercase">
              Max depth
            </span>
            <span className="text-[13px] font-bold font-mono text-ds-text">
              {prop.maxDepth}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
