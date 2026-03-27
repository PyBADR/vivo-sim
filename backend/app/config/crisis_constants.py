"""GCC Crisis Intelligence Pack — Mathematical Coefficients.

Frozen dataclass singletons for all crisis scoring formulas.

RiskScore_i     = α·E + β·X + γ·V + δ·C
ADS_a           = λ₁·R + λ₂·F + λ₃·C + λ₄·I
FuelImpact_t    = μ₁·OilShock + μ₂·RefiningStress + μ₃·LogisticsDelay
EDS             = θ₁·Delay + θ₂·InventoryStress + θ₃·DemandVolatility + θ₄·PaymentFriction
ActionScore(a)  = η₁·RR + η₂·Feas + η₃·Time − η₄·Cost − η₅·SecondOrder
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class RiskWeights:
    """RiskScore_i = α·E_i + β·X_i + γ·V_i + δ·C_i"""
    exposure: float = 0.30
    external_shock: float = 0.30
    vulnerability: float = 0.20
    criticality: float = 0.20


@dataclass(frozen=True)
class AirportDisruptionWeights:
    """ADS_a = λ₁·R_a + λ₂·F_a + λ₃·C_a + λ₄·I_a"""
    rerouting_pressure: float = 0.30
    fuel_stress: float = 0.25
    congestion_pressure: float = 0.25
    insurance_operating_stress: float = 0.20


@dataclass(frozen=True)
class FuelImpactWeights:
    """FuelImpact_t = μ₁·OilShock_t + μ₂·RefiningStress_t + μ₃·LogisticsDelay_t"""
    oil_shock: float = 0.45
    refining_stress: float = 0.30
    logistics_delay: float = 0.25


@dataclass(frozen=True)
class ECommerceWeights:
    """EDS = θ₁·Delay + θ₂·InventoryStress + θ₃·DemandVolatility + θ₄·PaymentFriction"""
    delay: float = 0.35
    inventory_stress: float = 0.25
    demand_volatility: float = 0.20
    payment_friction: float = 0.20


@dataclass(frozen=True)
class ActionWeights:
    """ActionScore(a) = η₁·RR + η₂·Feas + η₃·Time − η₄·Cost − η₅·SecondOrder"""
    risk_reduction: float = 0.35
    feasibility: float = 0.20
    timeliness: float = 0.20
    cost: float = 0.15
    second_order_risk: float = 0.10


RISK_WEIGHTS = RiskWeights()
AIRPORT_WEIGHTS = AirportDisruptionWeights()
FUEL_WEIGHTS = FuelImpactWeights()
ECOM_WEIGHTS = ECommerceWeights()
ACTION_WEIGHTS = ActionWeights()
