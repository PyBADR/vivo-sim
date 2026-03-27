"""E-Commerce Disruption Engine — scores supply chain and trade disruption.

Formula: EDS = θ₁·Delay + θ₂·InventoryStress + θ₃·DemandVolatility + θ₄·PaymentFriction

Models how disruptions in shipping, inventory management, demand fluctuations,
and payment systems impact e-commerce fulfillment, cross-border trade, and
warehouse operations.
"""
from __future__ import annotations

from typing import Any

from app.scenarios.scenario_coefficients import GCCCrisisConstants


class ECommerceDisruptionEngine:
    """Computes e-commerce and trade disruption scores."""

    def __init__(self, constants: GCCCrisisConstants | None = None) -> None:
        self.constants = constants or GCCCrisisConstants()
        self.coeff = self.constants.ecommerce_disruption

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        """Clamp value to [low, high] range."""
        return max(low, min(high, value))

    def compute_disruption_score(
        self,
        delay: float,
        inventory_stress: float,
        demand_volatility: float,
        payment_friction: float,
    ) -> float:
        """Compute e-commerce disruption score from component factors.

        Args:
            delay: Fulfillment delay pressure (0-1)
            inventory_stress: Inventory shortage/stress (0-1)
            demand_volatility: Demand volatility and uncertainty (0-1)
            payment_friction: Payment system friction/failures (0-1)

        Returns:
            Disruption score in [0, 1]
        """
        score = (
            self.coeff.theta_delay * self._clamp(delay)
            + self.coeff.theta_inventory * self._clamp(inventory_stress)
            + self.coeff.theta_demand_volatility * self._clamp(demand_volatility)
            + self.coeff.theta_payment_friction * self._clamp(payment_friction)
        )
        return self._clamp(score)

    def compute_trade_impact(self, scenario_context: dict[str, Any]) -> dict[str, float]:
        """Compute trade impact across multiple dimensions.

        Args:
            scenario_context: Dict with crisis parameters:
                - shipping_delay (float, 0-1): shipping delay intensity
                - inventory_shortage (float, 0-1): inventory pressure
                - demand_shock (float, 0-1): demand volatility
                - payment_system_stress (float, 0-1): payment system stress
                - border_congestion (float, 0-1): customs/border delays
                - warehouse_capacity_stress (float, 0-1): warehouse utilization

        Returns:
            Dict with trade impact metrics:
                - fulfillment_delay_score (float): fulfillment delays
                - demand_volatility_score (float): demand unpredictability
                - refund_pressure (float): refund/return pressure
                - cross_border_risk (float): cross-border trade friction
                - warehouse_stress (float): warehouse capacity stress
        """
        shipping_delay = self._clamp(scenario_context.get("shipping_delay", 0.0))
        inventory_shortage = self._clamp(scenario_context.get("inventory_shortage", 0.0))
        demand_shock = self._clamp(scenario_context.get("demand_shock", 0.0))
        payment_stress = self._clamp(scenario_context.get("payment_system_stress", 0.0))
        border_congestion = self._clamp(scenario_context.get("border_congestion", 0.0))
        warehouse_stress = self._clamp(scenario_context.get("warehouse_capacity_stress", 0.0))

        # Fulfillment delay: driven by shipping delays and inventory
        fulfillment_delay = self._clamp(
            0.6 * shipping_delay + 0.4 * inventory_shortage
        )

        # Demand volatility: from demand shock and inventory stress feedback
        demand_volatility = self._clamp(
            0.7 * demand_shock + 0.3 * inventory_shortage
        )

        # Refund pressure: from payment friction and demand volatility
        refund_pressure = self._clamp(
            0.5 * payment_stress + 0.5 * demand_volatility
        )

        # Cross-border risk: from border congestion and payment stress
        cross_border_risk = self._clamp(
            0.6 * border_congestion + 0.4 * payment_stress
        )

        return {
            "fulfillment_delay_score": fulfillment_delay,
            "demand_volatility_score": demand_volatility,
            "refund_pressure": refund_pressure,
            "cross_border_risk": cross_border_risk,
            "warehouse_stress": warehouse_stress,
        }

    def classify_disruption(self, score: float) -> str:
        """Classify e-commerce disruption severity based on score.

        Args:
            score: Disruption score in [0, 1]

        Returns:
            Classification: "low" / "moderate" / "high" / "severe"
        """
        if score < 0.25:
            return "low"
        if score < 0.50:
            return "moderate"
        if score < 0.75:
            return "high"
        return "severe"
