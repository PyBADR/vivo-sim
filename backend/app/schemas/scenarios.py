"""Scenario pack API schemas.

Pydantic v2 models for scenario pack listing, presets, airports,
and impact computation endpoints.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import Field

from app.schemas.common import DeevoBaseModel


class ScenarioPackSummary(DeevoBaseModel):
    """Summary of a scenario pack for listing endpoints."""
    pack_id: str = Field(..., description="Unique scenario pack identifier")
    title_en: str = Field(..., description="English title")
    title_ar: str = Field(..., description="Arabic title")
    description_en: str = Field(..., description="English description")
    description_ar: str = Field(..., description="Arabic description")


class ScenarioPreset(DeevoBaseModel):
    """Preset scenario for ScenarioComposer."""
    id: str = Field(..., description="Unique preset identifier")
    title_en: str = Field(..., description="English title")
    title_ar: str = Field(..., description="Arabic title")
    description_en: str = Field(..., description="English description")
    description_ar: str = Field(..., description="Arabic description")
    raw_text_en: str = Field(..., description="Raw scenario text in English")
    raw_text_ar: str = Field(..., description="Raw scenario text in Arabic")


class AirportNodeResponse(DeevoBaseModel):
    """GCC airport node with metadata."""
    code: str = Field(..., description="IATA airport code")
    name: str = Field(..., description="Official airport name")
    city: str = Field(..., description="Primary city served")
    country: str = Field(..., description="Country/emirate")
    hub_importance: float = Field(..., ge=0.0, le=1.0, description="Regional connectivity weight")
    cargo_relevance: float = Field(..., ge=0.0, le=1.0, description="Freight criticality weight")
    fuel_dependency: float = Field(..., ge=0.0, le=1.0, description="Fuel supply dependency")
    strait_proximity: float = Field(..., ge=0.0, le=1.0, description="Strait of Hormuz exposure")
    latitude: float = Field(..., description="Decimal degrees")
    longitude: float = Field(..., description="Decimal degrees")


class PerAirportDisruption(DeevoBaseModel):
    """Per-airport disruption details."""
    code: str = Field(..., description="IATA airport code")
    name: str = Field(..., description="Airport name")
    disruption_score: float = Field(..., ge=0.0, le=1.0, description="Airport Disruption Score")
    classification: str = Field(..., description="Disruption classification: minimal/moderate/severe/critical")
    rerouting_pressure: float = Field(..., ge=0.0, le=1.0, description="Rerouting pressure")
    fuel_stress: float = Field(..., ge=0.0, le=1.0, description="Fuel stress")
    congestion: float = Field(..., ge=0.0, le=1.0, description="Congestion pressure")
    insurance_stress: float = Field(..., ge=0.0, le=1.0, description="Insurance/operating cost stress")


class AirportImpactRequest(DeevoBaseModel):
    """Request for airport disruption impact computation."""
    scenario_id: str = Field(..., description="Scenario identifier")
    escalation_level: float = Field(..., ge=0.0, le=1.0, description="Overall escalation level")
    strait_disruption: float = Field(..., ge=0.0, le=1.0, description="Strait of Hormuz disruption intensity")
    airspace_closure_level: float = Field(..., ge=0.0, le=1.0, description="Airspace closure level")
    fuel_shock: float = Field(..., ge=0.0, le=1.0, description="Fuel shock intensity")


class AirportImpactResponse(DeevoBaseModel):
    """Response for airport disruption impact computation."""
    scenario_id: str = Field(..., description="Scenario identifier")
    global_rerouting_pressure: float = Field(..., ge=0.0, le=1.0, description="Global rerouting pressure")
    fuel_shock_intensity: float = Field(..., ge=0.0, le=1.0, description="Fuel shock intensity")
    network_congestion: float = Field(..., ge=0.0, le=1.0, description="Network congestion level")
    insurance_cost_escalation: float = Field(..., ge=0.0, le=1.0, description="Insurance cost escalation")
    per_airport: List[PerAirportDisruption] = Field(default_factory=list, description="Per-airport disruption scores")


class FuelImpactRequest(DeevoBaseModel):
    """Request for fuel transmission impact computation."""
    scenario_id: str = Field(..., description="Scenario identifier")
    oil_shock: float = Field(..., ge=0.0, le=1.0, description="Oil price shock intensity")
    refining_stress: float = Field(..., ge=0.0, le=1.0, description="Refining capacity stress")
    logistics_delay: float = Field(..., ge=0.0, le=1.0, description="Logistics/transportation delay")


class FuelImpactTimeline(DeevoBaseModel):
    """Fuel impact trajectory for a single phase."""
    phase: int = Field(..., ge=0, description="Phase number (0-indexed)")
    oil_shock: float = Field(..., ge=0.0, le=1.0, description="Oil shock at this phase")
    fuel_impact: float = Field(..., ge=0.0, le=1.0, description="Aggregate fuel impact")
    sector_impacts: dict[str, float] = Field(default_factory=dict, description="Sector-specific costs")


class FuelImpactResponse(DeevoBaseModel):
    """Response for fuel transmission impact computation."""
    scenario_id: str = Field(..., description="Scenario identifier")
    fuel_impact: float = Field(..., ge=0.0, le=1.0, description="Aggregate fuel impact")
    sector_transmission: dict[str, float] = Field(default_factory=dict, description="Sector-specific impacts")
    timeline: List[FuelImpactTimeline] = Field(default_factory=list, description="Impact trajectory over phases")


class ECommerceImpactRequest(DeevoBaseModel):
    """Request for e-commerce disruption impact computation."""
    scenario_id: str = Field(..., description="Scenario identifier")
    delivery_delay: float = Field(..., ge=0.0, le=1.0, description="Delivery delay pressure")
    inventory_stress: float = Field(..., ge=0.0, le=1.0, description="Inventory shortage/stress")
    demand_volatility: float = Field(..., ge=0.0, le=1.0, description="Demand volatility and uncertainty")
    payment_friction: float = Field(..., ge=0.0, le=1.0, description="Payment system friction")


class ECommerceImpactResponse(DeevoBaseModel):
    """Response for e-commerce disruption impact computation."""
    scenario_id: str = Field(..., description="Scenario identifier")
    eds_score: float = Field(..., ge=0.0, le=1.0, description="E-Commerce Disruption Score")
    classification: str = Field(..., description="Disruption classification: low/moderate/high/severe")
    breakdown: dict[str, float] = Field(default_factory=dict, description="Trade impact dimensions")
