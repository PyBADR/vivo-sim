'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import type { DemoResult } from '@/lib/visualization/demoScenarios'
import { getNodeColor } from '@/lib/utils'

/* ── Bilingual copy ── */
const copy = {
  globeView:   { en: 'Globe View',            ar: 'عرض الكرة الأرضية' },
  mathMode:    { en: 'MATHEMATICAL MODE',      ar: 'الوضع الرياضي' },
  awaiting:    { en: 'Run a simulation to activate globe intelligence',
                 ar: 'شغّل محاكاة لتفعيل استخبارات الكرة الأرضية' },
  awaitLabel:  { en: 'AWAITING SIGNAL',        ar: 'في انتظار الإشارة' },
  nodes:       { en: 'nodes',                  ar: 'عقد' },
  sectors:     { en: 'sectors',                ar: 'قطاعات' },
  energy:      { en: 'energy',                 ar: 'طاقة' },
}

function lc(pair: { en: string; ar: string }, lang: string): string {
  return lang === 'ar' ? pair.ar : pair.en
}

/* ── Orthographic projection (GCC-focused) ── */
const GCC_CENTER = { lat: 24.5, lng: 50.5 } // center of GCC
const BASE_SCALE = 800

function project(lat: number, lng: number, scale: number, cx: number, cy: number): { x: number; y: number; visible: boolean } {
  const λ = (lng - GCC_CENTER.lng) * (Math.PI / 180)
  const φ = lat * (Math.PI / 180)
  const φ0 = GCC_CENTER.lat * (Math.PI / 180)

  const cosC = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ)
  if (cosC < 0) return { x: 0, y: 0, visible: false }

  const x = cx + scale * Math.cos(φ) * Math.sin(λ)
  const y = cy - scale * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ))

  return { x, y, visible: true }
}

/* ── GCC land outline (simplified) ── */
const GCC_OUTLINE: Array<[number, number]> = [
  [29.5, 47.5], [29.0, 48.0], [28.5, 48.5], [27.0, 49.5], [26.0, 50.0],
  [25.5, 50.5], [25.0, 51.0], [24.5, 51.5], [24.0, 52.0], [23.5, 53.5],
  [23.0, 55.0], [22.5, 55.5], [22.0, 56.0], [21.0, 57.0], [20.0, 57.5],
  [18.0, 56.0], [17.0, 54.0], [16.5, 53.0], [16.0, 52.5], [17.0, 50.0],
  [18.0, 47.0], [19.5, 44.0], [21.0, 42.0], [22.0, 41.0], [23.0, 39.5],
  [24.5, 38.5], [26.0, 37.0], [27.5, 36.5], [28.5, 36.5], [29.5, 36.0],
  [30.0, 37.0], [30.0, 39.0], [30.0, 41.0], [30.0, 43.0], [30.0, 45.0],
  [29.5, 47.5],
]

/* ── Component ── */
interface DemoGlobeProps {
  result: DemoResult | null
  lang?: string
}

