"""Phase 2D simulation service — branch-aware, uncertainty-aware, intervention-aware.

Pipeline position: Step 5
Input:  SimulationRunRequest (enriched graph + signals + agents + strategy)
Output: SimulationRunResponseV2 with branching envelope, uncertainty, intervention analysis

x -> S -> Σ -> G -> G* -> {Z_b}_{b∈B} -> D -> B -> Q
"""
from __future__ import annotations

import logging
from typing import Any, Optional

from app.config.math_constants import MathConstants
from app.engines.airport_engine import AirportEngine, AirportRiskInput
from app.engines.branching_engine import BranchingEngine
from app.engines.confidence_engine import ConfidenceEngine, ConfidenceInput
from app.engines.intervention_engine import InterventionEngine
from app.engines.market_engine import MarketEngine, MarketStressInput
from app.engines.propagation_engine_v2 import HardenedPropagationConfig, HardenedPropagationEngine
from app.engines.risk_engine import RiskEngine
from app.engines.sector_engine import SectorEngine, SectorImpactInput
from app.engines.uncertainty_engine import UncertaintyEngine
from app.schemas.branching import BranchEnvelope, BranchOutcomeSummary, ScenarioBranch
from app.schemas.common import Assumption, PhaseLabel
from app.schemas.intervention import InterventionOption, InterventionSet, InterventionTarget
from app.schemas.propagation import NodeTrajectory, PropagationEnergySeries, PropagationState
from app.schemas.simulation import (
    AirportState,
    MarketState,
    SectorState,
    SimulationPhase,
    SimulationRunRequest,
    SimulationRunResponse,
)
from app.schemas.uncertainty import UncertaintyEnvelope

logger = logging.getLogger(__name__)


