from __future__ import annotations

from app.engines.confidence_engine import ConfidenceEngine, ConfidenceInput
from app.engines.risk_engine import RiskEngine
from app.engines.strategy_engine import StrategyEngine, StrategyEvaluationInput
from app.schemas.common import Assumption, MoneyRange
from app.schemas.decision import CustomerImpact, DecisionComputeRequest, DecisionOutput


class DecisionService:
    """
    Converts simulation outputs into enterprise decision outputs.

    Responsibilities:
    - classify risk level
    - calculate financial / customer / regulatory / reputation effects
    - identify primary driver
    - rank strategies
    - attach assumptions and confidence
    """

    def __init__(self) -> None:
        self.risk_engine = RiskEngine()
        self.strategy_engine = StrategyEngine()
        self.confidence_engine = ConfidenceEngine()

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def _extract_latest_phase(self, simulation_response: dict) -> dict:
        phases = simulation_response.get("phases", [])
        if not phases:
            raise ValueError("Simulation response does not contain phases")
        return phases[-1]

    def _avg_airport_risk(self, simulation_response: dict) -> float:
        airport_states = simulation_response.get("airport_states", [])
        if not airport_states:
            return 0.0
        return sum(float(a.get("composite_risk", 0.0)) for a in airport_states) / len(airport_states)

    def _avg_sector_impact(self, simulation_response: dict) -> float:
        sector_states = simulation_response.get("sector_states", [])
        if not sector_states:
            return 0.0
        return sum(float(s.get("composite_impact", 0.0)) for s in sector_states) / len(sector_states)

    def _derive_primary_driver(self, latest_phase: dict, simulation_response: dict) -> str:
        airport_risk = float(latest_phase.get("airport_stress", 0.0))
        market_risk = float(latest_phase.get("market_stress", 0.0))
        logistics_risk = float(latest_phase.get("logistics_stress", 0.0))
        policy_risk = float(latest_phase.get("policy_stress", 0.0))
        media_risk = float(latest_phase.get("media_stress", 0.0))

        driver_map = {
            "Airspace restriction and airport disruption": airport_risk,
            "Market repricing and commodity stress": market_risk,
            "Logistics and supply chain spillover": logistics_risk,
            "Policy and regulatory escalation": policy_risk,
            "Media amplification pressure": media_risk,
        }

        return max(driver_map.items(), key=lambda kv: kv[1])[0]

    def _estimate_financial_impact(self, latest_phase: dict, simulation_response: dict) -> MoneyRange:
        airport_risk = self._avg_airport_risk(simulation_response)
        sector_impact = self._avg_sector_impact(simulation_response)
        market_stress = float(latest_phase.get("market_stress", 0.0))

        severity = self._clamp(0.40 * airport_risk + 0.35 * sector_impact + 0.25 * market_stress)

        low = 5_000_000 + severity * 15_000_000
        high = 15_000_000 + severity * 35_000_000

        return MoneyRange(currency="USD", low=round(low, 2), high=round(high, 2))

    def _estimate_customer_impact(self, latest_phase: dict, simulation_response: dict) -> CustomerImpact:
        airport_risk = self._avg_airport_risk(simulation_response)
        public_stress = float(latest_phase.get("public_stress", 0.0))
        media_stress = float(latest_phase.get("media_stress", 0.0))

        passenger_confidence_risk = self._clamp(0.55 * airport_risk + 0.25 * public_stress + 0.20 * media_stress)
        churn_risk = self._clamp(0.45 * public_stress + 0.25 * media_stress + 0.30 * airport_risk)

        return CustomerImpact(
            passenger_confidence_risk=passenger_confidence_risk,
            churn_risk=churn_risk,
        )

    def _estimate_regulatory_risk(self, latest_phase: dict) -> float:
        return self._clamp(
            0.55 * float(latest_phase.get("policy_stress", 0.0))
            + 0.20 * float(latest_phase.get("airport_stress", 0.0))
            + 0.25 * float(latest_phase.get("market_stress", 0.0))
        )

    def _estimate_reputation_score(self, latest_phase: dict) -> float:
        return self._clamp(
            0.35 * float(latest_phase.get("media_stress", 0.0))
            + 0.35 * float(latest_phase.get("public_stress", 0.0))
            + 0.30 * float(latest_phase.get("airport_stress", 0.0))
        )

    def _evaluate_strategies(self, latest_phase: dict) -> list[str]:
        total_risk = float(latest_phase.get("total_risk_score", 0.0))
        media_stress = float(latest_phase.get("media_stress", 0.0))
        airport_stress = float(latest_phase.get("airport_stress", 0.0))

        strategies = [
            StrategyEvaluationInput(
                name="transparent",
                risk_reduction=self._clamp(0.35 + 0.15 * media_stress),
                trust_gain=self._clamp(0.30 + 0.20 * media_stress),
                revenue_penalty=0.12,
                regulatory_penalty=0.08,
            ),
            StrategyEvaluationInput(
                name="delayed",
                risk_reduction=self._clamp(0.08 + 0.05 * airport_stress),
                trust_gain=0.05,
                revenue_penalty=0.05,
                regulatory_penalty=0.20,
            ),
            StrategyEvaluationInput(
                name="defensive",
                risk_reduction=self._clamp(0.15 + 0.08 * total_risk),
                trust_gain=0.06,
                revenue_penalty=0.08,
                regulatory_penalty=0.18,
            ),
            StrategyEvaluationInput(
                name="silent",
                risk_reduction=0.02,
                trust_gain=0.00,
                revenue_penalty=0.02,
                regulatory_penalty=0.25,
            ),
            StrategyEvaluationInput(
                name="phased",
                risk_reduction=self._clamp(0.24 + 0.10 * airport_stress),
                trust_gain=self._clamp(0.18 + 0.08 * media_stress),
                revenue_penalty=0.10,
                regulatory_penalty=0.10,
            ),
        ]

        ranked = self.strategy_engine.evaluate(strategies)
        return [f"{item.name}: {item.score:.3f}" for item in ranked]

    def _build_recommended_actions(
        self,
        primary_driver: str,
        critical_window: str,
        strategy_rankings: list[str],
    ) -> list[str]:
        actions = []

        if "airport" in primary_driver.lower() or "airspace" in primary_driver.lower():
            actions.append(f"Issue airport operations advisory before critical window {critical_window}")
            actions.append("Coordinate reroute and cancellation messaging with airlines")
            actions.append("Activate cargo continuity fallback plan")

        elif "market" in primary_driver.lower():
            actions.append("Activate market monitoring and treasury response protocol")
            actions.append("Publish controlled continuity messaging to reduce panic repricing")

        elif "logistics" in primary_driver.lower():
            actions.append("Prioritize logistics rerouting and inventory continuity actions")

        elif "policy" in primary_driver.lower():
            actions.append("Escalate regulatory liaison and policy coordination immediately")

        else:
            actions.append("Increase cross-functional situation monitoring and response cadence")

        if strategy_rankings:
            actions.append(f"Top communication strategy: {strategy_rankings[0]}")

        return actions[:5]

    def compute(self, payload: DecisionComputeRequest) -> DecisionOutput:
        simulation_response = payload.simulation_response
        latest_phase = self._extract_latest_phase(simulation_response)

        risk_score = float(latest_phase.get("total_risk_score", 0.0))
        risk_level = self.risk_engine.classify(risk_score)

        primary_driver = self._derive_primary_driver(latest_phase, simulation_response)
        financial_impact = self._estimate_financial_impact(latest_phase, simulation_response)
        customer_impact = self._estimate_customer_impact(latest_phase, simulation_response)
        regulatory_risk = self._estimate_regulatory_risk(latest_phase)
        reputation_score = self._estimate_reputation_score(latest_phase)
        critical_window = str(simulation_response.get("critical_window", "T0-T1"))
        spread_velocity = float(simulation_response.get("spread_velocity", 0.0))

        strategy_rankings = self._evaluate_strategies(latest_phase)
        recommended_actions = self._build_recommended_actions(
            primary_driver=primary_driver,
            critical_window=critical_window,
            strategy_rankings=strategy_rankings,
        )

        confidence = self.confidence_engine.compute(
            ConfidenceInput(
                source_reliability=float(simulation_response.get("confidence", 0.70)),
                data_coverage=0.74,
                model_consistency=0.80,
                uncertainty_penalty=0.18,
            )
        )

        assumptions = [
            Assumption(text="Current route and policy conditions persist through the modeled horizon"),
            Assumption(text="No major de-escalation event occurs before the critical window"),
        ]

        return DecisionOutput(
            scenario_id=payload.scenario_id,
            risk_level=risk_level,
            risk_score=self._clamp(risk_score),
            spread_velocity=self._clamp(spread_velocity),
            primary_driver=primary_driver,
            critical_window=critical_window,
            financial_impact=financial_impact,
            customer_impact=customer_impact,
            regulatory_risk=regulatory_risk,
            reputation_score=reputation_score,
            recommended_actions=recommended_actions,
            assumptions=assumptions,
            confidence=confidence,
        )
