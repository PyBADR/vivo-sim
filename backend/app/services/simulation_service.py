from __future__ import annotations

from collections import defaultdict
from typing import Any

from app.engines.airport_engine import AirportEngine, AirportRiskInput
from app.engines.confidence_engine import ConfidenceEngine, ConfidenceInput
from app.engines.market_engine import MarketEngine, MarketStressInput
from app.engines.propagation_engine import PropagationEngine
from app.engines.risk_engine import RiskEngine
from app.engines.sector_engine import SectorEngine, SectorImpactInput
from app.schemas.common import PhaseLabel
from app.schemas.simulation import (
    AirportState,
    MarketState,
    SectorState,
    SimulationPhase,
    SimulationRunRequest,
    SimulationRunResponse,
)


class SimulationService:
    """
    Runs the phase-based simulation using deterministic engines.

    Current design:
    - initializes node activations from agent profiles
    - propagates through graph phases
    - computes airport stress, sector impacts, market stress
    - computes total risk per phase
    - computes confidence
    """

    def __init__(self) -> None:
        self.propagation_engine = PropagationEngine()
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
            "aviation": 1.20,
            "media": 1.10,
            "market": 1.05,
            "logistics": 1.08,
            "policy": 0.95,
            "default": 1.00,
        }

        self.emotion_boosts = {
            "panic": 1.20,
            "fear": 1.12,
            "concern": 1.05,
            "stable": 1.00,
            "reassured": 0.92,
            "default": 1.00,
        }

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def _build_initial_node_states(self, payload: SimulationRunRequest) -> dict[str, float]:
        if payload.agent_profiles:
            states: dict[str, float] = {}
            for agent in payload.agent_profiles:
                influence = float(agent.get("influence_score", 0.4))
                propagation = float(agent.get("propagation_score", 0.4))
                stance = str(agent.get("stance", "neutral")).lower()

                stance_boost = {
                    "negative": 1.08,
                    "uncertain": 1.03,
                    "neutral": 1.00,
                    "positive": 0.95,
                }.get(stance, 1.00)

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

            transformed.append(
                {
                    "source": edge["source"],
                    "target": edge["target"],
                    "weight": float(edge.get("weight", 0.3)),
                    "channel": channel,
                    "emotion": "concern",
                }
            )

        return transformed

    def _derive_stabilization_effects(self, phase_index: int, strategy: str, node_states: dict[str, float]) -> dict[str, float]:
        base = {
            "transparent": 0.05,
            "delayed": 0.01,
            "defensive": 0.03,
            "silent": 0.00,
            "phased": 0.04,
        }.get(strategy, 0.03)

        phase_boost = phase_index * 0.01
        stabilization = min(0.15, base + phase_boost)

        return {node_id: stabilization for node_id in node_states.keys()}

    def _compute_airport_states(self, node_states: dict[str, float], payload: SimulationRunRequest) -> list[AirportState]:
        airport_states: list[AirportState] = []

        airport_nodes = [n for n in payload.nodes if str(n.get("type", "")).lower() == "airport"]

        if not airport_nodes:
            return airport_states

        for airport in airport_nodes:
            node_id = str(airport["id"])
            activation = float(node_states.get(node_id, 0.20))

            airspace_risk = self._clamp(activation * 1.10)
            reroute_severity = self._clamp(activation * 0.95)
            cancellation_risk = self._clamp(activation * 0.70)
            cargo_delay_risk = self._clamp(activation * 0.82)
            passenger_confidence_risk = self._clamp(activation * 0.60)

            composite = self.airport_engine.score_airport(
                AirportRiskInput(
                    airspace_risk=airspace_risk,
                    reroute_severity=reroute_severity,
                    cancellation_risk=cancellation_risk,
                    cargo_delay_risk=cargo_delay_risk,
                    passenger_confidence_risk=passenger_confidence_risk,
                )
            )

            airport_states.append(
                AirportState(
                    airport_code=node_id,
                    airspace_risk=airspace_risk,
                    reroute_severity=reroute_severity,
                    cancellation_risk=cancellation_risk,
                    cargo_delay_risk=cargo_delay_risk,
                    passenger_confidence_risk=passenger_confidence_risk,
                    composite_risk=composite,
                )
            )

        return airport_states

    def _compute_sector_states(
        self,
        airport_states: list[AirportState],
        market_state: MarketState,
    ) -> list[SectorState]:
        avg_airport = (
            sum(a.composite_risk for a in airport_states) / len(airport_states)
            if airport_states
            else 0.0
        )

        sectors_config = {
            "logistics": (0.50 * avg_airport + 0.20 * market_state.shipping_stress, [avg_airport, market_state.shipping_stress], [0.55, 0.35]),
            "tourism": (0.48 * avg_airport + 0.15 * market_state.composite_market_stress, [avg_airport, market_state.composite_market_stress], [0.50, 0.25]),
            "ecommerce": (0.30 * avg_airport + 0.35 * market_state.shipping_stress, [avg_airport, market_state.shipping_stress], [0.30, 0.45]),
            "banking": (0.10 * avg_airport + 0.40 * market_state.fx_stress, [avg_airport, market_state.fx_stress], [0.10, 0.50]),
        }

        sector_states: list[SectorState] = []

        for sector_name, (direct_impact, upstreams, weights) in sectors_config.items():
            composite = self.sector_engine.compute_sector_impact(
                SectorImpactInput(
                    direct_impact=self._clamp(direct_impact),
                    upstream_impacts=[self._clamp(v) for v in upstreams],
                    dependency_weights=weights,
                )
            )

            spillover = self.sector_engine.compute_spillover(
                upstream_impacts=[self._clamp(v) for v in upstreams],
                dependency_weights=weights,
            )

            indirect = self._clamp(spillover)

            sector_states.append(
                SectorState(
                    sector=sector_name,
                    direct_impact=self._clamp(direct_impact),
                    indirect_impact=indirect,
                    composite_impact=composite,
                )
            )

        return sector_states

    def _compute_market_state(self, payload: SimulationRunRequest, node_states: dict[str, float]) -> MarketState:
        trigger_severity = float(payload.normalized_scenario.get("trigger", {}).get("severity", 0.5))
        avg_activation = sum(node_states.values()) / max(1, len(node_states))

        oil_stress = self._clamp(0.55 * trigger_severity + 0.25 * avg_activation)
        gold_stress = self._clamp(0.40 * trigger_severity + 0.20 * avg_activation)
        fx_stress = self._clamp(0.30 * trigger_severity + 0.20 * avg_activation)
        crypto_stress = self._clamp(0.18 * trigger_severity + 0.12 * avg_activation)
        shipping_stress = self._clamp(0.35 * trigger_severity + 0.25 * avg_activation)

        composite = self.market_engine.score_market(
            MarketStressInput(
                oil_stress=oil_stress,
                gold_stress=gold_stress,
                fx_stress=fx_stress,
                crypto_stress=crypto_stress,
                shipping_stress=shipping_stress,
            )
        )

        return MarketState(
            oil_stress=oil_stress,
            gold_stress=gold_stress,
            fx_stress=fx_stress,
            crypto_stress=crypto_stress,
            shipping_stress=shipping_stress,
            composite_market_stress=composite,
        )

    def _compute_phase_metrics(
        self,
        airport_states: list[AirportState],
        market_state: MarketState,
        sector_states: list[SectorState],
        node_states: dict[str, float],
    ) -> dict[str, float]:
        avg_airport = (
            sum(a.composite_risk for a in airport_states) / len(airport_states)
            if airport_states
            else 0.0
        )
        avg_sector = (
            sum(s.composite_impact for s in sector_states) / len(sector_states)
            if sector_states
            else 0.0
        )
        avg_node = sum(node_states.values()) / max(1, len(node_states))

        shipping_stress = self._clamp(market_state.shipping_stress)
        banking_stress = self._clamp(next((s.composite_impact for s in sector_states if s.sector == "banking"), 0.10))
        media_stress = self._clamp(avg_node * 0.92)
        public_stress = self._clamp(avg_node * 0.80)
        energy_stress = self._clamp(market_state.oil_stress)
        logistics_stress = self._clamp(next((s.composite_impact for s in sector_states if s.sector == "logistics"), avg_sector))
        policy_stress = self._clamp(0.35 * avg_airport + 0.25 * market_state.composite_market_stress)

        total_risk = self.risk_engine.score(
            airport=avg_airport,
            shipping=shipping_stress,
            banking=banking_stress,
            media=media_stress,
            public=public_stress,
            energy=energy_stress,
            market=market_state.composite_market_stress,
            logistics=logistics_stress,
            policy=policy_stress,
        )

        return {
            "airport_stress": avg_airport,
            "shipping_stress": shipping_stress,
            "banking_stress": banking_stress,
            "media_stress": media_stress,
            "public_stress": public_stress,
            "energy_stress": energy_stress,
            "market_stress": market_state.composite_market_stress,
            "logistics_stress": logistics_stress,
            "policy_stress": policy_stress,
            "total_risk": total_risk,
        }

    def _build_key_events(
        self,
        phase_label: str,
        metrics: dict[str, float],
        airport_states: list[AirportState],
    ) -> list[str]:
        events = [f"Phase {phase_label} simulation executed"]

        if metrics["airport_stress"] > 0.60:
            top_airport = max(airport_states, key=lambda a: a.composite_risk, default=None)
            if top_airport:
                events.append(f"Airport stress elevated at {top_airport.airport_code}")

        if metrics["market_stress"] > 0.55:
            events.append("Market stress regime elevated")

        if metrics["logistics_stress"] > 0.55:
            events.append("Logistics spillover accelerating")

        if metrics["policy_stress"] > 0.50:
            events.append("Policy response pressure increasing")

        return events

    def _compute_spread_velocity(self, phases: list[SimulationPhase]) -> float:
        if not phases:
            return 0.0
        avg_risk = sum(p.total_risk_score for p in phases) / len(phases)
        max_risk = max(p.total_risk_score for p in phases)
        velocity = 0.5 * avg_risk + 0.5 * max_risk
        return self._clamp(velocity)

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

    def run(self, payload: SimulationRunRequest) -> SimulationRunResponse:
        node_states = self._build_initial_node_states(payload)
        edges = self._transform_edges(payload)

        phases: list[SimulationPhase] = []
        latest_airports: list[AirportState] = []
        latest_sectors: list[SectorState] = []
        latest_market: MarketState | None = None

        for phase_index, phase_cfg in enumerate(self.phase_configs):
            stabilization_effects = self._derive_stabilization_effects(
                phase_index=phase_index,
                strategy=str(payload.strategy),
                node_states=node_states,
            )

            node_states = self.propagation_engine.propagate_phase(
                node_states=node_states,
                edges=edges,
                channel_boosts=self.channel_boosts,
                emotion_boosts=self.emotion_boosts,
                time_decay=phase_cfg["time_decay"],
                constraint_multiplier=phase_cfg["constraint_multiplier"],
                stabilization_effects=stabilization_effects,
            )

            latest_market = self._compute_market_state(payload, node_states)
            latest_airports = self._compute_airport_states(node_states, payload)
            latest_sectors = self._compute_sector_states(latest_airports, latest_market)
            metrics = self._compute_phase_metrics(latest_airports, latest_market, latest_sectors, node_states)
            key_events = self._build_key_events(str(phase_cfg["phase"]), metrics, latest_airports)

            phases.append(
                SimulationPhase(
                    phase=phase_cfg["phase"],
                    label=phase_cfg["label"],
                    airport_stress=metrics["airport_stress"],
                    shipping_stress=metrics["shipping_stress"],
                    banking_stress=metrics["banking_stress"],
                    media_stress=metrics["media_stress"],
                    public_stress=metrics["public_stress"],
                    energy_stress=metrics["energy_stress"],
                    market_stress=metrics["market_stress"],
                    logistics_stress=metrics["logistics_stress"],
                    policy_stress=metrics["policy_stress"],
                    total_risk_score=metrics["total_risk"],
                    key_events=key_events,
                )
            )

        spread_velocity = self._compute_spread_velocity(phases)
        critical_window = self._compute_critical_window(phases)

        confidence = self.confidence_engine.compute(
            ConfidenceInput(
                source_reliability=0.82,
                data_coverage=0.72 if payload.signals else 0.58,
                model_consistency=0.78,
                uncertainty_penalty=0.20 if payload.signals else 0.28,
            )
        )

        return SimulationRunResponse(
            scenario_id=payload.scenario_id,
            phases=phases,
            airport_states=latest_airports,
            sector_states=latest_sectors,
            market_state=latest_market,
            spread_velocity=spread_velocity,
            critical_window=critical_window,
            confidence=confidence,
        )
