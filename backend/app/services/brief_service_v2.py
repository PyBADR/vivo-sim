"""Phase 2D brief service — branch-aware, intervention-aware, uncertainty-aware.

B = f_brief(S, Σ, Ĝ, Z, D, U)

Enhancements:
- Branch divergence summary (baseline vs adverse vs containment)
- Intervention recommendation with efficiency
- Uncertainty statement with drivers
- Structured forecast from branch outcomes
"""
from __future__ import annotations

from typing import Any

from app.schemas.branching import BranchEnvelope
from app.schemas.brief import (
    BriefGenerateRequest,
    BusinessImpactBlock,
    ForecastBlock,
    IntelligenceBrief,
)
from app.schemas.common import Assumption
from app.schemas.intervention import InterventionSet
from app.schemas.uncertainty import UncertaintyEnvelope


class BriefServiceV2:
    """Phase 2D intelligence brief with branch divergence, intervention, uncertainty."""

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def _extract_latest_phase(self, sim: dict[str, Any]) -> dict[str, Any]:
        phases = sim.get("phases", [])
        if not phases:
            raise ValueError("Simulation response does not contain phases")
        return phases[-1]

    def _impact_label(self, value: float) -> str:
        if value < 0.25: return "low"
        if value < 0.50: return "medium"
        if value < 0.75: return "high"
        return "critical"

    def _top_airports(self, sim: dict[str, Any], limit: int = 3) -> list[str]:
        airports = sim.get("airport_states", [])
        ranked = sorted(airports, key=lambda x: float(x.get("composite_risk", 0.0)), reverse=True)
        return [str(a.get("airport_code", "unknown")) for a in ranked[:limit]]

    def _top_sectors(self, sim: dict[str, Any], limit: int = 4) -> list[str]:
        sectors = sim.get("sector_states", [])
        ranked = sorted(sectors, key=lambda x: float(x.get("composite_impact", 0.0)), reverse=True)
        return [str(s.get("sector", "unknown")) for s in ranked[:limit]]

    def _build_scenario_summary(
        self, decision: dict[str, Any], sim: dict[str, Any],
        branch_envelope: BranchEnvelope | None = None,
        uncertainty: UncertaintyEnvelope | None = None,
    ) -> str:
        risk_level = str(decision.get("risk_level", "Unknown"))
        risk_score = float(decision.get("risk_score", 0.0))
        velocity = float(decision.get("spread_velocity", 0.0))
        driver = str(decision.get("primary_driver", "multi-factor stress")).lower()
        top_airports = self._top_airports(sim, limit=2)
        airport_text = ", ".join(top_airports) if top_airports else "key regional airports"

        summary = (
            f"The scenario is assessed as {risk_level} risk (score {risk_score:.2f}) "
            f"with spread velocity at {velocity:.2f}. "
            f"The dominant pressure is {driver}, concentrated around {airport_text}."
        )

        if branch_envelope and branch_envelope.branches:
            summary += (
                f" Across {len(branch_envelope.branches)} scenario branches, "
                f"expected peak risk is {branch_envelope.expected_peak_risk:.2f} "
                f"(worst case: {branch_envelope.worst_case_peak_risk:.2f})."
            )

        if uncertainty and uncertainty.composite_uncertainty > 0.50:
            summary += " Note: overall uncertainty is elevated."

        return summary

    def _build_timeline_narrative(
        self, sim: dict[str, Any],
        branch_envelope: BranchEnvelope | None = None,
    ) -> str:
        phases = sim.get("phases", [])
        if not phases:
            return "No simulation phases were available."

        parts: list[str] = []
        for phase in phases:
            label = str(phase.get("label", "Unknown"))
            risk = float(phase.get("total_risk_score", 0.0))
            dims = [
                ("airport disruption", float(phase.get("airport_stress", 0.0))),
                ("market stress", float(phase.get("market_stress", 0.0))),
                ("logistics spillover", float(phase.get("logistics_stress", 0.0))),
            ]
            dominant = max(dims, key=lambda x: x[1])[0]
            parts.append(f"{label}: risk {risk:.2f}, driven by {dominant}.")

        narrative = " ".join(parts)

        # Add branch divergence
        if branch_envelope and len(branch_envelope.branches) >= 2:
            adverse = next((b for b in branch_envelope.branches if b.branch_label == "adverse"), None)
            containment = next((b for b in branch_envelope.branches if b.branch_label == "containment"), None)
            if adverse and containment:
                narrative += (
                    f" Branch divergence: adverse path peaks at {adverse.outcome.peak_risk_score:.2f}, "
                    f"containment path peaks at {containment.outcome.peak_risk_score:.2f}."
                )

        return narrative

    def _build_forecast(
        self, decision: dict[str, Any], sim: dict[str, Any],
        branch_envelope: BranchEnvelope | None = None,
    ) -> ForecastBlock:
        latest = self._extract_latest_phase(sim)
        critical_window = str(decision.get("critical_window", "T0-T1"))

        if branch_envelope and branch_envelope.branches:
            baseline_b = next((b for b in branch_envelope.branches if b.branch_label == "baseline"), None)
            adverse_b = next((b for b in branch_envelope.branches if b.branch_label == "adverse"), None)
            containment_b = next((b for b in branch_envelope.branches if b.branch_label == "containment"), None)

            base_case = (
                f"Base case (p={baseline_b.branch_probability:.2f}): "
                f"peak risk {baseline_b.outcome.peak_risk_score:.2f}, "
                f"stabilization expected by {baseline_b.outcome.stabilization_phase or 'T5'}."
            ) if baseline_b else f"Elevated stress persists through {critical_window}."

            pessimistic_case = (
                f"Adverse case (p={adverse_b.branch_probability:.2f}): "
                f"peak risk escalates to {adverse_b.outcome.peak_risk_score:.2f} "
                f"with spread velocity {adverse_b.outcome.spread_velocity:.2f}."
            ) if adverse_b else "Risk escalates with deepening spillovers."

            controlled_case = (
                f"Containment case (p={containment_b.branch_probability:.2f}): "
                f"timely intervention reduces peak to {containment_b.outcome.peak_risk_score:.2f}."
            ) if containment_b else "Timely intervention compresses stress."
        else:
            airport_stress = float(latest.get("airport_stress", 0.0))
            market_stress = float(latest.get("market_stress", 0.0))
            base_case = f"Elevated stress persists through {critical_window} with airport pressure at {airport_stress:.2f}."
            pessimistic_case = "Risk escalates with second-order spillovers across logistics and tourism."
            controlled_case = "Timely intervention reduces operational stress and spread velocity."

        return ForecastBlock(
            base_case=base_case,
            pessimistic_case=pessimistic_case,
            controlled_response_case=controlled_case,
        )

    def _build_business_impact(self, sim: dict[str, Any]) -> BusinessImpactBlock:
        airports = sim.get("airport_states", [])
        sectors = sim.get("sector_states", [])
        market = sim.get("market_state", {}) or {}

        avg_ap = sum(float(a.get("composite_risk", 0.0)) for a in airports) / len(airports) if airports else 0.0
        sec_map = {str(s.get("sector")): float(s.get("composite_impact", 0.0)) for s in sectors}

        return BusinessImpactBlock(
            airports=self._impact_label(avg_ap),
            logistics=self._impact_label(sec_map.get("logistics", 0.0)),
            tourism=self._impact_label(sec_map.get("tourism", 0.0)),
            banking=self._impact_label(sec_map.get("banking", 0.0)),
            ecommerce=self._impact_label(sec_map.get("ecommerce", 0.0)),
            energy=self._impact_label(float(market.get("oil_stress", 0.0))),
        )

    def generate(self, payload: BriefGenerateRequest) -> IntelligenceBrief:
        """Backward-compatible generate."""
        return self._generate_internal(
            payload.scenario_id, payload.decision_output, payload.simulation_response,
        )

    def generate_branched(
        self,
        payload: BriefGenerateRequest,
        branch_envelope: BranchEnvelope | None = None,
        intervention_set: InterventionSet | None = None,
        uncertainty: UncertaintyEnvelope | None = None,
    ) -> dict[str, Any]:
        """Phase 2D enhanced brief.

        Returns:
        - brief: IntelligenceBrief
        - uncertainty_statement: str
        - intervention_summary: str
        - branch_divergence_summary: str
        """
        decision = payload.decision_output
        sim = payload.simulation_response

        summary = self._build_scenario_summary(decision, sim, branch_envelope, uncertainty)
        timeline = self._build_timeline_narrative(sim, branch_envelope)
        forecast = self._build_forecast(decision, sim, branch_envelope)
        business_impact = self._build_business_impact(sim)

        latest = self._extract_latest_phase(sim)
        drivers_map = {
            "Airport disruption": float(latest.get("airport_stress", 0.0)),
            "Market stress": float(latest.get("market_stress", 0.0)),
            "Logistics spillover": float(latest.get("logistics_stress", 0.0)),
            "Media amplification": float(latest.get("media_stress", 0.0)),
            "Policy stress": float(latest.get("policy_stress", 0.0)),
        }
        key_drivers = [n for n, _ in sorted(drivers_map.items(), key=lambda kv: kv[1], reverse=True)[:4]]

        entities = self._top_airports(sim, 3) + self._top_sectors(sim, 3)
        recommended_actions = list(decision.get("recommended_actions", []))
        assumptions = list(decision.get("assumptions", []))
        confidence = float(decision.get("confidence", 0.0))

        brief = IntelligenceBrief(
            scenario_id=payload.scenario_id,
            scenario_summary=summary,
            timeline_narrative=timeline,
            key_drivers=key_drivers,
            entity_influence=entities,
            forecast=forecast,
            business_impact=business_impact,
            recommended_actions=recommended_actions,
            assumptions=assumptions,
            confidence=confidence,
        )

        # Build uncertainty statement
        unc_statement = "Uncertainty data not available."
        if uncertainty:
            unc_statement = " ".join(uncertainty.notes) if uncertainty.notes else (
                f"Composite uncertainty: {uncertainty.composite_uncertainty:.2f}."
            )
            if uncertainty.key_drivers:
                unc_statement += " Key drivers: " + "; ".join(uncertainty.key_drivers[:3]) + "."

        # Build intervention summary
        intv_summary = "No intervention analysis available."
        if intervention_set and intervention_set.interventions:
            top = intervention_set.interventions[0]
            intv_summary = (
                f"Top intervention: {top.label} "
                f"(efficiency: {top.efficiency_score:.3f}, reduction: {top.peak_reduction:.3f}). "
            )
            if intervention_set.combined_reduction_potential > 0:
                intv_summary += f"Combined top-3 reduction: {intervention_set.combined_reduction_potential:.3f}."

        # Build branch divergence summary
        branch_summary = "Single-path simulation."
        if branch_envelope and len(branch_envelope.branches) >= 2:
            labels = [f"{b.branch_label} (p={b.branch_probability:.2f}, peak={b.outcome.peak_risk_score:.2f})"
                      for b in branch_envelope.branches]
            branch_summary = f"Branch envelope: {'; '.join(labels)}."

        return {
            "brief": brief,
            "uncertainty_statement": unc_statement,
            "intervention_summary": intv_summary,
            "branch_divergence_summary": branch_summary,
        }

    def _generate_internal(
        self, scenario_id: str, decision: dict[str, Any], sim: dict[str, Any],
    ) -> IntelligenceBrief:
        summary = self._build_scenario_summary(decision, sim)
        timeline = self._build_timeline_narrative(sim)
        forecast = self._build_forecast(decision, sim)
        business_impact = self._build_business_impact(sim)

        latest = self._extract_latest_phase(sim)
        drivers_map = {
            "Airport disruption": float(latest.get("airport_stress", 0.0)),
            "Market stress": float(latest.get("market_stress", 0.0)),
            "Logistics spillover": float(latest.get("logistics_stress", 0.0)),
            "Media amplification": float(latest.get("media_stress", 0.0)),
            "Policy stress": float(latest.get("policy_stress", 0.0)),
        }
        key_drivers = [n for n, _ in sorted(drivers_map.items(), key=lambda kv: kv[1], reverse=True)[:4]]
        entities = self._top_airports(sim, 3) + self._top_sectors(sim, 3)

        return IntelligenceBrief(
            scenario_id=scenario_id,
            scenario_summary=summary, timeline_narrative=timeline,
            key_drivers=key_drivers, entity_influence=entities,
            forecast=forecast, business_impact=business_impact,
            recommended_actions=list(decision.get("recommended_actions", [])),
            assumptions=list(decision.get("assumptions", [])),
            confidence=float(decision.get("confidence", 0.0)),
        )
