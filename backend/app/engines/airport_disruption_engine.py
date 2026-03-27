"""Airport Disruption Engine — computes Airport Disruption Scores (ADS).

Formula: ADS_a = λ₁R_a + λ₂F_a + λ₃C_a + λ₄I_a

Where:
  R_a = rerouting pressure (0-1)
  F_a = fuel stress (0-1)
  C_a = congestion pressure (0-1)
  I_a = insurance/operating cost stress (0-1)
"""
from __future__ import annotations

from typing import Any

from app.scenarios.scenario_coefficients import GCCCrisisConstants


class AirportDisruptionEngine:
    """Computes disruption scores for airport nodes under crisis scenarios."""

    def __init__(self, constants: GCCCrisisConstants | None = None) -> None:
        self.constants = constants or GCCCrisisConstants()
        self.coeff = self.constants.airport_disruption

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        """Clamp value to [low, high] range."""
        return max(low, min(high, value))

    def compute_disruption_score(
        self,
        rerouting: float,
        fuel_stress: float,
        congestion: float,
        insurance_stress: float,
    ) -> float:
        """Compute airport disruption score from component pressures.

        Args:
            rerouting: Rerouting pressure (0-1)
            fuel_stress: Fuel stress (0-1)
            congestion: Congestion pressure (0-1)
            insurance_stress: Insurance/operating cost stress (0-1)

        Returns:
            Disruption score in [0, 1]
        """
        score = (
            self.coeff.lambda_rerouting * self._clamp(rerouting)
            + self.coeff.lambda_fuel * self._clamp(fuel_stress)
            + self.coeff.lambda_congestion * self._clamp(congestion)
            + self.coeff.lambda_insurance * self._clamp(insurance_stress)
        )
        return self._clamp(score)

    def compute_airport_states(
        self,
        airports: list[dict[str, Any]],
        scenario_context: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """Compute disruption scores for a list of airport nodes.

        Derives rerouting, fuel, congestion, and insurance pressures from
        airport metadata (strait_proximity, hub_importance, cargo_relevance,
        fuel_dependency) and crisis context, then computes per-airport ADS.

        Args:
            airports: List of airport node dicts with keys:
                - airport_id (str)
                - strait_proximity (float, 0-1): proximity to critical straits
                - hub_importance (float, 0-1): hub centrality
                - cargo_relevance (float, 0-1): cargo traffic relevance
                - fuel_dependency (float, 0-1): fuel supply dependency
            scenario_context: Dict with crisis metadata:
                - global_rerouting_pressure (float, 0-1)
                - fuel_shock_intensity (float, 0-1)
                - network_congestion (float, 0-1)
                - insurance_cost_escalation (float, 0-1)

        Returns:
            List of dicts with keys:
                - airport_id (str)
                - rerouting_pressure (float)
                - fuel_stress (float)
                - congestion_pressure (float)
                - insurance_stress (float)
                - disruption_score (float)
                - classification (str): "minimal" / "moderate" / "severe" / "critical"
        """
        global_rerouting = scenario_context.get("global_rerouting_pressure", 0.0)
        fuel_shock = scenario_context.get("fuel_shock_intensity", 0.0)
        global_congestion = scenario_context.get("network_congestion", 0.0)
        insurance_escalation = scenario_context.get("insurance_cost_escalation", 0.0)

        results = []
        for airport in airports:
            airport_id = airport.get("airport_id", "unknown")
            strait_proximity = self._clamp(airport.get("strait_proximity", 0.0))
            hub_importance = self._clamp(airport.get("hub_importance", 0.0))
            cargo_relevance = self._clamp(airport.get("cargo_relevance", 0.0))
            fuel_dependency = self._clamp(airport.get("fuel_dependency", 0.0))

            # Derive component pressures from metadata and context
            rerouting_pressure = self._clamp(
                global_rerouting * (0.5 * hub_importance + 0.5 * strait_proximity)
            )
            fuel_stress = self._clamp(fuel_shock * fuel_dependency)
            congestion_pressure = self._clamp(
                global_congestion * (0.6 * hub_importance + 0.4 * cargo_relevance)
            )
            insurance_stress = self._clamp(
                insurance_escalation * (0.5 * hub_importance + 0.5 * fuel_dependency)
            )

            disruption_score = self.compute_disruption_score(
                rerouting_pressure, fuel_stress, congestion_pressure, insurance_stress
            )

            results.append({
                "airport_id": airport_id,
                "rerouting_pressure": rerouting_pressure,
                "fuel_stress": fuel_stress,
                "congestion_pressure": congestion_pressure,
                "insurance_stress": insurance_stress,
                "disruption_score": disruption_score,
                "classification": self.classify_disruption(disruption_score),
            })

        return results

    def classify_disruption(self, score: float) -> str:
        """Classify disruption severity based on score thresholds.

        Args:
            score: Disruption score in [0, 1]

        Returns:
            Classification: "minimal" / "moderate" / "severe" / "critical"
        """
        if score < 0.25:
            return "minimal"
        if score < 0.50:
            return "moderate"
        if score < 0.75:
            return "severe"
        return "critical"
