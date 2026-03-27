"""Phase 2D analysis service — branch-aware, intervention-aware, evidence-grounded.

Q(y | S, Σ, Ĝ, Z, D, B, U)

Enhancements:
- References branch divergence in answers
- References propagation hotspots
- References intervention tradeoffs
- Includes uncertainty drivers
- Evidence trace to computed state
"""
from __future__ import annotations

from typing import Any

from app.schemas.analysis import AnalysisQueryRequest, AnalysisQueryResponse
from app.schemas.branching import BranchEnvelope
from app.schemas.intervention import InterventionSet
from app.schemas.uncertainty import UncertaintyEnvelope


class AnalysisServiceV2:
    """Phase 2D analyst response service — grounded on computed state + branches."""

    @staticmethod
    def _normalize_question(text: str) -> str:
        return text.strip().lower()

    def _extract_latest_phase(self, sim: dict[str, Any]) -> dict[str, Any]:
        phases = sim.get("phases", [])
        if not phases:
            raise ValueError("Simulation response does not contain phases")
        return phases[-1]

    def _top_drivers(self, sim: dict[str, Any], decision: dict[str, Any]) -> list[str]:
        latest = self._extract_latest_phase(sim)
        drivers = {
            "airport disruption": float(latest.get("airport_stress", 0.0)),
            "shipping stress": float(latest.get("shipping_stress", 0.0)),
            "banking continuity": float(latest.get("banking_stress", 0.0)),
            "media amplification": float(latest.get("media_stress", 0.0)),
            "public sentiment": float(latest.get("public_stress", 0.0)),
            "energy / oil stress": float(latest.get("energy_stress", 0.0)),
            "market stress": float(latest.get("market_stress", 0.0)),
            "logistics spillover": float(latest.get("logistics_stress", 0.0)),
            "policy / regulatory": float(latest.get("policy_stress", 0.0)),
        }
        ranked = sorted(drivers.items(), key=lambda kv: kv[1], reverse=True)
        return [n for n, _ in ranked[:5]]

    def _top_entities(self, sim: dict[str, Any]) -> list[str]:
        airports = sorted(
            sim.get("airport_states", []),
            key=lambda x: float(x.get("composite_risk", 0.0)), reverse=True,
        )
        sectors = sorted(
            sim.get("sector_states", []),
            key=lambda x: float(x.get("composite_impact", 0.0)), reverse=True,
        )
        result = [str(a.get("airport_code", "unknown")) for a in airports[:3]]
        result += [str(s.get("sector", "unknown")) for s in sectors[:3]]
        return result[:6]

    def _counterfactuals(
        self, sim: dict[str, Any], decision: dict[str, Any],
        branch_envelope: BranchEnvelope | None = None,
    ) -> list[str]:
        latest = self._extract_latest_phase(sim)
        critical_window = str(decision.get("critical_window", "T0-T1"))
        airport = float(latest.get("airport_stress", 0.0))
        market = float(latest.get("market_stress", 0.0))
        logistics = float(latest.get("logistics_stress", 0.0))

        scenarios = [
            f"If intervention occurs before {critical_window}, stress should stabilize earlier.",
            f"If airport disruption intensifies beyond {airport:.2f}, tourism and logistics deepen.",
            f"If market stress rises above {market:.2f}, banking sensitivity increases.",
        ]

        # Branch-aware counterfactuals
        if branch_envelope and branch_envelope.branches:
            adverse = next((b for b in branch_envelope.branches if b.branch_label == "adverse"), None)
            containment = next((b for b in branch_envelope.branches if b.branch_label == "containment"), None)
            if adverse:
                scenarios.append(
                    f"Adverse branch: peak risk reaches {adverse.outcome.peak_risk_score:.2f} "
                    f"(probability {adverse.branch_probability:.2f}). "
                    f"Trigger: {adverse.branch_trigger}."
                )
            if containment:
                scenarios.append(
                    f"Containment branch: peak reduced to {containment.outcome.peak_risk_score:.2f} "
                    f"(probability {containment.branch_probability:.2f}). "
                    f"Trigger: {containment.branch_trigger}."
                )

        return scenarios[:5]

    def _build_answer(
        self, question: str,
        sim: dict[str, Any], decision: dict[str, Any], brief: dict[str, Any],
        branch_envelope: BranchEnvelope | None = None,
        intervention_set: InterventionSet | None = None,
        uncertainty: UncertaintyEnvelope | None = None,
    ) -> str:
        q = self._normalize_question(question)
        latest = self._extract_latest_phase(sim)

        if "why" in q or "drive" in q or "reason" in q:
            drivers = self._top_drivers(sim, decision)
            answer = (
                f"The outcome is driven by {', '.join(drivers[:3])}. "
                f"Airport stress: {float(latest.get('airport_stress', 0.0)):.2f}, "
                f"market: {float(latest.get('market_stress', 0.0)):.2f}."
            )
            if branch_envelope and branch_envelope.branches:
                answer += (
                    f" Across branches, expected peak risk is {branch_envelope.expected_peak_risk:.2f} "
                    f"(worst: {branch_envelope.worst_case_peak_risk:.2f})."
                )
            return answer

        if "branch" in q or "scenario" in q or "path" in q:
            if branch_envelope and branch_envelope.branches:
                parts = [
                    f"{b.branch_label}: peak {b.outcome.peak_risk_score:.2f} (p={b.branch_probability:.2f})"
                    for b in branch_envelope.branches
                ]
                return "Scenario branches: " + "; ".join(parts) + f". Entropy: {branch_envelope.branch_entropy:.3f}."
            return "No branch analysis available for this scenario."

        if "interven" in q or "action" in q or "do now" in q:
            if intervention_set and intervention_set.interventions:
                top = intervention_set.interventions[0]
                return (
                    f"Top intervention: {top.label} "
                    f"(efficiency: {top.efficiency_score:.3f}, "
                    f"peak reduction: {top.peak_reduction:.3f}, "
                    f"cost: {top.estimated_cost:.2f}). "
                    f"Combined top-3 reduction: {intervention_set.combined_reduction_potential:.3f}."
                )
            actions = list(decision.get("recommended_actions", []))
            return "Recommended actions: " + "; ".join(actions[:4]) + "." if actions else "No actions available."

        if "uncertain" in q or "confidence" in q:
            if uncertainty:
                notes = " ".join(uncertainty.notes) if uncertainty.notes else f"Composite: {uncertainty.composite_uncertainty:.2f}."
                drivers = "; ".join(uncertainty.key_drivers[:3]) if uncertainty.key_drivers else "none identified"
                return f"Uncertainty assessment: {notes} Key drivers: {drivers}."
            return f"Confidence: {float(decision.get('confidence', 0.0)):.2f}."

        if "next" in q or "forecast" in q:
            forecast = brief.get("forecast", {}) or {}
            base = str(forecast.get("base_case", "")).strip()
            return base if base else "Continued elevated stress expected."

        # Default
        risk = float(latest.get("total_risk_score", 0.0))
        primary = decision.get("primary_driver", "multi-factor stress")
        answer = f"Scenario active with total risk {risk:.2f}. Primary driver: {primary}."
        if branch_envelope:
            answer += f" Expected peak risk: {branch_envelope.expected_peak_risk:.2f}."
        return answer

    def answer(self, payload: AnalysisQueryRequest) -> AnalysisQueryResponse:
        """Backward-compatible answer."""
        decision = payload.decision_output
        sim = payload.simulation_response
        brief = payload.intelligence_brief

        return AnalysisQueryResponse(
            scenario_id=payload.scenario_id,
            answer=self._build_answer(payload.question, sim, decision, brief),
            top_drivers=self._top_drivers(sim, decision),
            top_entities=self._top_entities(sim),
            counterfactuals=self._counterfactuals(sim, decision),
            confidence=max(0.01, float(decision.get("confidence", 0.72))),
        )

    def answer_branched(
        self,
        payload: AnalysisQueryRequest,
        branch_envelope: BranchEnvelope | None = None,
        intervention_set: InterventionSet | None = None,
        uncertainty: UncertaintyEnvelope | None = None,
    ) -> dict[str, Any]:
        """Phase 2D enhanced analyst response.

        Returns:
        - response: AnalysisQueryResponse
        - evidence_references: list[str] — what computed data this answer draws from
        - dependency_trace: list[str] — pipeline stages used
        - uncertainty_note: str
        - suggested_next_check: str
        """
        decision = payload.decision_output
        sim = payload.simulation_response
        brief = payload.intelligence_brief

        answer = self._build_answer(
            payload.question, sim, decision, brief,
            branch_envelope, intervention_set, uncertainty,
        )
        drivers = self._top_drivers(sim, decision)
        entities = self._top_entities(sim)
        counterfactuals = self._counterfactuals(sim, decision, branch_envelope)

        confidence = max(0.01, float(decision.get("confidence", 0.72)))
        if uncertainty and uncertainty.composite_uncertainty > 0.50:
            confidence = max(0.01, confidence * 0.85)

        response = AnalysisQueryResponse(
            scenario_id=payload.scenario_id,
            answer=answer,
            top_drivers=drivers,
            top_entities=entities,
            counterfactuals=counterfactuals,
            confidence=confidence,
        )

        # Evidence references
        evidence = [
            f"Simulation phases: {len(sim.get('phases', []))}",
            f"Airport states: {len(sim.get('airport_states', []))}",
            f"Sector states: {len(sim.get('sector_states', []))}",
        ]
        if branch_envelope:
            evidence.append(f"Branch count: {len(branch_envelope.branches)}")
        if intervention_set:
            evidence.append(f"Interventions evaluated: {len(intervention_set.interventions)}")

        # Dependency trace
        dep_trace = ["normalization", "signal_extraction", "graph_build", "graph_enrich",
                      "simulation", "decision"]
        if branch_envelope:
            dep_trace.append("branching")
        if intervention_set:
            dep_trace.append("intervention")
        if uncertainty:
            dep_trace.append("uncertainty")

        # Uncertainty note
        unc_note = "No uncertainty data."
        if uncertainty:
            unc_note = " ".join(uncertainty.notes) if uncertainty.notes else f"Composite: {uncertainty.composite_uncertainty:.2f}."

        # Suggested next check
        q = self._normalize_question(payload.question)
        if "why" in q:
            next_check = "Ask: 'What branches show different outcomes?' to explore scenario divergence."
        elif "branch" in q:
            next_check = "Ask: 'What interventions reduce worst-case risk?' to explore mitigation."
        elif "interven" in q:
            next_check = "Ask: 'What is the uncertainty level?' to assess recommendation reliability."
        else:
            next_check = "Ask: 'Why is this the outcome?' to trace root drivers."

        return {
            "response": response,
            "evidence_references": evidence,
            "dependency_trace": dep_trace,
            "uncertainty_note": unc_note,
            "suggested_next_check": next_check,
        }
