'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  ALL_SCENARIOS,
  runDemoScenario,
  type DemoScenario,
  type DemoResult,
} from '@/lib/visualization/demoScenarios'

/* ── Hook: useScenarioEngine ──
   Bridges the real propagation engine to the UI.
   Returns scenario list, active scenario, run state, and computed results. */

export type EngineState = 'idle' | 'processing' | 'complete'

export interface ScenarioEngineReturn {
  scenarios: DemoScenario[]
  activeScenario: DemoScenario
  selectScenario: (scenario: DemoScenario) => void
  run: () => void
  reset: () => void
  state: EngineState
  result: DemoResult | null
  runId: string
  runTimestamp: string
}

export function useScenarioEngine(): ScenarioEngineReturn {
  const scenarios = ALL_SCENARIOS
  const [activeScenario, setActiveScenario] = useState<DemoScenario>(scenarios[0])
  const [state, setState] = useState<EngineState>('idle')
  const [result, setResult] = useState<DemoResult | null>(null)
  const [runId, setRunId] = useState('—')
  const [runTimestamp, setRunTimestamp] = useState('—')

  const selectScenario = useCallback((scenario: DemoScenario) => {
    setActiveScenario(scenario)
    setState('idle')
    setResult(null)
    setRunId('—')
    setRunTimestamp('—')
  }, [])

  const run = useCallback(() => {
    setState('processing')
    setResult(null)

    // Use requestAnimationFrame to yield to browser before heavy compute
    requestAnimationFrame(() => {
      try {
        const demoResult = runDemoScenario(activeScenario)
        setResult(demoResult)
        setRunId(demoResult.runId)
        setRunTimestamp(new Date().toLocaleTimeString('en-US', { hour12: false }))
        setState('complete')
      } catch (err) {
        console.error('[ScenarioEngine] Propagation error:', err)
        setState('idle')
      }
    })
  }, [activeScenario])

  const reset = useCallback(() => {
    setState('idle')
    setResult(null)
    setRunId('—')
    setRunTimestamp('—')
  }, [])

  return {
    scenarios,
    activeScenario,
    selectScenario,
    run,
    reset,
    state,
    result,
    runId,
    runTimestamp,
  }
}
