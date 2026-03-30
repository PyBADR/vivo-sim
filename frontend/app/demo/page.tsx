'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  RotateCcw,
  Settings,
  Zap,
  Globe,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Activity,
  Radio,
  Shield,
  Network,
  Languages,
} from 'lucide-react'

import GraphPanel from '@/components/graph/GraphPanel'
import DemoGlobe from '@/components/globe/DemoGlobe'
import TimelinePanel from '@/components/simulation/TimelinePanel'
import ReportPanel from '@/components/report/ReportPanel'
import PropagationInsightPanel from '@/components/report/PropagationInsightPanel'
import ChatPanel from '@/components/chat/ChatPanel'
// All mock data eliminated — engine provides real data
import { useScenarioEngine } from '@/lib/hooks/useScenarioEngine'
import { useI18n } from '@/lib/i18n/context'

/* ──────────────────────────────────────────────
   Bilingual copy for demo page
   ────────────────────────────────────────────── */
const copy = {
  controlRoom:    { en: 'Control Room',                ar: 'غرفة التحكم' },
  activeScenario: { en: 'Active Scenario',             ar: 'السيناريو النشط' },
  signals:        { en: 'signals',                     ar: 'إشارات' },
  window:         { en: 'window',                      ar: 'نافذة' },
  runSim:         { en: 'Run Simulation',              ar: 'تشغيل المحاكاة' },
  processing:     { en: 'Processing...',               ar: 'جاري المعالجة...' },
  pipeline:       { en: 'Pipeline',                    ar: 'خط المعالجة' },
  gccScenarios:   { en: 'GCC Scenarios',               ar: 'سيناريوهات الخليج' },
  awaiting:       { en: 'AWAITING INPUT',              ar: 'في انتظار الإدخال' },
  selectScenario: { en: 'Select a GCC scenario and run the propagation engine',
                    ar: 'اختر سيناريو خليجي وشغّل محرك الانتشار' },
  computing:      { en: 'Computing impact propagation across GCC graph...',
                    ar: 'حساب انتشار التأثير عبر الشبكة الخليجية...' },
  bfsActive:      { en: 'BFS PROPAGATION ACTIVE',      ar: 'محرك الانتشار نشط' },
  timeline:       { en: 'TIMELINE · AWAITING SIMULATION', ar: 'الجدول الزمني · في انتظار المحاكاة' },
  building:       { en: 'Building temporal model...',   ar: 'بناء النموذج الزمني...' },
  rerun:          { en: 'Rerun',                        ar: 'إعادة' },
  reset:          { en: 'Reset',                        ar: 'إعادة تعيين' },
  propagation:    { en: 'Propagation',                  ar: 'الانتشار' },
  brief:          { en: 'Brief',                        ar: 'ملخص' },
  analyst:        { en: 'Select a GCC scenario and run the propagation engine to activate the analyst.',
                    ar: 'اختر سيناريو خليجي وشغّل محرك الانتشار لتفعيل المحلل.' },
  desktopRequired:{ en: 'Desktop Required',             ar: 'يتطلب جهاز مكتبي' },
  desktopMsg:     { en: 'The Control Room requires a desktop viewport for the full intelligence experience.',
                    ar: 'تتطلب غرفة التحكم شاشة سطح مكتب لتجربة الاستخبارات الكاملة.' },
  backHome:       { en: 'Back to Home',                 ar: 'العودة للرئيسية' },
  globeView:      { en: 'Globe View',                   ar: 'عرض الكرة الأرضية' },
  graphView:      { en: 'Graph View',                   ar: 'عرض الشبكة' },
  presets:        { en: 'Presets',                       ar: 'سيناريوهات مسبقة' },
}

/* ── Bilingual processing steps ── */
const processingSteps = [
  { en: 'Parsing scenario input',       ar: 'تحليل مدخلات السيناريو' },
  { en: 'Extracting entities',          ar: 'استخراج الكيانات' },
  { en: 'Building relationship graph',  ar: 'بناء شبكة العلاقات' },
  { en: 'Running propagation engine',   ar: 'تشغيل محرك الانتشار' },
  { en: 'Computing sector aggregation', ar: 'حساب التجميع القطاعي' },
  { en: 'Generating intelligence brief',ar: 'إنشاء التقرير الاستخباري' },
]

