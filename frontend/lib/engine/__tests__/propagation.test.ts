/* ── Propagation Engine Mathematical Validation Tests ──
   Verifies all core formulas, sector coverage, and scenario chains.

   These tests run against the actual propagation engine and graph data
   to ensure the mathematical model produces valid, bounded, explainable outputs.

   Test categories:
   A. Propagation formula correctness
   B. Severity scaling
   C. Bounded outputs
   D. Sector aggregation
   E. Top-driver extraction
   F. Confidence calculation
   G. Scenario chain validity (all 8 mandatory)
   H. Tourism-airport linkage
   I. Port-Hormuz linkage
   J. Utilities impact logic
   K. Explanation presence */

import { propagate, propagateMultiSignal } from "../propagation";
import { ALL_GCC_NODES, NODE_MAP } from "../../map/data/gccNodes";
import { ALL_GCC_EDGES } from "../../map/data/gccEdges";
import {
  GULF_AIRSPACE_DISRUPTION,
  HORMUZ_CLOSURE,
  PORT_DISRUPTION,
  OIL_SHOCK,
  BANKING_STRESS,
  TOURISM_COLLAPSE,
  ELECTRICITY_DISRUPTION,
  WATER_STRESS,
  ALL_SCENARIOS,
  runDemoScenario,
} from "../../visualization/demoScenarios";

/* ── A. Graph Data Integrity ── */