export default function DemoGlobe({ result, lang = 'en' }: DemoGlobeProps) {
  const [zoom, setZoom] = useState(1)
  const svgW = 900
  const svgH = 700
  const cx = svgW / 2
  const cy = svgH / 2
  const scale = BASE_SCALE * zoom

  // Compute projected nodes + edges from DemoResult
  const { nodes, edges, systemEnergy } = useMemo(() => {
    if (!result) return { nodes: [], edges: [], systemEnergy: 0 }

    const affected = result.propagationResult.affectedNodes
    const coords = result.nodeCoords

    const projectedNodes = affected.map((n) => {
      const coord = coords.get(n.nodeId)
      if (!coord) return null
      const p = project(coord.lat, coord.lng, scale, cx, cy)
      if (!p.visible) return null
      return {
        ...n,
        x: p.x,
        y: p.y,
        color: getNodeColor(n.sector),
      }
    }).filter(Boolean) as Array<typeof affected[0] & { x: number; y: number; color: string }>

    // Build edges from propagation paths
    const nodeMap = new Map(projectedNodes.map(n => [n.nodeId, n]))
    const edgeSet = new Set<string>()
    const projectedEdges: Array<{ id: string; x1: number; y1: number; x2: number; y2: number; strength: number; color: string }> = []

    for (const n of affected) {
      const path = n.propagationPath
      for (let i = 0; i < path.length - 1; i++) {
        const key = `${path[i]}→${path[i + 1]}`
        if (edgeSet.has(key)) continue
        edgeSet.add(key)
        const src = nodeMap.get(path[i])
        const tgt = nodeMap.get(path[i + 1])
        if (src && tgt) {
          projectedEdges.push({
            id: key,
            x1: src.x,
            y1: src.y,
            x2: tgt.x,
            y2: tgt.y,
            strength: Math.min(src.impactScore, tgt.impactScore),
            color: src.color,
          })
        }
      }
    }

    return {
      nodes: projectedNodes,
      edges: projectedEdges,
      systemEnergy: result.totalLoss,
    }
  }, [result, zoom, scale, cx, cy])

  /* ── Empty state ── */
  if (!result) {
    return (
      <div className="w-full h-full bg-ds-surface rounded-ds-xl border border-ds-border overflow-hidden relative flex flex-col">
        <div className="ds-panel-header">
          <div className="ds-panel-header-title">
            <Globe size={14} className="text-ds-text-dim" />
            <span className="text-caption font-semibold text-ds-text-dim">{lc(copy.globeView, lang)}</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-ds-surface-raised border border-ds-border flex items-center justify-center mx-auto mb-3">
              <Globe size={20} className="text-ds-text-dim" />
            </div>
            <p className="text-caption text-ds-text-dim">{lc(copy.awaiting, lang)}</p>
            <p className="text-nano text-ds-text-dim mt-1 font-mono">{lc(copy.awaitLabel, lang)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-ds-surface rounded-ds-xl border border-ds-border overflow-hidden relative flex flex-col">
      {/* Header */}
      <div className="ds-panel-header">
        <div className="ds-panel-header-title">
          <div className="w-2 h-2 rounded-full bg-ds-accent animate-pulse" />
          <span className="text-caption font-semibold text-ds-text tracking-tight">{lc(copy.globeView, lang)}</span>
          <span className="text-nano text-ds-accent font-mono ml-1">{lc(copy.mathMode, lang)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="ds-panel-header-meta">
            {nodes.length} {lc(copy.nodes, lang)} · {result.affectedSectors.length} {lc(copy.sectors, lang)}
          </span>
          <span className="text-nano font-mono text-ds-warning">{systemEnergy.toFixed(1)} {lc(copy.energy, lang)}</span>
        </div>
      </div>

      {/* SVG Globe */}
      <div className="flex-1 relative">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-full"
          style={{ background: 'radial-gradient(ellipse at center, #0a0a14 0%, #06060a 100%)' }}
        >
          {/* Globe circle */}
          <circle
            cx={cx}
            cy={cy}
            r={scale * 0.95}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth={1}
            opacity={0.5}
          />

          {/* Grid lines */}
          {[-10, 0, 10, 20, 30, 40].map(lat => {
            const points: string[] = []
            for (let lng = 30; lng <= 65; lng += 2) {
              const p = project(lat, lng, scale, cx, cy)
              if (p.visible) points.push(`${p.x},${p.y}`)
            }
            return points.length > 1 ? (
              <polyline
                key={`lat-${lat}`}
                points={points.join(' ')}
                fill="none"
                stroke="#1a1a2e"
                strokeWidth={0.5}
                opacity={0.3}
              />
            ) : null
          })}
          {[35, 40, 45, 50, 55, 60].map(lng => {
            const points: string[] = []
            for (let lat = 10; lat <= 35; lat += 2) {
              const p = project(lat, lng, scale, cx, cy)
              if (p.visible) points.push(`${p.x},${p.y}`)
            }
            return points.length > 1 ? (
              <polyline
                key={`lng-${lng}`}
                points={points.join(' ')}
                fill="none"
                stroke="#1a1a2e"
                strokeWidth={0.5}
                opacity={0.3}
              />
            ) : null
          })}

          {/* GCC outline */}
          <polyline
            points={GCC_OUTLINE.map(([lat, lng]) => {
              const p = project(lat, lng, scale, cx, cy)
              return p.visible ? `${p.x},${p.y}` : ''
            }).filter(Boolean).join(' ')}
            fill="rgba(26, 26, 46, 0.3)"
            stroke="#2a2a4a"
            strokeWidth={1.5}
          />

          {/* Propagation edges */}
          {edges.map((e) => (
            <motion.line
              key={e.id}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={e.color}
              strokeWidth={Math.max(0.5, e.strength * 3)}
              opacity={0.3 + e.strength * 0.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          ))}

          {/* Node glows (outer) */}
          {nodes.map((n) => (
            <circle
              key={`glow-${n.nodeId}`}
              cx={n.x}
              cy={n.y}
              r={8 + n.impactScore * 25}
              fill={n.color}
              opacity={0.08 + n.impactScore * 0.12}
              filter="url(#globe-blur)"
            />
          ))}

          {/* Nodes */}
          {nodes.map((n) => (
            <motion.circle
              key={n.nodeId}
              cx={n.x}
              cy={n.y}
              r={3 + n.impactScore * 8}
              fill={n.color}
              stroke={n.color}
              strokeWidth={1}
              opacity={0.6 + n.impactScore * 0.4}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: n.depth * 0.1 }}
            />
          ))}

          {/* Node labels (top nodes only) */}
          {nodes.slice(0, 10).map((n) => (
            <text
              key={`label-${n.nodeId}`}
              x={n.x}
              y={n.y - 12 - n.impactScore * 8}
              textAnchor="middle"
              fill="#8888aa"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              opacity={0.7}
            >
              {n.label}
            </text>
          ))}

          {/* Filters */}
          <defs>
            <filter id="globe-blur">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <button
            onClick={() => setZoom(z => Math.min(z * 1.3, 3))}
            className="p-1.5 bg-ds-card/80 border border-ds-border rounded-md hover:bg-ds-card transition-colors text-ds-text-dim hover:text-ds-text"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z / 1.3, 0.5))}
            className="p-1.5 bg-ds-card/80 border border-ds-border rounded-md hover:bg-ds-card transition-colors text-ds-text-dim hover:text-ds-text"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 bg-ds-card/80 border border-ds-border rounded-md hover:bg-ds-card transition-colors text-ds-text-dim hover:text-ds-text"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
