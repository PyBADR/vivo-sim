"""Mathematical coefficients for GCC Crisis Intelligence scenario layers.

Specialized weights and constants that govern crisis propagation dynamics
within specific scenario domains (aviation, fuel, e-commerce, risk scoring).

These coefficients apply layer-specific adjustments to the base mathematical
pipeline defined in app.config.math_constants.

Pipeline adaptation: x → S → Σ → G → Ĝ → Z(0:T) → D → B → Q
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True, slots=True)
class AirportDisruptionCoefficients:
    """w_airport = λ_reroute·rerouting + λ_fuel·fuel_access + λ_congestion·congestion + λ_insurance·insurance_friction

    Controls how airport nodes propagate disruption through aviation layer.
    """
    lambda_rerouting: float = 0.30        # flight rerouting feasibility
    lambda_fuel: float = 0.25              # fuel availability at alternate airports
    lambda_congestion: float = 0.25        # capacity saturation at reroute destinations
    lambda_insurance: float = 0.20         # insurance claim delays, coverage gaps


@dataclass(frozen=True, slots=True)
class FuelTransmissionCoefficients:
    """w_fuel = μ_shock·oil_shock + μ_refining·refining_stress + μ_logistics·logistics_delay

    Controls energy layer propagation from global oil price shock through refining
    capacity to refined fuel delivery constraints.
    """
    mu_oil_shock: float = 0.45             # global oil price shock transmission
    mu_refining_stress: float = 0.30       # facility damage/sanctions impact on capacity
    mu_logistics_delay: float = 0.25       # trucking/shipping delays in fuel distribution


@dataclass(frozen=True, slots=True)
class ECommerceDisruptionCoefficients:
    """w_ecom = θ_delay·transit_delay + θ_inventory·inventory_depletion + θ_demand·demand_volatility + θ_payment·payment_friction

    Controls trade/e-commerce layer propagation from port congestion through
    inventory cycles to fulfillment SLA breaches.
    """
    theta_delay: float = 0.30              # port/customs delay transmission to fulfillment
    theta_inventory: float = 0.25          # inventory depletion rate (demand runs stockouts)
    theta_demand_volatility: float = 0.25  # panic buying/hoarding amplification
    theta_payment_friction: float = 0.20   # cross-border payment delays, FX volatility


@dataclass(frozen=True, slots=True)
class RiskScoreV2Coefficients:
    """R(entity) = α·exposure + β·shock_sensitivity + γ·vulnerability + δ·criticality

    Scenario-specific risk scoring for entity nodes, emphasizing crisis-layer factors
    over generic network topology.
    """
    alpha_exposure: float = 0.30           # direct exposure to shock zone (geographic, sectoral)
    beta_shock: float = 0.25               # sensitivity to scenario's primary shock
    gamma_vulnerability: float = 0.25      # internal capacity to absorb disruption
    delta_criticality: float = 0.20        # downstream dependency count (outdegree weight)


@dataclass(frozen=True, slots=True)
class GCCCrisisConstants:
    """Root container for all scenario-layer mathematical coefficients.

    Used to adapt base propagation pipeline (math_constants.py) to domain-specific
    crisis scenarios (aviation disruption, fuel supply chains, e-commerce logistics, etc.).

    Usage:
        from app.scenarios import GCCCrisisConstants
        gcc = GCCCrisisConstants()
        airport_weight = gcc.airport.lambda_rerouting * rerouting_factor
        fuel_weight = gcc.fuel.mu_oil_shock * shock_magnitude
    """
    airport: AirportDisruptionCoefficients = field(default_factory=AirportDisruptionCoefficients)
    fuel: FuelTransmissionCoefficients = field(default_factory=FuelTransmissionCoefficients)
    ecommerce: ECommerceDisruptionCoefficients = field(default_factory=ECommerceDisruptionCoefficients)
    risk_score: RiskScoreV2Coefficients = field(default_factory=RiskScoreV2Coefficients)
