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
} from 'lucide-react'

import GraphPanel from '@/components/graph/GraphPanel'
import TimelinePanel from '@/components/simulation/TimelinePanel'
import ReportPanel from '@/components/report/ReportPanel'
import PropagationInsightPanel from '@/components/report/PropagationInsightPanel'
import ChatPanel from '@/components/chat/ChatPanel'
import {
  mockGraphNodes,
  mockGraphEdges,
  mockSimulationSteps,
  mockReport,
  mockChatMessages,
} from '@/lib/mock-data'
import { useScenarioEngine } from '@/lib/hooks/useScenarioEngine'

/* ──────────────────────────────────────────────
   Processing pipeline steps
   ────────────────────────────────────────────── */
const processingSteps = [
  { label: 'Parsing scenario input' },
  { label: 'Extracting entities' },
  { label: 'Building relationship graph' },
  { label: 'Running propagation engine' },
  { label: 'Computing sector aggregation' },
  { label: 'Generating intelligence brief' },
]

/* ── Right sidebar tab ── */
type InsightTab = 'brief' | 'propagation'

export default function DemoPage() {
  // ── Real scenario engine ──
  const engine = useScenarioEngine()

  // ── Local UI state ──
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [processingStep, setProcessingStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [insightTab, setInsightTab] = useState<InsightTab>('propagation')

  const isRunning = isAnimating
  const hasResults = engine.state === 'complete'

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
    if (isRunning) return { label: 'PROCESSING', color: 'bg-ds-accent', pulse: true }
    if (hasResults) return { label: 'COMPLETE', color: 'bg-ds-success', pulse: false }
    return { label: 'READY', color: 'bg-ds-text-dim', pulse: false }
  }, [isRunning, hasResults])

  // ── Mobile fallback ──
  if (isMobile) {
    return (
      <div className="h-screen w-full bg-ds-bg flex items-center justify-center p-6">
        <div className="ds-card p-10 text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-ds-surface-raised border border-ds-border flex items-center justify-center mx-auto mb-5">
            <Globe className="w-6 h-6 text-ds-text-muted" />
          </div>
          <h2 className="text-h3 mb-3">Desktop Required</h2>
          <p className="text-caption text-ds-text-muted mb-8 leading-relaxed">
            The Control Room requires a desktop viewport for the full intelligence experience.
          </p>
          <Link href="/" className="ds-btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════
     MAIN SYSTEM INTERFACE
     ══════════════════════════════════════════════ */
  return (
    <div className="h-screen w-full bg-ds-bg flex flex-col overflow-hidden">

      {/* ── TOP BAR — System status bar ── */}
      <div className="h-11 border-b border-ds-border bg-ds-surface/80 backdrop-blur-xl flex-shrink-0 flex items-center justify-between px-5">
        {/* Left: Nav + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-ds-text-muted hover:text-ds-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div className="w-px h-5 bg-ds-border" />
          <span className="text-micro font-semibold text-ds-text tracking-tight">VIVO SIM</span>
          <span className="text-micro text-ds-text-dim font-mono">/</span>
          <span className="text-micro text-ds-text-muted font-mono">Control Room</span>
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

        {/* Right: Scenario meta */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-micro text-ds-text-muted truncate max-w-[200px] font-mono">
            {engine.activeScenario.title.en}
          </span>
          <button className="p-1.5 hover:bg-ds-card rounded-md transition-colors text-ds-text-dim hover:text-ds-text">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ LEFT SIDEBAR — Controls ═══ */}
        <div className="w-[280px] bg-ds-surface border-r border-ds-border overflow-y-auto flex flex-col">
          <div className="p-5 space-y-5 flex flex-col">

            {/* Scenario Info */}
            <div>
              <h3 className="text-nano uppercase tracking-[0.15em] text-ds-text-dim font-semibold mb-3 flex items-center gap-2">
                <Radio size={10} />
                Active Scenario
              </h3>
              <div className="bg-ds-card rounded-ds-lg p-3 border border-ds-border space-y-2">
                <p className="text-micro font-medium text-ds-text">
                  {engine.activeScenario.title.en}
                </p>
                <p className="text-[11px] text-ds-text-muted leading-relaxed" dir="auto">
                  {engine.activeScenario.description.ar}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-ds-text-dim font-mono">
                  <span>{engine.activeScenario.signals.length} signals</span>
                  <span>·</span>
                  <span>{engine.activeScenario.expectedDuration}h window</span>
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
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run Simulation
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
                      Pipeline
                    </h3>
                    <div className="space-y-2.5">
                      {processingSteps.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
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
                            {step.label}
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
                GCC Scenarios ({engine.scenarios.length})
              </h3>
              <div className="space-y-2">
                {engine.scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => { engine.selectScenario(scenario); handleReset() }}
                    className={`w-full text-left px-3.5 py-3 rounded-ds-lg border transition-all duration-200 ${
                      engine.activeScenario.id === scenario.id
                        ? 'bg-ds-accent/8 border-ds-accent/25'
                        : 'bg-ds-bg-alt border-ds-border hover:border-ds-border-hover hover:bg-ds-card/40'
                    }`}
                  >
                    <div className="text-micro font-medium text-ds-text truncate">
                      {scenario.title.en}
                    </div>
                    <div className="text-[10px] text-ds-text-dim font-mono mt-1 truncate" dir="auto">
                      {scenario.title.ar}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-ds-text-dim font-mono">
                      <Globe className="w-3 h-3" />
                      {scenario.signals.length} signals · {scenario.expectedDuration}h
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ CENTER — Graph + Timeline (primary focus) ═══ */}
        <div className="flex-1 bg-ds-bg overflow-y-auto flex flex-col p-4 gap-4">
          {/* Graph Panel — dominant visual weight */}
          <div className="flex-1 min-h-[420px]">
            {!hasResults && !isRunning && (
              <div className="h-full ds-card rounded-ds-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 ds-grid-bg opacity-20" />
                <div className="relative text-center">
                  <div className="w-12 h-12 rounded-full bg-ds-surface-raised border border-ds-border flex items-center justify-center mx-auto mb-3">
                    <Network className="w-5 h-5 text-ds-text-dim" />
                  </div>
                  <p className="text-caption text-ds-text-dim">
                    Select a GCC scenario and run the propagation engine
                  </p>
                  <p className="text-nano text-ds-text-dim mt-1 font-mono">AWAITING INPUT</p>
                </div>
              </div>
            )}
            {isRunning && (
              <div className="h-full ds-card rounded-ds-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 ds-grid-bg opacity-20" />
                <div className="relative text-center">
                  <Loader2 className="w-10 h-10 mx-auto mb-3 text-ds-accent animate-spin" />
                  <p className="text-caption text-ds-text-muted">
                    Computing impact propagation across GCC graph...
                  </p>
                  <p className="text-nano text-ds-accent font-mono mt-1">BFS PROPAGATION ACTIVE</p>
                </div>
              </div>
            )}
            {hasResults && (
              <GraphPanel initialNodes={mockGraphNodes} initialEdges={mockGraphEdges} />
            )}
          </div>

          {/* Timeline Panel */}
          <div className="flex-shrink-0">
            {!hasResults && !isRunning && (
              <div className="ds-card rounded-ds-xl p-5 text-center">
                <p className="text-caption text-ds-text-dim font-mono">TIMELINE · AWAITING SIMULATION</p>
              </div>
            )}
            {isRunning && (
              <div className="ds-card rounded-ds-xl p-5 flex items-center justify-center gap-3">
                <Loader2 className="w-4 h-4 text-ds-accent animate-spin" />
                <span className="text-caption text-ds-text-muted font-mono">Building temporal model...</span>
              </div>
            )}
            {hasResults && (
              <TimelinePanel
                steps={mockSimulationSteps}
                activeStep={currentStep}
                onStepChange={setCurrentStep}
              />
            )}
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR — Intelligence Brief + Propagation Analysis ═══ */}
        <div className="w-[380px] bg-ds-surface border-l border-ds-border overflow-y-auto flex flex-col">
          <div className="p-4 space-y-4 flex flex-col h-full">

            {/* Action buttons */}
            {hasResults && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleRunSimulation}
                  className="flex-1 ds-btn-primary text-micro"
                >
                  <Play className="w-3.5 h-3.5" />
                  Rerun
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 ds-btn-secondary text-micro"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
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
                  Propagation
                </button>
                <button
                  onClick={() => setInsightTab('brief')}
                  className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded-ds transition-all ${
                    insightTab === 'brief'
                      ? 'bg-ds-accent/10 text-ds-accent border border-ds-accent/20'
                      : 'text-ds-text-dim hover:text-ds-text-secondary border border-transparent'
                  }`}
                >
                  Brief
                </button>
              </div>
            )}

            {/* Panels */}
            <div className="flex-shrink-0">
              {!hasResults && insightTab === 'propagation' && (
                <PropagationInsightPanel result={null} />
              )}
              {!hasResults && insightTab === 'brief' && (
                <ReportPanel report={null} />
              )}
              {hasResults && insightTab === 'propagation' && (
                <PropagationInsightPanel result={engine.result} />
              )}
              {hasResults && insightTab === 'brief' && (
                <ReportPanel report={mockReport} />
              )}
            </div>

            {/* Analyst / Chat */}
            <div className="flex-1 min-h-0 flex flex-col">
              <ChatPanel
                initialMessages={
                  hasResults
                    ? mockChatMessages
                    : [
                        {
                          id: '1',
                          role: 'assistant' as const,
                          content: 'Select a GCC scenario and run the propagation engine to activate the analyst.',
                        },
                      ]
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
