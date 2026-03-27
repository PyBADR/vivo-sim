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


def maritime_trade_score(
    chokepoint: float,
    port_delay: float,
    insurance_surge: float,
    rerouting: float,
) -> float:
    """Maritime Trade Impact Score.

    MTS = 0.35·ChokePoint + 0.30·PortDelay + 0.20·InsuranceSurge + 0.15·Rerouting
    """
    score = (
        0.35 * chokepoint
        + 0.30 * port_delay
        + 0.20 * insurance_surge
        + 0.15 * rerouting
    )
    return round(clamp(score), 4)


def market_stress_score(
    oil_volatility: float,
    liquidity: float,
    sentiment: float,
    repricing: float,
) -> float:
    """Financial Market Stress Impact Score.

    MSS = 0.38·OilVolatility + 0.28·LiquidityStress + 0.20·SentimentShock + 0.14·InsuranceRepricing
    """
    score = (
        0.38 * oil_volatility
        + 0.28 * liquidity
        + 0.20 * sentiment
        + 0.14 * repricing
    )
    return round(clamp(score), 4)


def supply_chain_score(
    food: float,
    medicine: float,
    cargo: float,
    last_mile: float,
) -> float:
    """Supply Chain Impact Score.

    SCS = 0.28·FoodImports + 0.25·MedicineSupply + 0.32·AirportCargo + 0.15·LastMile
    """
    score = (
        0.28 * food
        + 0.25 * medicine
        + 0.32 * cargo
        + 0.15 * last_mile
    )
    return round(clamp(score), 4)


def public_reaction_score(
    panic: float,
    media: float,
    trust_loss: float,
    stabilization: float,
) -> float:
    """Public Reaction Impact Score.

    PRS = 0.30·PanicBuying + 0.28·MediaAmplification + 0.25·TrustLoss − 0.23·OfficialStabilization
    """
    score = (
        0.30 * panic
        + 0.28 * media
        + 0.25 * trust_loss
        - 0.23 * stabilization
    )
    return round(clamp(score), 4)
