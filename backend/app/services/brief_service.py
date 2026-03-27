from __future__ import annotations

from typing import Any

from app.schemas.brief import (
    BriefGenerateRequest,
    BusinessImpactBlock,
    ForecastBlock,
    IntelligenceBrief,
)


class BriefService:
    """
    Builds an executive intelligence brief from computed simulation + decision outputs.

    No hardcoded narrative.
    The brief is derived from:
    - latest phase metrics
    - airport / sector / market states
    - decision output
    - confidence + assumptions
    """

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def _extract_latest_phase(self, simulation_response: dict[str, Any]) -> dict[str, Any]:
        phases = simulation_response.get("phases", [])
        if not phases:
            raise ValueError("Simulation response does not contain phases")
        return phases[-1]

    def _extract_phase_summaries(self, simulation_response: dict[str, Any]) -> list[dict[str, Any]]:
        return simulation_response.get("phases", [])

    def _top_airports(self, simulation_response: dict[str, Any], limit: int = 3) -> list[str]:
        airport_states = simulation_response.get("airport_states", [])
        ranked = sorted(
            airport_states,
            key=lambda x: float(x.get("composite_risk", 0.0)),
            reverse=True,
        )
        return [str(item.get("airport_code", "unknown")) for item in ranked[:limit]]

    def _top_sectors(self, simulation_response: dict[str, Any], limit: int = 4) -> list[str]:
        sector_states = simulation_response.get("sector_states", [])
        ranked = sorted(
            sector_states,
            key=lambda x: float(x.get("composite_impact", 0.0)),
            reverse=True,
        )
        return [str(item.get("sector", "unknown")) for item in ranked[:limit]]

    def _impact_label(self, value: float) -> str:
        if value < 0.25:
            return "low"
        if value < 0.50:
            return "medium"
        if value < 0.75:
            return "high"
        return "critical"

    def _build_scenario_summary(
        self,
        decision_output: dict[str, Any],
        simulation_response: dict[str, Any],
    ) -> str:
        latest = self._extract_latest_phase(simulation_response)
        top_airports = self._top_airports(simulation_response, limit=2)
        driver = str(decision_output.get("primary_driver", "multi-factor stress")).lower()
        risk_level = str(decision_output.get("risk_level", "Unknown"))
        risk_score = float(decision_output.get("risk_score", 0.0))
        spread_velocity = float(decision_output.get("spread_velocity", 0.0))

        airport_text = ", ".join(top_airports) if top_airports else "key regional airports"

        return (
            f"The scenario is currently assessed as {risk_level} risk "
            f"(score {risk_score:.2f}) with spread velocity at {spread_velocity:.2f}. "
            f"The dominant pressure is {driver}, with the strongest operational exposure "
            f"currently concentrated around {airport_text}."
        )

    def _build_timeline_narrative(self, simulation_response: dict[str, Any]) -> str:
        phases = self._extract_phase_summaries(simulation_response)
        if not phases:
            return "No simulation phases were available."

        parts: list[str] = []
        for phase in phases:
            label = str(phase.get("label", phase.get("phase", "Unknown phase")))
            risk = float(phase.get("total_risk_score", 0.0))
            airport = float(phase.get("airport_stress", 0.0))
            market = float(phase.get("market_stress", 0.0))
            logistics = float(phase.get("logistics_stress", 0.0))

            dominant_dimension = max(
                [
                    ("airport disruption", airport),
                    ("market stress", market),
                    ("logistics spillover", logistics),
                ],
                key=lambda kv: kv[1],
            )[0]

            parts.append(
                f"{label}: total risk reached {risk:.2f}, driven mainly by {dominant_dimension}."
            )

        return " ".join(parts)

    def _build_key_drivers(
        self,
        decision_output: dict[str, Any],
        simulation_response: dict[str, Any],
    ) -> list[str]:
        latest = self._extract_latest_phase(simulation_response)

        driver_candidates = {
            "Airport disruption stress": float(latest.get("airport_stress", 0.0)),
            "Shipping / chokepoint stress": float(latest.get("shipping_stress", 0.0)),
            "Banking continuity stress": float(latest.get("banking_stress", 0.0)),
            "Media amplification": float(latest.get("media_stress", 0.0)),
            "Public sentiment stress": float(latest.get("public_stress", 0.0)),
            "Energy / oil stress": float(latest.get("energy_stress", 0.0)),
            "Market stress": float(latest.get("market_stress", 0.0)),
            "Logistics spillover": float(latest.get("logistics_stress", 0.0)),
            "Policy / regulatory stress": float(latest.get("policy_stress", 0.0)),
        }

        ranked = sorted(driver_candidates.items(), key=lambda kv: kv[1], reverse=True)
        top = [name for name, _ in ranked[:4]]

        primary_driver = str(decision_output.get("primary_driver", "")).strip()
        if primary_driver and primary_driver not in top:
            top.insert(0, primary_driver)

        seen = set()
        deduped = []
        for item in top:
            if item not in seen:
                seen.add(item)
                deduped.append(item)

        return deduped[:5]

    def _build_entity_influence(self, simulation_response: dict[str, Any]) -> list[str]:
        airports = self._top_airports(simulation_response, limit=3)
        sectors = self._top_sectors(simulation_response, limit=3)
        return airports + sectors

    def _build_forecast(
        self,
        decision_output: dict[str, Any],
        simulation_response: dict[str, Any],
    ) -> ForecastBlock:
        latest = self._extract_latest_phase(simulation_response)
        risk_score = float(decision_output.get("risk_score", 0.0))
        airport_stress = float(latest.get("airport_stress", 0.0))
        market_stress = float(latest.get("market_stress", 0.0))
        logistics_stress = float(latest.get("logistics_stress", 0.0))
        critical_window = str(decision_output.get("critical_window", "T0-T1"))

        base_case = (
            f"Base case: elevated stress persists through {critical_window}, "
            f"with airport pressure at {airport_stress:.2f}, market stress at {market_stress:.2f}, "
            f"and logistics spillover at {logistics_stress:.2f} before gradual stabilization."
        )

        pessimistic_case = (
            f"Pessimistic case: risk escalates beyond the current score of {risk_score:.2f}, "
            f"airport disruption deepens, and second-order spillovers intensify across logistics, "
            f"tourism, and customer-facing sectors."
        )

        controlled_response_case = (
            "Controlled-response case: timely intervention and transparent communication reduce "
            "operational stress, lower spread velocity, and compress second-order spillovers."
        )

        return ForecastBlock(
            base_case=base_case,
            pessimistic_case=pessimistic_case,
            controlled_response_case=controlled_response_case,
        )

    def _build_business_impact(self, simulation_response: dict[str, Any]) -> BusinessImpactBlock:
        airport_states = simulation_response.get("airport_states", [])
        sector_states = simulation_response.get("sector_states", [])
        latest_market = simulation_response.get("market_state", {}) or {}

        avg_airport = (
            sum(float(a.get("composite_risk", 0.0)) for a in airport_states) / len(airport_states)
            if airport_states
            else 0.0
        )

        sector_map = {
            str(s.get("sector", "unknown")): float(s.get("composite_impact", 0.0))
            for s in sector_states
        }

        airports_label = self._impact_label(avg_airport)
        logistics_label = self._impact_label(sector_map.get("logistics", 0.0))
        tourism_label = self._impact_label(sector_map.get("tourism", 0.0))
        banking_label = self._impact_label(sector_map.get("banking", 0.0))
        ecommerce_label = self._impact_label(sector_map.get("ecommerce", 0.0))
        energy_label = self._impact_label(float(latest_market.get("oil_stress", 0.0)))

        return BusinessImpactBlock(
            airports=airports_label,
            logistics=logistics_label,
            tourism=tourism_label,
            banking=banking_label,
            ecommerce=ecommerce_label,
            energy=energy_label,
        )

    def generate(self, payload: BriefGenerateRequest) -> IntelligenceBrief:
        decision_output = payload.decision_output
        simulation_response = payload.simulation_response

        scenario_summary = self._build_scenario_summary(decision_output, simulation_response)
        timeline_narrative = self._build_timeline_narrative(simulation_response)
        key_drivers = self._build_key_drivers(decision_output, simulation_response)
        entity_influence = self._build_entity_influence(simulation_response)
        forecast = self._build_forecast(decision_output, simulation_response)
        business_impact = self._build_business_impact(simulation_response)
        recommended_actions = list(decision_output.get("recommended_actions", []))
        assumptions = list(decision_output.get("assumptions", []))
        confidence = float(decision_output.get("confidence", 0.0))

        return IntelligenceBrief(
            scenario_id=payload.scenario_id,
            scenario_summary=scenario_summary,
            timeline_narrative=timeline_narrative,
            key_drivers=key_drivers,
            entity_influence=entity_influence,
            forecast=forecast,
            business_impact=business_impact,
            recommended_actions=recommended_actions,
            assumptions=assumptions,
            confidence=confidence,
        )
