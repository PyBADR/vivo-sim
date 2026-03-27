"""Fuel Transmission Engine — models fuel price transmission across sectors.

Formula: FuelImpact_t = μ₁·OilShock_t + μ₂·RefiningStress_t + μ₃·LogisticsDelay_t

Tracks how oil shocks, refining constraints, and logistics delays translate
into fuel cost pressures for aviation, trucking, consumer inflation, and
industrial sectors.
"""
from __future__ import annotations

from typing import Any

from app.scenarios.scenario_coefficients import GCCCrisisConstants


class FuelTransmissionEngine:
    """Models fuel price transmission and sectoral cost impacts."""

    def __init__(self, constants: GCCCrisisConstants | None = None) -> None:
        self.constants = constants or GCCCrisisConstants()
        self.coeff = self.constants.fuel_transmission

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        """Clamp value to [low, high] range."""
        return max(low, min(high, value))

    def compute_fuel_impact(
        self,
        oil_shock: float,
        refining_stress: float,
        logistics_delay: float,
    ) -> float:
        """Compute aggregate fuel impact from shock components.

        Args:
            oil_shock: Oil price shock intensity (0-1)
            refining_stress: Refining capacity stress (0-1)
            logistics_delay: Logistics/transportation delay (0-1)

        Returns:
            Aggregate fuel impact in [0, 1]
        """
        impact = (
            self.coeff.mu_oil_shock * self._clamp(oil_shock)
            + self.coeff.mu_refining_stress * self._clamp(refining_stress)
            + self.coeff.mu_logistics_delay * self._clamp(logistics_delay)
        )
        return self._clamp(impact)

    def compute_sector_transmission(self, fuel_impact: float) -> dict[str, float]:
        """Compute sector-specific cost impacts from aggregate fuel impact.

        Different sectors have different fuel cost sensitivities. Aviation and
        trucking are most exposed; industrial is moderate; consumer inflation
        is lower but broader.

        Args:
            fuel_impact: Aggregate fuel impact (0-1)

        Returns:
            Dict with sector impacts:
                - aviation_costs: (0-1)
                - trucking_costs: (0-1)
                - consumer_inflation: (0-1)
                - industrial_costs: (0-1)
        """
        fuel_impact = self._clamp(fuel_impact)

        # Sector sensitivities to fuel costs
        aviation_costs = self._clamp(fuel_impact * 0.95)  # Very sensitive
        trucking_costs = self._clamp(fuel_impact * 0.90)  # Very sensitive
        industrial_costs = self._clamp(fuel_impact * 0.60)  # Moderate sensitivity
        consumer_inflation = self._clamp(fuel_impact * 0.40)  # Broad but lower pass-through

        return {
            "aviation_costs": aviation_costs,
            "trucking_costs": trucking_costs,
            "consumer_inflation": consumer_inflation,
            "industrial_costs": industrial_costs,
        }

    def compute_fuel_timeline(
        self,
        base_oil_shock: float,
        escalation_factor: float,
        phases: int = 6,
    ) -> list[dict[str, Any]]:
        """Compute fuel impact trajectory over multiple phases.

        Models how fuel shocks propagate and escalate (or dampen) across
        phases of a crisis. Escalation factor > 1.0 indicates worsening
        conditions; < 1.0 indicates recovery.

        Args:
            base_oil_shock: Initial oil shock intensity (0-1)
            escalation_factor: Phase-to-phase multiplier (typically 0.8-1.3)
            phases: Number of phases to project (default 6)

        Returns:
            List of dicts with keys:
                - phase (int): phase number (0-indexed)
                - oil_shock (float): oil shock at this phase
                - fuel_impact (float): aggregate fuel impact (refining+logistics held at base)
                - sector_impacts (dict): sector-specific costs
        """
        timeline = []
        current_shock = self._clamp(base_oil_shock)

        for phase in range(phases):
            fuel_impact = self.compute_fuel_impact(
                current_shock,
                current_shock * 0.5,  # Refining stress proportional to shock
                current_shock * 0.3,  # Logistics delay proportional to shock
            )

            sector_impacts = self.compute_sector_transmission(fuel_impact)

            timeline.append({
                "phase": phase,
                "oil_shock": current_shock,
                "fuel_impact": fuel_impact,
                "sector_impacts": sector_impacts,
            })

            # Update shock for next phase
            current_shock = self._clamp(current_shock * escalation_factor)

        return timeline
