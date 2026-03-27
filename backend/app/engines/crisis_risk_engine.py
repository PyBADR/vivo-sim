"""Crisis-specific risk scoring functions.

Kept separate from the original risk_engine.py to avoid breaking
the existing 8-stage pipeline. These pure functions implement the
user-specified GCC crisis formulas.

RiskScore_i     = α·E + β·X + γ·V + δ·C
ADS_a           = λ₁·R + λ₂·F + λ₃·C + λ₄·I
FuelImpact_t    = μ₁·OilShock + μ₂·RefiningStress + μ₃·LogisticsDelay
EDS             = θ₁·Delay + θ₂·InventoryStress + θ₃·DemandVolatility + θ₄·PaymentFriction
"""
from app.config.crisis_constants import (
    RISK_WEIGHTS,
    AIRPORT_WEIGHTS,
    FUEL_WEIGHTS,
    ECOM_WEIGHTS,
)


def clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, value))


def risk_score(
    exposure: float,
    external_shock: float,
    vulnerability: float,
    criticality: float,
) -> float:
    """RiskScore_i = α·E_i + β·X_i + γ·V_i + δ·C_i"""
    score = (
        RISK_WEIGHTS.exposure * exposure
        + RISK_WEIGHTS.external_shock * external_shock
        + RISK_WEIGHTS.vulnerability * vulnerability
        + RISK_WEIGHTS.criticality * criticality
    )
    return round(clamp(score), 4)


def airport_disruption_score(
    rerouting_pressure: float,
    fuel_stress: float,
    congestion_pressure: float,
    insurance_operating_stress: float,
) -> float:
    """ADS_a = λ₁·R_a + λ₂·F_a + λ₃·C_a + λ₄·I_a"""
    score = (
        AIRPORT_WEIGHTS.rerouting_pressure * rerouting_pressure
        + AIRPORT_WEIGHTS.fuel_stress * fuel_stress
        + AIRPORT_WEIGHTS.congestion_pressure * congestion_pressure
        + AIRPORT_WEIGHTS.insurance_operating_stress * insurance_operating_stress
    )
    return round(clamp(score), 4)


def fuel_impact_score(
    oil_shock: float,
    refining_stress: float,
    logistics_delay: float,
) -> float:
    """FuelImpact_t = μ₁·OilShock_t + μ₂·RefiningStress_t + μ₃·LogisticsDelay_t"""
    score = (
        FUEL_WEIGHTS.oil_shock * oil_shock
        + FUEL_WEIGHTS.refining_stress * refining_stress
        + FUEL_WEIGHTS.logistics_delay * logistics_delay
    )
    return round(clamp(score), 4)


def ecommerce_disruption_score(
    delay: float,
    inventory_stress: float,
    demand_volatility: float,
    payment_friction: float,
) -> float:
    """EDS = θ₁·Delay + θ₂·InventoryStress + θ₃·DemandVolatility + θ₄·PaymentFriction"""
    score = (
        ECOM_WEIGHTS.delay * delay
        + ECOM_WEIGHTS.inventory_stress * inventory_stress
        + ECOM_WEIGHTS.demand_volatility * demand_volatility
        + ECOM_WEIGHTS.payment_friction * payment_friction
    )
    return round(clamp(score), 4)
