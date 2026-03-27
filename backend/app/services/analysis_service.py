from __future__ import annotations

from typing import Any

from app.schemas.analysis import AnalysisQueryRequest, AnalysisQueryResponse


class AnalysisService:
    """
    Builds analyst answers from structured simulation + decision + brief context.

    No static canned replies.
    The answer is derived from:
    - key drivers
    - top entities
    - latest phase
    - forecast
    - strategy assumptions
    """

    @staticmethod
    def _normalize_question(text: str) -> str:
        return text.strip().lower()

    def _extract_latest_phase(self, simulation_response: dict[str, Any]) -> dict[str, Any]:
        phases = simulation_response.get("phases", [])
        if not phases:
            raise ValueError("Simulation response does not contain phases")
        return phases[-1]

    def _top_drivers(self, simulation_response: dict[str, Any], decision_output: dict[str, Any]) -> list[str]:
        latest = self._extract_latest_phase(simulation_response)

        drivers = {
            "airport disruption": float(latest.get("airport_stress", 0.0)),
            "shipping stress": float(latest.get("shipping_stress", 0.0)),
            "banking continuity stress": float(latest.get("banking_stress", 0.0)),
            "media amplification": float(latest.get("media_stress", 0.0)),
            "public sentiment stress": float(latest.get("public_stress", 0.0)),
            "energy / oil stress": float(latest.get("energy_stress", 0.0)),
            "market stress": float(latest.get("market_stress", 0.0)),
            "logistics spillover": float(latest.get("logistics_stress", 0.0)),
            "policy / regulatory stress": float(latest.get("policy_stress", 0.0)),
        }

        ranked = sorted(drivers.items(), key=lambda kv: kv[1], reverse=True)
        top = [name for name, _ in ranked[:4]]

        primary = str(decision_output.get("primary_driver", "")).strip().lower()
        if primary and primary not in top:
            top.insert(0, primary)

        return top[:5]

    def _top_entities(self, simulation_response: dict[str, Any]) -> list[str]:
        airports = simulation_response.get("airport_states", [])
        sectors = simulation_response.get("sector_states", [])

        ranked_airports = sorted(
            airports,
            key=lambda x: float(x.get("composite_risk", 0.0)),
            reverse=True,
        )
        ranked_sectors = sorted(
            sectors,
            key=lambda x: float(x.get("composite_impact", 0.0)),
            reverse=True,
        )

        result: list[str] = []
        result.extend([str(a.get("airport_code", "unknown")) for a in ranked_airports[:3]])
        result.extend([str(s.get("sector", "unknown")) for s in ranked_sectors[:3]])
        return result[:6]

    def _counterfactuals(
        self,
        simulation_response: dict[str, Any],
        decision_output: dict[str, Any],
        brief: dict[str, Any],
    ) -> list[str]:
        latest = self._extract_latest_phase(simulation_response)
        airport_stress = float(latest.get("airport_stress", 0.0))
        market_stress = float(latest.get("market_stress", 0.0))
        logistics_stress = float(latest.get("logistics_stress", 0.0))
        critical_window = str(decision_output.get("critical_window", "T0-T1"))

        scenarios = [
            (
                "If intervention occurs before the critical window "
                f"{critical_window}, airport and logistics stress should stabilize earlier."
            ),
            (
                "If airport disruption intensifies from "
                f"{airport_stress:.2f} toward the upper range, tourism and logistics spillovers will deepen."
            ),
            (
                "If market stress rises above the current level of "
                f"{market_stress:.2f}, banking and treasury sensitivity will increase."
            ),
        ]

        if logistics_stress > 0.50:
            scenarios.append(
                "If logistics stress remains elevated, second-order pressure on e-commerce and cargo continuity will persist."
            )

        return scenarios[:4]

    def _answer_why(
        self,
        simulation_response: dict[str, Any],
        decision_output: dict[str, Any],
    ) -> str:
        latest = self._extract_latest_phase(simulation_response)
        drivers = self._top_drivers(simulation_response, decision_output)

        return (
            "The current outcome is driven primarily by "
            + ", ".join(drivers[:3])
            + f". In the latest phase, airport stress reached {float(latest.get('airport_stress', 0.0)):.2f}, "
              f"market stress reached {float(latest.get('market_stress', 0.0)):.2f}, "
              f"and logistics stress reached {float(latest.get('logistics_stress', 0.0)):.2f}."
        )

    def _answer_what_next(
        self,
        brief: dict[str, Any],
    ) -> str:
        forecast = brief.get("forecast", {}) or {}
        base_case = str(forecast.get("base_case", "")).strip()
        pessimistic_case = str(forecast.get("pessimistic_case", "")).strip()

        if base_case:
            return (
                f"Base case: {base_case} "
                f"Key downside scenario: {pessimistic_case}"
            )

        return "The next expected development is continued elevated operational stress until stabilizing interventions reduce propagation."

    def _answer_top_entities(
        self,
        simulation_response: dict[str, Any],
    ) -> str:
        entities = self._top_entities(simulation_response)
        if not entities:
            return "No dominant entities were identified in the current simulation."
        return "The most influential entities in the current simulation are: " + ", ".join(entities[:5]) + "."

    def _answer_actions(
        self,
        decision_output: dict[str, Any],
    ) -> str:
        actions = list(decision_output.get("recommended_actions", []))
        if not actions:
            return "No prioritized actions are currently available."
        return "Recommended actions: " + "; ".join(actions[:4]) + "."

    def _build_answer(
        self,
        question: str,
        simulation_response: dict[str, Any],
        decision_output: dict[str, Any],
        brief: dict[str, Any],
    ) -> str:
        q = self._normalize_question(question)

        if "why" in q or "drive" in q or "reason" in q:
            return self._answer_why(simulation_response, decision_output)

        if "next" in q or "forecast" in q or "estimate" in q:
            return self._answer_what_next(brief)

        if "entity" in q or "actor" in q or "who" in q:
            return self._answer_top_entities(simulation_response)

        if "action" in q or "respond" in q or "do now" in q:
            return self._answer_actions(decision_output)

        latest = self._extract_latest_phase(simulation_response)
        return (
            f"The scenario remains active with total risk at {float(latest.get('total_risk_score', 0.0)):.2f}. "
            f"The primary driver is {decision_output.get('primary_driver', 'multi-factor stress')}, "
            f"and the critical window is {decision_output.get('critical_window', 'T0-T1')}."
        )

    def answer(self, payload: AnalysisQueryRequest) -> AnalysisQueryResponse:
        decision_output = payload.decision_output
        brief = payload.intelligence_brief
        simulation_response = payload.simulation_response

        top_drivers = self._top_drivers(simulation_response, decision_output)
        top_entities = self._top_entities(simulation_response)
        counterfactuals = self._counterfactuals(simulation_response, decision_output, brief)
        answer = self._build_answer(
            question=payload.question,
            simulation_response=simulation_response,
            decision_output=decision_output,
            brief=brief,
        )

        confidence = float(decision_output.get("confidence", 0.0))
        if confidence <= 0:
            confidence = 0.72

        return AnalysisQueryResponse(
            scenario_id=payload.scenario_id,
            answer=answer,
            top_drivers=top_drivers,
            top_entities=top_entities,
            counterfactuals=counterfactuals,
            confidence=confidence,
        )