class SimulationServiceV2:
    """Phase 2D hardened simulation service.

    Runs multi-branch simulation with:
    - Hardened propagation (damping, logistic response, perturbation)
    - Scenario branching (baseline, amplification, containment, adverse)
    - Uncertainty envelope (per-stage + composite)
    - Intervention analysis (ranked options with efficiency scores)

    Backward-compatible: the original SimulationRunResponse is still produced
    as the baseline branch output.
    """

    def __init__(self, mc: MathConstants | None = None) -> None:
        self.mc = mc or MathConstants()
        self.propagation = HardenedPropagationEngine(self.mc)
        self.branching = BranchingEngine(self.mc)
        self.uncertainty_engine = UncertaintyEngine(self.mc)
        self.intervention_engine = InterventionEngine(self.mc)
        self.airport_engine = AirportEngine()
        self.market_engine = MarketEngine()
        self.sector_engine = SectorEngine()
        self.risk_engine = RiskEngine()
        self.confidence_engine = ConfidenceEngine()

        self.phase_configs = [
            {"phase": PhaseLabel.T0, "label": "Trigger", "time_decay": 1.00, "constraint_multiplier": 1.10},
            {"phase": PhaseLabel.T1, "label": "Operational disruption", "time_decay": 0.95, "constraint_multiplier": 1.12},
            {"phase": PhaseLabel.T2, "label": "Amplification", "time_decay": 0.92, "constraint_multiplier": 1.08},
            {"phase": PhaseLabel.T3, "label": "Sector spillover", "time_decay": 0.88, "constraint_multiplier": 1.05},
            {"phase": PhaseLabel.T4, "label": "Policy response", "time_decay": 0.82, "constraint_multiplier": 0.96},
            {"phase": PhaseLabel.T5, "label": "Stabilization", "time_decay": 0.76, "constraint_multiplier": 0.90},
        ]

        self.channel_boosts = {
            "aviation": 1.20, "media": 1.10, "market": 1.05,
            "logistics": 1.08, "policy": 0.95, "default": 1.00,
        }
        self.emotion_boosts = {
            "panic": 1.20, "fear": 1.12, "concern": 1.05,
            "stable": 1.00, "reassured": 0.92, "default": 1.00,
        }

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    # ── Node state initialization (same as v1) ──────────────────────

    def _build_initial_node_states(self, payload: SimulationRunRequest) -> dict[str, float]:
        if payload.agent_profiles:
            states: dict[str, float] = {}
            for agent in payload.agent_profiles:
                influence = float(agent.get("influence_score", 0.4))
                propagation = float(agent.get("propagation_score", 0.4))
                stance = str(agent.get("stance", "neutral")).lower()
                stance_boost = {"negative": 1.08, "uncertain": 1.03, "neutral": 1.00, "positive": 0.95}.get(stance, 1.00)
                states[str(agent["id"])] = self._clamp((0.55 * influence + 0.45 * propagation) * stance_boost)
            return states
        return {str(node["id"]): 0.15 for node in payload.nodes}

    def _transform_edges(self, payload: SimulationRunRequest) -> list[dict[str, Any]]:
        transformed: list[dict[str, Any]] = []
        for edge in payload.edges:
            edge_type = str(edge.get("type", "default")).lower()
            channel = "default"
            if "route" in edge_type or "operate" in edge_type or "aviation" in edge_type:
                channel = "aviation"
            elif "media" in edge_type or "amplif" in edge_type or "influ" in edge_type:
                channel = "media"
            elif "supply" in edge_type or "logistics" in edge_type:
                channel = "logistics"
            elif "regulat" in edge_type or "policy" in edge_type:
                channel = "policy"
            elif "settle" in edge_type or "market" in edge_type:
                channel = "market"
            transformed.append({
                "source": edge["source"], "target": edge["target"],
                "weight": float(edge.get("weight", 0.3)),
                "channel": channel, "emotion": "concern",
                "type": str(edge.get("type", "")),
            })
        return transformed

    def _derive_stabilization_effects(self, phase_index: int, strategy: str, node_states: dict[str, float]) -> dict[str, float]:
        base = {"transparent": 0.05, "delayed": 0.01, "defensive": 0.03, "silent": 0.00, "phased": 0.04}.get(strategy, 0.03)
        phase_boost = phase_index * 0.01
        stabilization = min(0.15, base + phase_boost)
        return {nid: stabilization for nid in node_states}

    # ── Domain-specific stress computation (reused from v1) ─────────

    def _compute_airport_states(self, node_states: dict[str, float], payload: SimulationRunRequest) -> list[AirportState]:
        airport_nodes = [n for n in payload.nodes if str(n.get("type", "")).lower() == "airport"]
        results: list[AirportState] = []
        for airport in airport_nodes:
            nid = str(airport["id"])
            act = float(node_states.get(nid, 0.20))
            ar, rs, cr, cdr, pcr = (
                self._clamp(act * 1.10), self._clamp(act * 0.95), self._clamp(act * 0.70),
                self._clamp(act * 0.82), self._clamp(act * 0.60),
            )
            composite = self.airport_engine.score_airport(AirportRiskInput(
                airspace_risk=ar, reroute_severity=rs, cancellation_risk=cr,
                cargo_delay_risk=cdr, passenger_confidence_risk=pcr,
            ))
            results.append(AirportState(
                airport_code=nid, airspace_risk=ar, reroute_severity=rs,
                cancellation_risk=cr, cargo_delay_risk=cdr,
                passenger_confidence_risk=pcr, composite_risk=composite,
            ))
        return results

    def _compute_market_state(self, payload: SimulationRunRequest, node_states: dict[str, float]) -> MarketState:
        sev = float(payload.normalized_scenario.get("trigger", {}).get("severity", 0.5))
        avg = sum(node_states.values()) / max(1, len(node_states))
        oil = self._clamp(0.55 * sev + 0.25 * avg)
        gold = self._clamp(0.40 * sev + 0.20 * avg)
        fx = self._clamp(0.30 * sev + 0.20 * avg)
        crypto = self._clamp(0.18 * sev + 0.12 * avg)
        ship = self._clamp(0.35 * sev + 0.25 * avg)
        composite = self.market_engine.score_market(MarketStressInput(
            oil_stress=oil, gold_stress=gold, fx_stress=fx,
            crypto_stress=crypto, shipping_stress=ship,
        ))
        return MarketState(oil_stress=oil, gold_stress=gold, fx_stress=fx,
                           crypto_stress=crypto, shipping_stress=ship,
                           composite_market_stress=composite)

    def _compute_sector_states(self, airports: list[AirportState], market: MarketState) -> list[SectorState]:
        avg_ap = sum(a.composite_risk for a in airports) / len(airports) if airports else 0.0
        configs = {
            "logistics": (0.50 * avg_ap + 0.20 * market.shipping_stress, [avg_ap, market.shipping_stress], [0.55, 0.35]),
            "tourism": (0.48 * avg_ap + 0.15 * market.composite_market_stress, [avg_ap, market.composite_market_stress], [0.50, 0.25]),
            "ecommerce": (0.30 * avg_ap + 0.35 * market.shipping_stress, [avg_ap, market.shipping_stress], [0.30, 0.45]),
            "banking": (0.10 * avg_ap + 0.40 * market.fx_stress, [avg_ap, market.fx_stress], [0.10, 0.50]),
        }
        results: list[SectorState] = []
        for name, (direct, ups, wts) in configs.items():
            composite = self.sector_engine.compute_sector_impact(SectorImpactInput(
                direct_impact=self._clamp(direct),
                upstream_impacts=[self._clamp(v) for v in ups],
                dependency_weights=wts,
            ))
            indirect = self._clamp(self.sector_engine.compute_spillover(
                upstream_impacts=[self._clamp(v) for v in ups], dependency_weights=wts,
            ))
            results.append(SectorState(sector=name, direct_impact=self._clamp(direct),
                                       indirect_impact=indirect, composite_impact=composite))
        return results

    def _compute_phase_metrics(self, airports: list[AirportState], market: MarketState,
                                sectors: list[SectorState], node_states: dict[str, float]) -> dict[str, float]:
        avg_ap = sum(a.composite_risk for a in airports) / len(airports) if airports else 0.0
        avg_sec = sum(s.composite_impact for s in sectors) / len(sectors) if sectors else 0.0
        avg_node = sum(node_states.values()) / max(1, len(node_states))
        shipping = self._clamp(market.shipping_stress)
        banking = self._clamp(next((s.composite_impact for s in sectors if s.sector == "banking"), 0.10))
        media = self._clamp(avg_node * 0.92)
        public = self._clamp(avg_node * 0.80)
        energy = self._clamp(market.oil_stress)
        logistics = self._clamp(next((s.composite_impact for s in sectors if s.sector == "logistics"), avg_sec))
        policy = self._clamp(0.35 * avg_ap + 0.25 * market.composite_market_stress)
        total = self.risk_engine.score(
            airport=avg_ap, shipping=shipping, banking=banking, media=media,
            public=public, energy=energy, market=market.composite_market_stress,
            logistics=logistics, policy=policy,
        )
        return {"airport_stress": avg_ap, "shipping_stress": shipping, "banking_stress": banking,
                "media_stress": media, "public_stress": public, "energy_stress": energy,
                "market_stress": market.composite_market_stress, "logistics_stress": logistics,
                "policy_stress": policy, "total_risk": total}

    # ── Single-branch simulation run ─────────────────────────────────

    def _run_single_branch(
        self,
        payload: SimulationRunRequest,
        initial_states: dict[str, float],
        edges: list[dict[str, Any]],
        prop_config: HardenedPropagationConfig,
        intervention_effects: dict[str, float] | None = None,
    ) -> tuple[list[SimulationPhase], list[AirportState], list[SectorState], MarketState | None, PropagationState]:
        """Execute one complete simulation run (6 phases) and return results + propagation state."""
        node_states = dict(initial_states)
        phases: list[SimulationPhase] = []
        trajectories: dict[str, list[float]] = {nid: [val] for nid, val in node_states.items()}
        energy_series: list[float] = [self.propagation.compute_energy(node_states)]
        latest_airports: list[AirportState] = []
        latest_sectors: list[SectorState] = []
        latest_market: MarketState | None = None

        for phase_idx, phase_cfg in enumerate(self.phase_configs):
            stab = self._derive_stabilization_effects(phase_idx, str(payload.strategy), node_states)

            # Apply timing decay to intervention effects
            timed_interventions: dict[str, float] | None = None
            if intervention_effects:
                # Decay intervention effectiveness over time
                decay = max(0.0, 1.0 - phase_idx * self.mc.intervention.timing_decay_per_phase)
                timed_interventions = {nid: eff * decay for nid, eff in intervention_effects.items()}

            node_states = self.propagation.propagate_phase(
                node_states=node_states, edges=edges,
                channel_boosts=self.channel_boosts, emotion_boosts=self.emotion_boosts,
                time_decay=phase_cfg["time_decay"], constraint_multiplier=phase_cfg["constraint_multiplier"],
                stabilization_effects=stab, intervention_effects=timed_interventions,
                config=prop_config,
            )

            # Record trajectories
            for nid, val in node_states.items():
                trajectories.setdefault(nid, []).append(val)
            energy_series.append(self.propagation.compute_energy(node_states))

            latest_market = self._compute_market_state(payload, node_states)
            latest_airports = self._compute_airport_states(node_states, payload)
            latest_sectors = self._compute_sector_states(latest_airports, latest_market)
            metrics = self._compute_phase_metrics(latest_airports, latest_market, latest_sectors, node_states)

            events = [f"Phase {phase_cfg['phase']} simulation executed"]
            if metrics["airport_stress"] > 0.60:
                events.append("Airport stress elevated")
            if metrics["market_stress"] > 0.55:
                events.append("Market stress regime elevated")

            phases.append(SimulationPhase(
                phase=phase_cfg["phase"], label=phase_cfg["label"],
                airport_stress=metrics["airport_stress"], shipping_stress=metrics["shipping_stress"],
                banking_stress=metrics["banking_stress"], media_stress=metrics["media_stress"],
                public_stress=metrics["public_stress"], energy_stress=metrics["energy_stress"],
                market_stress=metrics["market_stress"], logistics_stress=metrics["logistics_stress"],
                policy_stress=metrics["policy_stress"], total_risk_score=metrics["total_risk"],
                key_events=events,
            ))

        # Build propagation state
        peak_energy = max(energy_series)
        peak_phase = energy_series.index(peak_energy)
        stability = self.propagation.compute_stability_score(energy_series)
        escalation_zones = self.propagation.detect_escalation_zones(trajectories)

        node_trajs = []
        for nid, acts in trajectories.items():
            pk = max(acts)
            pk_idx = acts.index(pk)
            is_esc = nid in escalation_zones
            node_trajs.append(NodeTrajectory(
                node_id=nid, activations=acts, peak_activation=pk,
                peak_phase=pk_idx, is_escalation_zone=is_esc,
            ))

        avg_peak = sum(nt.peak_activation for nt in node_trajs) / max(1, len(node_trajs))

        prop_state = PropagationState(
            node_trajectories=node_trajs,
            energy_series=PropagationEnergySeries(
                energy_values=energy_series, peak_energy=peak_energy,
                peak_phase=peak_phase, stability_score=stability,
                final_energy=energy_series[-1],
            ),
            escalation_zone_count=len(escalation_zones),
            avg_peak_activation=self._clamp(avg_peak),
            damping_applied=prop_config.damping,
            noise_scale_applied=prop_config.noise_scale,
        )

        return phases, latest_airports, latest_sectors, latest_market, prop_state

    # ── Main entry point ─────────────────────────────────────────────

    def run(self, payload: SimulationRunRequest) -> SimulationRunResponse:
        """Backward-compatible run — returns standard SimulationRunResponse (baseline branch only)."""
        initial_states = self._build_initial_node_states(payload)
        edges = self._transform_edges(payload)
        base_config = HardenedPropagationConfig(
            damping=self.mc.propagation.damping_default,
            baseline_susceptibility=self.mc.propagation.baseline_susceptibility,
            noise_scale=0.0,  # deterministic for backward compat
            logistic_steepness=self.mc.propagation.logistic_steepness,
            logistic_midpoint=self.mc.propagation.logistic_midpoint,
            seed=42,
        )

        phases, airports, sectors, market, _ = self._run_single_branch(
            payload, initial_states, edges, base_config,
        )

        spread_velocity = self._compute_spread_velocity(phases)
        critical_window = self._compute_critical_window(phases)
        confidence = self.confidence_engine.compute(ConfidenceInput(
            source_reliability=0.82,
            data_coverage=0.72 if payload.signals else 0.58,
            model_consistency=0.78,
            uncertainty_penalty=0.20 if payload.signals else 0.28,
        ))

        return SimulationRunResponse(
            scenario_id=payload.scenario_id, phases=phases,
            airport_states=airports, sector_states=sectors,
            market_state=market, spread_velocity=spread_velocity,
            critical_window=critical_window, confidence=confidence,
        )

    def run_branched(
        self,
        payload: SimulationRunRequest,
    ) -> dict[str, Any]:
        """Phase 2D full run — returns branched simulation with uncertainty + interventions.

        Returns a dict containing:
        - baseline_response: SimulationRunResponse (backward-compat)
        - branch_envelope: BranchEnvelope
        - propagation_state: PropagationState (baseline branch)
        - uncertainty_envelope: UncertaintyEnvelope
        - intervention_set: InterventionSet
        """
        initial_states = self._build_initial_node_states(payload)
        edges = self._transform_edges(payload)

        base_config = HardenedPropagationConfig(
            damping=self.mc.propagation.damping_default,
            baseline_susceptibility=self.mc.propagation.baseline_susceptibility,
            noise_scale=self.mc.propagation.noise_scale,
            logistic_steepness=self.mc.propagation.logistic_steepness,
            logistic_midpoint=self.mc.propagation.logistic_midpoint,
            seed=42,
        )

        # ── Build scenario context for branching ────────────────────
        scenario_context = {
            "trigger_severity": float(payload.normalized_scenario.get("trigger", {}).get("severity", 0.5)),
            "media_signal_count": sum(1 for s in payload.signals if str(s.get("category", "")).lower() == "media"),
            "constraint_count": len(payload.normalized_scenario.get("constraints", [])),
            "has_policy_response": any(
                str(s.get("category", "")).lower() == "policy" for s in payload.signals
            ),
        }

        # ── Generate branches ───────────────────────────────────────
        branch_configs = self.branching.generate_branch_configs(scenario_context)

        branches: list[ScenarioBranch] = []
        baseline_response: SimulationRunResponse | None = None
        baseline_prop_state: PropagationState | None = None
        branch_peak_risks: list[float] = []
        branch_probabilities: list[float] = []

        for idx, bc in enumerate(branch_configs):
            prop_cfg = self.branching.make_propagation_config(bc, base_config, seed_offset=idx * 100)
            branch_edges = self.branching.modify_edges(edges, bc.edge_weight_multiplier)

            phases, airports, sectors, market, prop_state = self._run_single_branch(
                payload, initial_states, branch_edges, prop_cfg,
            )

            risk_trajectory = [p.total_risk_score for p in phases]
            peak_risk = max(risk_trajectory) if risk_trajectory else 0.0
            final_risk = risk_trajectory[-1] if risk_trajectory else 0.0
            spread_vel = self._compute_spread_velocity(phases)
            crit_window = self._compute_critical_window(phases)

            # Find stabilization phase
            stab_phase = None
            for i in range(1, len(risk_trajectory)):
                if risk_trajectory[i] < risk_trajectory[i - 1] - 0.01:
                    stab_phase = str(self.phase_configs[i]["phase"])
                    break

            outcome = BranchOutcomeSummary(
                peak_risk_score=peak_risk, final_risk_score=final_risk,
                peak_energy=prop_state.energy_series.peak_energy,
                spread_velocity=spread_vel, critical_window=crit_window,
                stabilization_phase=stab_phase,
            )

            branches.append(ScenarioBranch(
                branch_id=bc.branch_id, branch_label=bc.branch_label,
                branch_probability=bc.branch_probability,
                branch_trigger=bc.branch_trigger,
                assumptions=[Assumption(text=f"Branch assumes: {bc.branch_trigger}")],
                phase_risk_trajectory=risk_trajectory,
                outcome=outcome,
            ))

            branch_peak_risks.append(peak_risk)
            branch_probabilities.append(bc.branch_probability)

            # Baseline branch also serves as the backward-compat response
            if bc.branch_label == "baseline":
                confidence = self.confidence_engine.compute(ConfidenceInput(
                    source_reliability=0.82,
                    data_coverage=0.72 if payload.signals else 0.58,
                    model_consistency=0.78,
                    uncertainty_penalty=0.20 if payload.signals else 0.28,
                ))
                baseline_response = SimulationRunResponse(
                    scenario_id=payload.scenario_id, phases=phases,
                    airport_states=airports, sector_states=sectors,
                    market_state=market, spread_velocity=spread_vel,
                    critical_window=crit_window, confidence=confidence,
                )
                baseline_prop_state = prop_state

        # ── Branch envelope ─────────────────────────────────────────
        expected_peak = self.branching.compute_expected_outcome(branch_probabilities, branch_peak_risks)
        worst_peak = max(branch_peak_risks) if branch_peak_risks else 0.0
        best_peak = min(branch_peak_risks) if branch_peak_risks else 0.0
        branch_ent = self.branching.compute_branch_entropy(branch_probabilities)

        branch_envelope = BranchEnvelope(
            scenario_id=payload.scenario_id,
            branches=branches,
            expected_peak_risk=self._clamp(expected_peak),
            worst_case_peak_risk=self._clamp(worst_peak),
            best_case_peak_risk=self._clamp(best_peak),
            branch_entropy=branch_ent,
            confidence=self._clamp(1.0 - branch_ent / 1.5),  # Higher entropy → lower confidence
        )

        # ── Uncertainty envelope ────────────────────────────────────
        # Collect signal confidences from payload
        signal_confs = [float(s.get("confidence", 0.5)) for s in payload.signals] if payload.signals else []
        edge_confs = [float(e.get("weight", 0.5)) for e in edges]  # Use weight as proxy for confidence

        stage_uncertainties = [
            self.uncertainty_engine.normalization_uncertainty([0.6, 0.75]),  # From scenario service defaults
            self.uncertainty_engine.signal_uncertainty(signal_confs),
            self.uncertainty_engine.graph_uncertainty(edge_confs),
        ]

        # Simulation variance from Monte Carlo-lite (use branch peak risks as proxy)
        sim_var = self.uncertainty_engine.simulation_variance(branch_peak_risks)

        uncertainty_envelope = self.uncertainty_engine.build_envelope(
            stage_uncertainties=stage_uncertainties,
            branch_entropy_val=branch_ent,
            sim_variance=sim_var,
            decision_uncertainty_val=0.0,  # Filled by decision service
        )

        # ── Intervention analysis ───────────────────────────────────
        baseline_peak = baseline_prop_state.energy_series.peak_energy if baseline_prop_state else 0.0
        intervention_defs = self.intervention_engine.get_available_interventions()

        # Build edge type map per node
        edge_types_by_node: dict[str, list[str]] = {}
        for e in edges:
            target = e["target"]
            edge_types_by_node.setdefault(target, []).append(str(e.get("type", "")))

        node_ids = list(initial_states.keys())
        scored_interventions: list[InterventionOption] = []

        for intv_def in intervention_defs:
            # Compute node effects
            node_effects = self.intervention_engine.compute_node_effects(
                intv_def, node_ids, edge_types_by_node,
            )
            # Modify edges
            modified_edges = self.intervention_engine.compute_edge_weight_modifiers(intv_def, edges)

            # Run intervened simulation (baseline branch only)
            _, _, _, _, intv_prop = self._run_single_branch(
                payload, initial_states, modified_edges, base_config,
                intervention_effects=node_effects,
            )

            intv_peak = intv_prop.energy_series.peak_energy
            peak_reduction = max(0.0, baseline_peak - intv_peak)
            efficiency = self.intervention_engine.compute_efficiency(peak_reduction, intv_def.estimated_cost)
            timing_eff = self.intervention_engine.compute_timing_decay(intv_def, intv_def.timing_phase)

            # Compute delay loss (what happens if we apply 1 phase late)
            delay_loss = None
            if intv_def.timing_phase < len(self.phase_configs) - 1:
                delayed_effects = {nid: eff * 0.85 for nid, eff in node_effects.items()}
                _, _, _, _, delayed_prop = self._run_single_branch(
                    payload, initial_states, modified_edges, base_config,
                    intervention_effects=delayed_effects,
                )
                delay_loss = max(0.0, delayed_prop.energy_series.peak_energy - intv_peak)

            targets = []
            if intv_def.target_node_ids:
                targets.append(InterventionTarget(
                    target_node_ids=intv_def.target_node_ids, target_edge_types=[],
                    effect_type=intv_def.effect_type, magnitude=intv_def.magnitude,
                ))
            if intv_def.target_edge_types:
                targets.append(InterventionTarget(
                    target_node_ids=[], target_edge_types=intv_def.target_edge_types,
                    effect_type=intv_def.effect_type, magnitude=intv_def.magnitude,
                ))

            scored_interventions.append(InterventionOption(
                intervention_id=intv_def.intervention_id,
                label=intv_def.label,
                description=intv_def.description,
                targets=targets,
                timing_phase=intv_def.timing_phase,
                timing_window=f"T{intv_def.timing_phase}-T{min(intv_def.timing_phase + 1, 5)}",
                estimated_cost=intv_def.estimated_cost,
                baseline_peak_energy=baseline_peak,
                intervened_peak_energy=intv_peak,
                peak_reduction=round(peak_reduction, 4),
                efficiency_score=round(efficiency, 4),
                delay_loss=round(delay_loss, 4) if delay_loss is not None else None,
                confidence=self._clamp(timing_eff * 0.85),
            ))

        # Rank by efficiency
        scored_interventions.sort(key=lambda x: x.efficiency_score, reverse=True)
        best_id = scored_interventions[0].intervention_id if scored_interventions else None

        intervention_set = InterventionSet(
            scenario_id=payload.scenario_id,
            baseline_peak_energy=baseline_peak,
            interventions=scored_interventions,
            best_intervention_id=best_id,
            combined_reduction_potential=sum(i.peak_reduction for i in scored_interventions[:3]) * 0.6,
        )

        return {
            "baseline_response": baseline_response,
            "branch_envelope": branch_envelope,
            "propagation_state": baseline_prop_state,
            "uncertainty_envelope": uncertainty_envelope,
            "intervention_set": intervention_set,
        }

    # ── Helpers (from v1) ───────────────────────────────────────────

    def _compute_spread_velocity(self, phases: list[SimulationPhase]) -> float:
        if not phases:
            return 0.0
        avg = sum(p.total_risk_score for p in phases) / len(phases)
        mx = max(p.total_risk_score for p in phases)
        return self._clamp(0.5 * avg + 0.5 * mx)

    def _compute_critical_window(self, phases: list[SimulationPhase]) -> str:
        if len(phases) < 2:
            return phases[0].phase if phases else "T0"
        max_delta = -1.0
        critical = f"{phases[0].phase}-{phases[1].phase}"
        for i in range(len(phases) - 1):
            delta = phases[i + 1].total_risk_score - phases[i].total_risk_score
            if delta > max_delta:
                max_delta = delta
                critical = f"{phases[i].phase}-{phases[i + 1].phase}"
        return critical