/* ── Right sidebar tab ── */
type InsightTab = 'brief' | 'propagation'

/* ── Helper ── */
function lc(pair: { en: string; ar: string }, lang: string): string {
  return lang === 'ar' ? pair.ar : pair.en
}

export default function DemoPage() {
  // ── i18n ──
  const { lang, toggle } = useI18n()
  const isAr = lang === 'ar'

  // ── Real scenario engine ──
  const engine = useScenarioEngine()

  // ── Local UI state ──
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [processingStep, setProcessingStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [insightTab, setInsightTab] = useState<InsightTab>('propagation')
  const [viewMode, setViewMode] = useState<'graph' | 'globe'>('graph')

  const isRunning = isAnimating
  const hasResults = engine.state === 'complete'

  // ── Derived report from engine result ──
  const derivedReport = useMemo(() => {
    if (!engine.result) return null
    const r = engine.result
    const isArLang = lang === 'ar'
    const spreadLevel =
      r.totalLoss >= 5 ? 'high' : r.totalLoss >= 2 ? 'medium' : 'low'
    return {
      prediction: r.explanation,
      main_driver: r.topDrivers[0]?.label ?? '—',
      top_influencers: r.topDrivers.slice(0, 5).map((d) => d.label),
      spread_level: spreadLevel,
      confidence: r.confidence,
      timeline_summary: r.propagationChain,
      graph_observations: [
        `${r.affectedSectors.length} ${isArLang ? 'قطاعات متأثرة من أصل' : 'sectors affected out of'} 14`,
        `${r.propagationResult.affectedNodes.length} ${isArLang ? 'عقدة تأثرت' : 'nodes impacted'}`,
        `${isArLang ? 'أقصى عمق انتشار:' : 'Max propagation depth:'} ${r.propagationResult.maxDepth}`,
        `${isArLang ? 'طاقة النظام الكلية:' : 'Total system energy:'} ${r.totalLoss.toFixed(2)}`,
      ],
    }
  }, [engine.result, lang])

  // ── Transform propagation result into React Flow graph ──
  const { graphNodes, graphEdges } = useMemo(() => {
    if (!engine.result) return { graphNodes: [], graphEdges: [] }
    const affected = engine.result.propagationResult.affectedNodes
    if (!affected.length) return { graphNodes: [], graphEdges: [] }

    // Layout: radial rings based on depth
    const depthGroups = new Map<number, typeof affected>()
    for (const n of affected) {
      const group = depthGroups.get(n.depth) || []
      group.push(n)
      depthGroups.set(n.depth, group)
    }

    const centerX = 500
    const centerY = 400
    const ringSpacing = 160

    const nodes = affected.map((n) => {
      const ring = n.depth
      const nodesAtDepth = depthGroups.get(ring) || []
      const idx = nodesAtDepth.indexOf(n)
      const count = nodesAtDepth.length
      const angle = (2 * Math.PI * idx) / Math.max(count, 1) - Math.PI / 2
      const radius = ring * ringSpacing + (ring === 0 ? 0 : 80)

      return {
        id: n.nodeId,
        position: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        },
        data: {
          label: n.label,
          type: n.sector,
          weight: n.impactScore,
        },
        type: 'custom' as const,
      }
    })

    // Build edges from propagation paths
    const edgeSet = new Set<string>()
    const edges: Array<{ id: string; source: string; target: string; label?: string; animated?: boolean }> = []
    for (const n of affected) {
      const path = n.propagationPath
      for (let i = 0; i < path.length - 1; i++) {
        const key = `${path[i]}→${path[i + 1]}`
        if (!edgeSet.has(key)) {
          edgeSet.add(key)
          edges.push({
            id: `e-${path[i]}-${path[i + 1]}`,
            source: path[i],
            target: path[i + 1],
            animated: true,
          })
        }
      }
    }

    return { graphNodes: nodes, graphEdges: edges }
  }, [engine.result])

  // ── Derive timeline steps from engine frames + narrative events ──
  const derivedTimelineSteps = useMemo(() => {
    if (!engine.result) return null
    const { frames, narrativeEvents } = engine.result
    // Sample 4 evenly-spaced frames
    const frameCount = frames.length
    if (frameCount === 0) return null
    const indices = [0, Math.floor(frameCount * 0.33), Math.floor(frameCount * 0.66), frameCount - 1]
    return indices.map((fi, stepIdx) => {
      const f = frames[fi]
      // Find narrative events near this frame's hour
      const nearEvents = narrativeEvents.filter(ne =>
        Math.abs(ne.hour - f.hoursElapsed) <= (engine.result!.scenario.expectedDuration / 4)
      )
      const eventLabels = nearEvents.map(ne => isAr ? ne.title.ar : ne.title.en)
      const summary = nearEvents.length > 0
        ? (isAr ? nearEvents[0].description.ar : nearEvents[0].description.en)
        : `${f.affectedCount} ${isAr ? 'عقدة متأثرة' : 'nodes affected'}, ${isAr ? 'طاقة:' : 'energy:'} ${f.totalEnergy.toFixed(1)}`
      return {
        step: stepIdx + 1,
        label: `t${stepIdx + 1} — ${Math.round(f.hoursElapsed)}h`,
        summary,
        sentiment_score: 1 - f.maxImpact, // inverse: high impact = low sentiment
        visibility_score: Math.min(f.totalEnergy / 8, 1),
        events: eventLabels.slice(0, 3),
      }
    })
  }, [engine.result, isAr])

  // ── Mobile detection ──
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ── Processing animation ──
  useEffect(() => {
    if (!isAnimating) return
    const interval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev < processingSteps.length - 1) return prev + 1
        return prev
      })
    }, 500)
    return () => clearInterval(interval)
  }, [isAnimating])

  // ── When animation reaches last step, trigger real engine ──
  useEffect(() => {
    if (processingStep === processingSteps.length - 1 && isAnimating) {
      const timeout = setTimeout(() => {
        engine.run()
        setIsAnimating(false)
        setCurrentStep(0)
      }, 400)
      return () => clearTimeout(timeout)
    }
  }, [processingStep, isAnimating])

  // ── Handlers ──
  const handleRunSimulation = () => {
    setIsAnimating(true)
    setProcessingStep(0)
    engine.reset()
  }

  const handleReset = () => {
    setIsAnimating(false)
    setCurrentStep(0)
    setProcessingStep(0)
    engine.reset()
  }

  // ── System status ──
  const systemStatus = useMemo(() => {
    if (isRunning) return { label: isAr ? 'قيد المعالجة' : 'PROCESSING', color: 'bg-ds-accent', pulse: true }
    if (hasResults) return { label: isAr ? 'مكتمل' : 'COMPLETE', color: 'bg-ds-success', pulse: false }
    return { label: isAr ? 'جاهز' : 'READY', color: 'bg-ds-text-dim', pulse: false }
  }, [isRunning, hasResults, isAr])

  // ── Mobile fallback ──
  if (isMobile) {
    return (
      <div className="h-screen w-full bg-ds-bg flex items-center justify-center p-6" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="ds-card p-10 text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-ds-surface-raised border border-ds-border flex items-center justify-center mx-auto mb-5">
            <Globe className="w-6 h-6 text-ds-text-muted" />
          </div>
          <h2 className="text-h3 mb-3">{lc(copy.desktopRequired, lang)}</h2>
          <p className="text-caption text-ds-text-muted mb-8 leading-relaxed">
            {lc(copy.desktopMsg, lang)}
          </p>
          <Link href="/" className="ds-btn-primary">
            <ArrowLeft className="w-4 h-4" />
            {lc(copy.backHome, lang)}
          </Link>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════
     MAIN SYSTEM INTERFACE
     ══════════════════════════════════════════════ */
  return (
    <div className="h-screen w-full bg-ds-bg flex flex-col overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── TOP BAR — System status bar ── */}
      <div className="h-11 border-b border-ds-border bg-ds-surface/80 backdrop-blur-xl flex-shrink-0 flex items-center justify-between px-5">
        {/* Left: Nav + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-ds-text-muted hover:text-ds-text transition-colors"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
          </Link>
          <div className="w-px h-5 bg-ds-border" />
          <span className="text-micro font-semibold text-ds-text tracking-tight">VIVO SIM</span>
          <span className="text-micro text-ds-text-dim font-mono">/</span>
          <span className="text-micro text-ds-text-muted font-mono">{lc(copy.controlRoom, lang)}</span>
        </div>

        {/* Center: System status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${systemStatus.color} ${systemStatus.pulse ? 'animate-pulse' : ''}`} />
            <span className="text-nano font-mono uppercase tracking-[0.15em] text-ds-text-secondary">
              {systemStatus.label}
            </span>
          </div>
          {engine.runId !== '—' && (
            <>
              <span className="text-nano text-ds-text-dim">·</span>
              <span className="text-nano font-mono text-ds-text-dim">
                <Clock size={10} className="inline mr-1 -mt-0.5" />
                {engine.runTimestamp}
              </span>
              <span className="text-nano font-mono text-ds-text-dim">{engine.runId}</span>
            </>
          )}
        </div>

        {/* Right: Lang toggle + Globe link + Scenario meta */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-micro text-ds-text-muted truncate max-w-[180px] font-mono" dir="auto">
            {isAr ? engine.activeScenario.title.ar : engine.activeScenario.title.en}
          </span>
          <button
            onClick={() => setViewMode(viewMode === 'graph' ? 'globe' : 'graph')}
            className="p-1.5 hover:bg-ds-card rounded-md transition-colors text-ds-text-dim hover:text-ds-accent flex items-center gap-1"
            title={viewMode === 'graph' ? lc(copy.globeView, lang) : lc(copy.graphView, lang)}
          >
            {viewMode === 'graph' ? <Globe className="w-3.5 h-3.5" /> : <Network className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggle}
            className="px-2 py-1 rounded-md text-[10px] font-mono font-bold border border-ds-border hover:border-ds-accent/40 hover:text-ds-accent transition-all text-ds-text-dim"
          >
            {isAr ? 'EN' : 'عربي'}
          </button>
          <button className="p-1.5 hover:bg-ds-card rounded-md transition-colors text-ds-text-dim hover:text-ds-text">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ LEFT SIDEBAR — Controls ═══ */}
        <div className="w-[280px] bg-ds-surface border-e border-ds-border overflow-y-auto flex flex-col">
          <div className="p-5 space-y-5 flex flex-col">

            {/* Scenario Info */}
            <div>
              <h3 className="text-nano uppercase tracking-[0.15em] text-ds-text-dim font-semibold mb-3 flex items-center gap-2">
                <Radio size={10} />
                {lc(copy.activeScenario, lang)}
              </h3>
              <div className="bg-ds-card rounded-ds-lg p-3 border border-ds-border space-y-2">
                <p className="text-micro font-medium text-ds-text" dir="auto">
                  {isAr ? engine.activeScenario.title.ar : engine.activeScenario.title.en}
                </p>
                <p className="text-[11px] text-ds-text-muted leading-relaxed" dir="auto">
                  {isAr ? engine.activeScenario.description.ar : engine.activeScenario.description.en}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-ds-text-dim font-mono">
                  <span>{engine.activeScenario.signals.length} {lc(copy.signals, lang)}</span>
                  <span>·</span>
                  <span>{engine.activeScenario.expectedDuration}h {lc(copy.window, lang)}</span>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="w-full ds-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {lc(copy.processing, lang)}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {lc(copy.runSim, lang)}
                </>
              )}
            </button>

            {/* Processing Pipeline */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="pt-4 border-t border-ds-border space-y-3">
                    <h3 className="text-nano uppercase tracking-[0.15em] text-ds-text-dim font-semibold flex items-center gap-2">
                      <Activity size={10} className="text-ds-accent" />
                      {lc(copy.pipeline, lang)}
                    </h3>
                    <div className="space-y-2.5">
                      {processingSteps.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: isAr ? 8 : -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-2.5"
                        >
                          {idx < processingStep ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-ds-success flex-shrink-0" />
                          ) : idx === processingStep ? (
                            <Loader2 className="w-3.5 h-3.5 text-ds-accent animate-spin flex-shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-ds-text-dim flex-shrink-0" />
                          )}
                          <span className={`text-[11px] font-mono ${
                            idx < processingStep
                              ? 'text-ds-text-muted line-through'
                              : idx === processingStep
                                ? 'text-ds-accent'
                                : 'text-ds-text-dim'
                          }`}>
                            {lc(step, lang)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="ds-divider" />

            {/* Preset Scenarios — from real ALL_SCENARIOS */}
            <div>
              <h3 className="text-nano uppercase tracking-[0.15em] text-ds-text-dim font-semibold mb-3 flex items-center gap-2">
                <Shield size={10} />
                {lc(copy.gccScenarios, lang)} ({engine.scenarios.length})
              </h3>
              <div className="space-y-2">
                {engine.scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => { engine.selectScenario(scenario); handleReset() }}
                    className={`w-full text-start px-3.5 py-3 rounded-ds-lg border transition-all duration-200 ${
                      engine.activeScenario.id === scenario.id
                        ? 'bg-ds-accent/8 border-ds-accent/25'
                        : 'bg-ds-bg-alt border-ds-border hover:border-ds-border-hover hover:bg-ds-card/40'
                    }`}
                  >
                    <div className="text-micro font-medium text-ds-text truncate" dir="auto">
                      {isAr ? scenario.title.ar : scenario.title.en}
                    </div>
                    {!isAr && (
                      <div className="text-[10px] text-ds-text-dim font-mono mt-1 truncate" dir="rtl">
                        {scenario.title.ar}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-ds-text-dim font-mono">
                      <Globe className="w-3 h-3" />
                      {scenario.signals.length} {lc(copy.signals, lang)} · {scenario.expectedDuration}h
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle: Graph ↔ Globe */}
            <div className="flex gap-1 p-1 bg-ds-bg-alt rounded-ds-lg border border-ds-border">
              <button
                onClick={() => setViewMode('graph')}
                className={`flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-ds transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'graph'
                    ? 'bg-ds-accent/10 text-ds-accent border border-ds-accent/20'
                    : 'text-ds-text-dim hover:text-ds-text-secondary border border-transparent'
                }`}
              >
                <Network className="w-3 h-3" />
                {lc(copy.graphView, lang)}
              </button>
              <button
                onClick={() => setViewMode('globe')}
                className={`flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-ds transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'globe'
                    ? 'bg-ds-accent/10 text-ds-accent border border-ds-accent/20'
                    : 'text-ds-text-dim hover:text-ds-text-secondary border border-transparent'
                }`}
              >
                <Globe className="w-3 h-3" />
                {lc(copy.globeView, lang)}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ CENTER — Graph / Globe + Timeline (primary focus) ═══ */}
        <div className="flex-1 bg-ds-bg overflow-y-auto flex flex-col p-4 gap-4">
          {/* Main visualization — Graph or Globe */}
          <div className="flex-1 min-h-[420px]">
            {!hasResults && !isRunning && (
              <div className="h-full ds-card rounded-ds-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 ds-grid-bg opacity-20" />
                <div className="relative text-center">
                  <div className="w-12 h-12 rounded-full bg-ds-surface-raised border border-ds-border flex items-center justify-center mx-auto mb-3">
                    {viewMode === 'graph' ? <Network className="w-5 h-5 text-ds-text-dim" /> : <Globe className="w-5 h-5 text-ds-text-dim" />}
                  </div>
                  <p className="text-caption text-ds-text-dim" dir="auto">
                    {lc(copy.selectScenario, lang)}
                  </p>
                  <p className="text-nano text-ds-text-dim mt-1 font-mono">{lc(copy.awaiting, lang)}</p>
                </div>
              </div>
            )}
            {isRunning && (
              <div className="h-full ds-card rounded-ds-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 ds-grid-bg opacity-20" />
                <div className="relative text-center">
                  <Loader2 className="w-10 h-10 mx-auto mb-3 text-ds-accent animate-spin" />
                  <p className="text-caption text-ds-text-muted" dir="auto">
                    {lc(copy.computing, lang)}
                  </p>
                  <p className="text-nano text-ds-accent font-mono mt-1">{lc(copy.bfsActive, lang)}</p>
                </div>
              </div>
            )}
            {hasResults && viewMode === 'graph' && (
              <GraphPanel initialNodes={graphNodes} initialEdges={graphEdges} lang={lang} />
            )}
            {hasResults && viewMode === 'globe' && (
              <DemoGlobe result={engine.result} lang={lang} />
            )}
          </div>

          {/* Timeline Panel */}
          <div className="flex-shrink-0">
            {!hasResults && !isRunning && (
              <div className="ds-card rounded-ds-xl p-5 text-center">
                <p className="text-caption text-ds-text-dim font-mono">{lc(copy.timeline, lang)}</p>
              </div>
            )}
            {isRunning && (
              <div className="ds-card rounded-ds-xl p-5 flex items-center justify-center gap-3">
                <Loader2 className="w-4 h-4 text-ds-accent animate-spin" />
                <span className="text-caption text-ds-text-muted font-mono">{lc(copy.building, lang)}</span>
              </div>
            )}
            {hasResults && derivedTimelineSteps && (
              <TimelinePanel
                steps={derivedTimelineSteps}
                activeStep={currentStep}
                onStepChange={setCurrentStep}
                lang={lang}
              />
            )}
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR — Intelligence Brief + Propagation Analysis ═══ */}
        <div className="w-[380px] bg-ds-surface border-s border-ds-border overflow-y-auto flex flex-col">
          <div className="p-4 space-y-4 flex flex-col h-full">

            {/* Action buttons */}
            {hasResults && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleRunSimulation}
                  className="flex-1 ds-btn-primary text-micro"
                >
                  <Play className="w-3.5 h-3.5" />
                  {lc(copy.rerun, lang)}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 ds-btn-secondary text-micro"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {lc(copy.reset, lang)}
                </button>
              </div>
            )}

            {/* Tab selector */}
            {hasResults && (
              <div className="flex gap-1 p-1 bg-ds-bg-alt rounded-ds-lg border border-ds-border flex-shrink-0">
                <button
                  onClick={() => setInsightTab('propagation')}
                  className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded-ds transition-all ${
                    insightTab === 'propagation'
                      ? 'bg-ds-accent/10 text-ds-accent border border-ds-accent/20'
                      : 'text-ds-text-dim hover:text-ds-text-secondary border border-transparent'
                  }`}
                >
                  {lc(copy.propagation, lang)}
                </button>
                <button
                  onClick={() => setInsightTab('brief')}
                  className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded-ds transition-all ${
                    insightTab === 'brief'
                      ? 'bg-ds-accent/10 text-ds-accent border border-ds-accent/20'
                      : 'text-ds-text-dim hover:text-ds-text-secondary border border-transparent'
                  }`}
                >
                  {lc(copy.brief, lang)}
                </button>
              </div>
            )}

            {/* Panels */}
            <div className="flex-shrink-0">
              {!hasResults && insightTab === 'propagation' && (
                <PropagationInsightPanel result={null} lang={lang} />
              )}
              {!hasResults && insightTab === 'brief' && (
                <ReportPanel report={null} lang={lang} />
              )}
              {hasResults && insightTab === 'propagation' && (
                <PropagationInsightPanel result={engine.result} lang={lang} />
              )}
              {hasResults && insightTab === 'brief' && (
                <ReportPanel report={derivedReport} lang={lang} />
              )}
            </div>

            {/* Analyst / Chat */}
            <div className="flex-1 min-h-0 flex flex-col">
              <ChatPanel
                lang={lang}
                initialMessages={[
                  {
                    id: '1',
                    role: 'assistant' as const,
                    content: hasResults
                      ? lc({ en: 'Simulation complete. The scenario shows propagation across GCC infrastructure. Ask me anything about the results.', ar: 'اكتملت المحاكاة. يظهر السيناريو انتشارًا عبر البنية التحتية الخليجية. اسألني أي شيء عن النتائج.' }, lang)
                      : lc(copy.analyst, lang),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