describe("Graph Data Integrity", () => {
  test("has 100+ nodes", () => {
    expect(ALL_GCC_NODES.length).toBeGreaterThanOrEqual(100);
  });

  test("has 140+ edges", () => {
    expect(ALL_GCC_EDGES.length).toBeGreaterThanOrEqual(140);
  });

  test("all nodes have mathematical state properties", () => {
    for (const node of ALL_GCC_NODES) {
      expect(node.baseValue).toBeGreaterThan(0);
      expect(node.sensitivity).toBeGreaterThanOrEqual(0);
      expect(node.sensitivity).toBeLessThanOrEqual(1);
      expect(node.dampingFactor).toBeGreaterThanOrEqual(0);
      expect(node.dampingFactor).toBeLessThanOrEqual(1);
    }
  });

  test("all edges have label and polarity", () => {
    for (const edge of ALL_GCC_EDGES) {
      expect(edge.label).toBeTruthy();
      expect([1, -1]).toContain(edge.polarity);
      expect(edge.weight).toBeGreaterThan(0);
      expect(edge.weight).toBeLessThanOrEqual(1);
      expect(edge.sensitivity).toBeGreaterThanOrEqual(0);
      expect(edge.sensitivity).toBeLessThanOrEqual(1);
    }
  });

  test("mandatory sectors exist", () => {
    const sectors = new Set(ALL_GCC_NODES.map((n) => n.sector));
    for (const required of ["energy", "aviation", "maritime", "finance", "insurance", "logistics", "government", "tourism", "utilities", "food_supply", "regulatory"]) {
      expect(sectors.has(required)).toBe(true);
    }
  });

  test("mandatory entities exist", () => {
    const ids = new Set(ALL_GCC_NODES.map((n) => n.id));
    for (const required of ["HORMUZ", "ARAMCO", "ADNOC", "KPC", "DXB", "RUH", "DOH", "KWI", "JEBEL_ALI", "DAMMAM_PORT", "SAMA", "CBUAE", "TOURISM_UAE", "TOURISM_KSA", "SEC", "DEWA", "DESAL_GCC", "FOOD_IMPORT_GCC"]) {
      expect(ids.has(required)).toBe(true);
    }
  });

  test("all 6 GCC countries represented", () => {
    const countries = new Set(ALL_GCC_NODES.map((n) => n.country));
    for (const c of ["KSA", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman"]) {
      expect(countries.has(c)).toBe(true);
    }
  });
});

/* ── B. Propagation Formula ── */

describe("Propagation Formula", () => {
  test("HORMUZ propagation produces non-zero affected nodes", () => {
    const result = propagate("HORMUZ", 0.9);
    expect(result.affectedNodes.length).toBeGreaterThan(5);
    expect(result.totalEnergy).toBeGreaterThan(0);
  });

  test("higher signal score produces higher impact", () => {
    const low = propagate("HORMUZ", 0.3);
    const high = propagate("HORMUZ", 0.9);
    expect(high.totalEnergy).toBeGreaterThan(low.totalEnergy);
  });

  test("all impact scores are bounded [0, 1]", () => {
    const result = propagate("HORMUZ", 1.0);
    for (const node of result.affectedNodes) {
      expect(node.impactScore).toBeGreaterThanOrEqual(0);
      expect(node.impactScore).toBeLessThanOrEqual(1);
    }
  });

  test("propagation depth is bounded by MAX_PROPAGATION_DEPTH (6)", () => {
    const result = propagate("HORMUZ", 0.95);
    expect(result.maxDepth).toBeLessThanOrEqual(6);
  });

  test("time decay reduces impact", () => {
    const fresh = propagate("HORMUZ", 0.9, 0);
    const aged = propagate("HORMUZ", 0.9, 48);
    expect(aged.totalEnergy).toBeLessThan(fresh.totalEnergy);
  });
});

/* ── C. Sector Aggregation ── */

describe("Sector Aggregation", () => {
  test("sector aggregation is computed", () => {
    const result = propagate("HORMUZ", 0.9);
    expect(result.sectorAggregation.length).toBeGreaterThan(0);
  });

  test("sector aggregation includes maritime and energy for Hormuz", () => {
    const result = propagate("HORMUZ", 0.9);
    const sectors = result.sectorAggregation.map((s) => s.sector);
    expect(sectors).toContain("maritime");
    expect(sectors).toContain("energy");
  });

  test("each sector aggregation has valid metrics", () => {
    const result = propagate("HORMUZ", 0.9);
    for (const sector of result.sectorAggregation) {
      expect(sector.totalImpact).toBeGreaterThan(0);
      expect(sector.maxImpact).toBeGreaterThan(0);
      expect(sector.maxImpact).toBeLessThanOrEqual(1);
      expect(sector.nodeCount).toBeGreaterThan(0);
      expect(sector.topNode).toBeTruthy();
    }
  });
});

/* ── D. Explanation & Confidence ── */

describe("Explanation and Confidence", () => {
  test("explanation is present", () => {
    const result = propagate("HORMUZ", 0.9);
    expect(result.explanation.summary).toBeTruthy();
    expect(result.explanation.summary.length).toBeGreaterThan(10);
  });

  test("causal chain is non-empty", () => {
    const result = propagate("HORMUZ", 0.9);
    expect(result.explanation.chain.length).toBeGreaterThan(0);
  });

  test("top drivers are extracted", () => {
    const result = propagate("HORMUZ", 0.9);
    expect(result.explanation.topDrivers.length).toBeGreaterThan(0);
    for (const driver of result.explanation.topDrivers) {
      expect(driver.nodeId).toBeTruthy();
      expect(driver.label).toBeTruthy();
      expect(driver.impact).toBeGreaterThan(0);
      expect(driver.impact).toBeLessThanOrEqual(1);
    }
  });

  test("confidence is bounded [0, 1]", () => {
    const result = propagate("HORMUZ", 0.9);
    expect(result.explanation.confidence).toBeGreaterThanOrEqual(0);
    expect(result.explanation.confidence).toBeLessThanOrEqual(1);
  });
});

/* ── E. Dependency Chain Validation ── */

describe("Infrastructure Dependencies", () => {
  test("tourism-airport linkage: DXB disruption affects TOURISM_UAE", () => {
    const result = propagate("DXB", 0.85);
    const tourismNode = result.affectedNodes.find((n) => n.nodeId === "TOURISM_UAE");
    expect(tourismNode).toBeDefined();
    expect(tourismNode!.impactScore).toBeGreaterThan(0);
  });

  test("port-Hormuz linkage: Hormuz affects Jebel Ali", () => {
    const result = propagate("HORMUZ", 0.9);
    const jebelAli = result.affectedNodes.find((n) => n.nodeId === "JEBEL_ALI");
    expect(jebelAli).toBeDefined();
    expect(jebelAli!.impactScore).toBeGreaterThan(0.3);
  });

  test("Hormuz affects energy producers", () => {
    const result = propagate("HORMUZ", 0.9);
    const aramco = result.affectedNodes.find((n) => n.nodeId === "ARAMCO");
    expect(aramco).toBeDefined();
    expect(aramco!.impactScore).toBeGreaterThan(0);
  });

  test("energy-utilities linkage: Aramco affects SEC", () => {
    const result = propagate("ARAMCO", 0.8);
    const sec = result.affectedNodes.find((n) => n.nodeId === "SEC");
    expect(sec).toBeDefined();
    expect(sec!.impactScore).toBeGreaterThan(0);
  });

  test("utilities-desalination linkage: DEWA affects DESAL_GCC", () => {
    const result = propagate("DEWA", 0.8);
    const desal = result.affectedNodes.find((n) => n.nodeId === "DESAL_GCC");
    expect(desal).toBeDefined();
    expect(desal!.impactScore).toBeGreaterThan(0);
  });

  test("port-food linkage: Jebel Ali affects food imports", () => {
    const result = propagate("JEBEL_ALI", 0.85);
    const food = result.affectedNodes.find((n) => n.nodeId === "FOOD_IMPORT_GCC");
    expect(food).toBeDefined();
    expect(food!.impactScore).toBeGreaterThan(0);
  });

  test("central bank-finance linkage: SAMA affects Tadawul", () => {
    const result = propagate("SAMA", 0.7);
    const tadawul = result.affectedNodes.find((n) => n.nodeId === "TADAWUL");
    expect(tadawul).toBeDefined();
    expect(tadawul!.impactScore).toBeGreaterThan(0);
  });
});

/* ── F. All 8 Mandatory Scenarios ── */

describe("Mandatory Scenarios", () => {
  test("all 8 scenarios are defined", () => {
    expect(ALL_SCENARIOS.length).toBe(8);
  });

  for (const scenario of ALL_SCENARIOS) {
    describe(`Scenario: ${scenario.id}`, () => {
      test("has signals", () => {
        expect(scenario.signals.length).toBeGreaterThan(0);
      });

      test("has narrative events", () => {
        expect(scenario.narrativeEvents.length).toBeGreaterThan(0);
      });

      test("all signal nodes exist in graph", () => {
        for (const signal of scenario.signals) {
          expect(NODE_MAP.has(signal.nodeId)).toBe(true);
        }
      });

      test("propagation produces results", () => {
        const signalInputs = scenario.signals.map((s) => ({
          nodeId: s.nodeId,
          score: s.score,
          hoursElapsed: s.hoursElapsed,
        }));
        const result = propagateMultiSignal(signalInputs);
        expect(result.affectedNodes.length).toBeGreaterThan(0);
        expect(result.sectorAggregation.length).toBeGreaterThan(0);
        expect(result.explanation.summary).toBeTruthy();
        expect(result.explanation.confidence).toBeGreaterThan(0);
      });
    });
  }
});

/* ── G. Full Demo Scenario Run ── */

describe("Full Demo Scenario Run", () => {
  test("runDemoScenario produces complete output", () => {
    const result = runDemoScenario(GULF_AIRSPACE_DISRUPTION);
    expect(result.runId).toBeTruthy();
    expect(result.runId).toMatch(/^VIVO-/);
    expect(result.totalLoss).toBeGreaterThan(0);
    expect(result.affectedSectors.length).toBeGreaterThan(0);
    expect(result.topDrivers.length).toBeGreaterThan(0);
    expect(result.propagationChain.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.explanation).toBeTruthy();
    expect(result.frames.length).toBeGreaterThan(0);
  });
});
