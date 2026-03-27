"""Phase 2D decision service — branch-aware, intervention-aware.

D(a_j) = θ₁R + θ₂M + θ₃F + θ₄T − θ₅C − θ₆H

Enhancements:
- Decision considers expected outcome across branches
- Intervention efficiency feeds into action ranking
- Decision confidence is margin-based
- Uncertainty envelope drives decision uncertainty
"""
from __future__ import annotations

from typing import Any

from app.config.math_constants import MathConstants
from app.engines.confidence_engine import ConfidenceEngine, ConfidenceInput
from app.engines.risk_engine import RiskEngine
from app.engines.strategy_engine import StrategyEngine, StrategyEvaluationInput
from app.engines.uncertainty_engine import UncertaintyEngine
from app.schemas.branching import BranchEnvelope
from app.schemas.common import Assumption, MoneyRange, RankedAction
from app.schemas.decision import CustomerImpact, DecisionComputeRequest, DecisionOutput
from app.schemas.intervention import InterventionSet
from app.schemas.uncertainty import UncertaintyEnvelope


class DecisionServiceV2:
    """Phase 2D branch-aware, intervention-aware decision computation."""

    def __init__(self, mc: MathConstants | None = None) -> None:
        self.mc = mc or MathConstants()
        self.risk_engine = RiskEngine()
        self.strategy_engine = StrategyEngine()
        self.confidence_engine = ConfidenceEngine()
        self.uncertainty_engine = UncertaintyEngine(self.mc)

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def _extract_latest_phase(self, sim: dict) -> dict:
        phases = sim.get("phases", [])
        if not phases:
            raise ValueError("Simulation response does not contain phases")
        return phases[-1]

    def _avg_airport_risk(self, sim: dict) -> float:
        airports = sim.get("airport_states", [])
        if not airports:
            return 0.0
        return sum(float(a.get("composite_risk", 0.0)) for a in airports) / len(airports)

    def _avg_sector_impact(self, sim: dict) -> float:
        sectors = sim.get("sector_states", [])
        if not sectors:
            return 0.0
        return sum(float(s.get("composite_impact", 0.0)) for s in sectors) / len(sectors)

    def _build_ranked_actions(
        self,
        latest: dict,
        intervention_set: InterventionSet | None = None,
        branch_envelope: BranchEnvelope | None = None,
    ) -> list[RankedAction]:
        """Build scored action list from strategies + interventions."""
        total_risk = float(latest.get("total_risk_score", 0.0))
        media = float(latest.get("media_stress", 0.0))
        airport = float(latest.get("airport_stress", 0.0))

        dc = self.mc.decision
        actions: list[RankedAction] = []

        # Strategy-based actions
        strategies = [
            StrategyEvaluationInput(
                name="transparent",
                risk_reduction=self._clamp(0.35 + 0.15 * media),
                trust_gain=self._clamp(0.30 + 0.20 * media),
                revenue_penalty=0.12, regulatory_penalty=0.08,
            ),
            StrategyEvaluationInput(
                name="phased",
                risk_reduction=self._clamp(0.24 + 0.10 * airport),
                trust_gain=self._clamp(0.18 + 0.08 * media),
                revenue_penalty=0.10, regulatory_penalty=0.10,
            ),
            StrategyEvaluationInput(
                name="defensive",
                risk_reduction=self._clamp(0.15 + 0.08 * total_risk),
                trust_gain=0.06, revenue_penalty=0.08, regulatory_penalty=0.18,
            ),
        ]

        for strat in strategies:
            score = (
                dc.theta_risk_reduction * strat.risk_reduction
                + dc.theta_mitigation_impact * strat.trust_gain
                + dc.theta_feasibility * 0.70  # default feasibility
                + dc.theta_timeliness * 0.60   # default timeliness
                - dc.theta_cost * strat.revenue_penalty
                - dc.theta_downside_risk * strat.regulatory_penalty
            )
            actions.append(RankedAction(
                name=f"Strategy: {strat.name}",
                composite_score=self._clamp(score),
                risk_reduction=strat.risk_reduction,
                trust_gain=strat.trust_gain,
                revenue_penalty=strat.revenue_penalty,
                regulatory_penalty=strat.regulatory_penalty,
            ))

        # Intervention-based actions (if available)
        if intervention_set:
            for intv in intervention_set.interventions[:3]:
                intv_score = (
                    dc.theta_risk_reduction * self._clamp(intv.peak_reduction * 2.0)
                    + dc.theta_mitigation_impact * self._clamp(intv.efficiency_score / 5.0)
                    + dc.theta_feasibility * (1.0 - intv.estimated_cost)
                    + dc.theta_timeliness * intv.confidence
                    - dc.theta_cost * intv.estimated_cost
                    - dc.theta_downside_risk * 0.05
                )
                actions.append(RankedAction(
                    name=f"Intervention: {intv.label}",
                    composite_score=self._clamp(intv_score),
                    risk_reduction=self._clamp(intv.peak_reduction * 2.0),
                    trust_gain=self._clamp(intv.efficiency_score / 5.0),
                    revenue_penalty=intv.estimated_cost,
                    regulatory_penalty=0.05,
                ))

        # Sort by composite score
        actions.sort(key=lambda a: a.composite_score, reverse=True)
        return actions

    def compute(self, payload: DecisionComputeRequest) -> DecisionOutput:
        """Backward-compatible compute — same as v1."""
        sim = payload.simulation_response
        latest = self._extract_latest_phase(sim)
        risk_score = float(latest.get("total_risk_score", 0.0))
        risk_level = self.risk_engine.classify(risk_score)

        # Derive fields (same logic as v1)
        driver_map = {
            "Airspace restriction and airport disruption": float(latest.get("airport_stress", 0.0)),
            "Market repricing and commodity stress": float(latest.get("market_stress", 0.0)),
            "Logistics and supply chain spillover": float(latest.get("logistics_stress", 0.0)),
            "Policy and regulatory escalation": float(latest.get("policy_stress", 0.0)),
            "Media amplification pressure": float(latest.get("media_stress", 0.0)),
        }
        primary_driver = max(driver_map.items(), key=lambda kv: kv[1])[0]

        airport_risk = self._avg_airport_risk(sim)
        sector_impact = self._avg_sector_impact(sim)
        market_stress = float(latest.get("market_stress", 0.0))
        severity = self._clamp(0.40 * airport_risk + 0.35 * sector_impact + 0.25 * market_stress)

        financial_impact = MoneyRange(
            currency="USD",
            low=round(5_000_000 + severity * 15_000_000, 2),
            high=round(15_000_000 + severity * 35_000_000, 2),
        )

        public_stress = float(latest.get("public_stress", 0.0))
        media_stress = float(latest.get("media_stress", 0.0))
        customer_impact = CustomerImpact(
            passenger_confidence_risk=self._clamp(0.55 * airport_risk + 0.25 * public_stress + 0.20 * media_stress),
            churn_risk=self._clamp(0.45 * public_stress + 0.25 * media_stress + 0.30 * airport_risk),
        )

        regulatory_risk = self._clamp(
            0.55 * float(latest.get("policy_stress", 0.0)) +
            0.20 * float(latest.get("airport_stress", 0.0)) +
            0.25 * market_stress
        )
        reputation_score = self._clamp(
            0.35 * media_stress + 0.35 * public_stress + 0.30 * airport_risk
        )

        spread_velocity = float(sim.get("spread_velocity", 0.0))
        critical_window = str(sim.get("critical_window", "T0-T1"))

        ranked_actions = self._build_ranked_actions(latest)
        recommended_actions = [a.name for a in ranked_actions[:4]]

        confidence = self.confidence_engine.compute(ConfidenceInput(
            source_reliability=float(sim.get("confidence", 0.70)),
            data_coverage=0.74, model_consistency=0.80, uncertainty_penalty=0.18,
        ))

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
            assumptions=[
                Assumption(text="Current conditions persist through modeled horizon"),
                Assumption(text="No major de-escalation before critical window"),
            ],
            confidence=confidence,
        )

    def compute_branched(
        self,
        payload: DecisionComputeRequest,
        branch_envelope: BranchEnvelope | None = None,
        intervention_set: InterventionSet | None = None,
        uncertainty_envelope: UncertaintyEnvelope | None = None,
    ) -> dict[str, Any]:
        """Phase 2D branched decision computation.

        Returns:
        - decision_output: DecisionOutput (backward-compat)
        - ranked_actions: list[RankedAction] with criterion scores
        - score_margin_to_second: float
        - decision_uncertainty: float
        - decision_rationale: str
        - branch_aware_rationale: str
        - intervention_aware_rationale: str
        """
        base_decision = self.compute(payload)
        sim = payload.simulation_response
        latest = self._extract_latest_phase(sim)

        ranked_actions = self._build_ranked_actions(latest, intervention_set, branch_envelope)

        # Score margin
        if len(ranked_actions) >= 2:
            margin = ranked_actions[0].composite_score - ranked_actions[1].composite_score
        else:
            margin = 0.0

        # Decision uncertainty
        score_std = 0.0
        if len(ranked_actions) >= 2:
            scores = [a.composite_score for a in ranked_actions]
            mean_s = sum(scores) / len(scores)
            score_std = (sum((s - mean_s) ** 2 for s in scores) / len(scores)) ** 0.5

        decision_unc = self.uncertainty_engine.decision_uncertainty(
            top_score=ranked_actions[0].composite_score if ranked_actions else 0.0,
            second_score=ranked_actions[1].composite_score if len(ranked_actions) >= 2 else 0.0,
            score_std=score_std,
        )

        # Build rationales
        top_action = ranked_actions[0].name if ranked_actions else "no action available"
        rationale = (
            f"Top recommended action: {top_action} "
            f"(score: {ranked_actions[0].composite_score:.3f}). "
            f"Margin to second: {margin:.3f}."
        )

        branch_rationale = "Single-path assessment."
        if branch_envelope and branch_envelope.branches:
            worst = branch_envelope.worst_case_peak_risk
            best = branch_envelope.best_case_peak_risk
            expected = branch_envelope.expected_peak_risk
            branch_rationale = (
                f"Across {len(branch_envelope.branches)} branches: "
                f"expected peak risk {expected:.2f}, "
                f"worst case {worst:.2f}, best case {best:.2f}. "
                f"Branch entropy: {branch_envelope.branch_entropy:.3f}."
            )

        intv_rationale = "No intervention analysis available."
        if intervention_set and intervention_set.interventions:
            best_intv = intervention_set.interventions[0]
            intv_rationale = (
                f"Best intervention: {best_intv.label} "
                f"(efficiency: {best_intv.efficiency_score:.3f}, "
                f"peak reduction: {best_intv.peak_reduction:.3f}). "
                f"Combined top-3 reduction potential: {intervention_set.combined_reduction_potential:.3f}."
            )

        return {
            "decision_output": base_decision,
            "ranked_actions": ranked_actions,
            "score_margin_to_second": round(margin, 4),
            "decision_uncertainty": decision_unc,
            "decision_rationale": rationale,
            "branch_aware_rationale": branch_rationale,
            "intervention_aware_rationale": intv_rationale,
        }
