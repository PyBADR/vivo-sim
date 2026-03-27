from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class DeevoBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="forbid",
        str_strip_whitespace=True,
        use_enum_values=True,
    )


class Region(str, Enum):
    GCC = "GCC"
    SAUDI = "Saudi"
    UAE = "UAE"
    QATAR = "Qatar"
    KUWAIT = "Kuwait"
    BAHRAIN = "Bahrain"
    OMAN = "Oman"
    MULTI_REGION = "Multi-region"


class TriggerType(str, Enum):
    AIRSPACE = "airspace"
    SHIPPING = "shipping"
    BANKING = "banking"
    MARKET = "market"
    MILITARY = "military"
    POLICY = "policy"
    SOCIAL = "social"


class Domain(str, Enum):
    AVIATION = "aviation"
    ENERGY = "energy"
    BANKING = "banking"
    LOGISTICS = "logistics"
    ECOMMERCE = "ecommerce"
    TOURISM = "tourism"
    INSURANCE = "insurance"
    PUBLIC_SECTOR = "public_sector"
    PRIVATE_SECTOR = "private_sector"
    MULTI_SECTOR = "multi_sector"


class SignalKind(str, Enum):
    STRUCTURED = "structured"
    UNSTRUCTURED = "unstructured"
    MARKET = "market"


class SignalCategory(str, Enum):
    AVIATION = "aviation"
    SHIPPING = "shipping"
    BANKING = "banking"
    MEDIA = "media"
    MARKET = "market"
    POLICY = "policy"
    ENERGY = "energy"
    SOCIAL = "social"
    LOGISTICS = "logistics"


class ConstraintType(str, Enum):
    CZIB = "CZIB"
    NOTAM = "NOTAM"
    ROUTE_CLOSURE = "route_closure"
    BANK_CONTINUITY = "bank_continuity"
    PORT_DISRUPTION = "port_disruption"


class EntityType(str, Enum):
    COUNTRY = "country"
    AIRPORT = "airport"
    AIRLINE = "airline"
    BANK = "bank"
    PORT = "port"
    MINISTRY = "ministry"
    REGULATOR = "regulator"
    PLATFORM = "platform"
    MEDIA = "media"
    COMMODITY = "commodity"
    SECTOR = "sector"
    PUBLIC_CLUSTER = "public_cluster"
    PRIVATE_CLUSTER = "private_cluster"
    ROUTE = "route"


class EdgeType(str, Enum):
    OPERATES_IN = "operates_in"
    ROUTES_THROUGH = "routes_through"
    DEPENDS_ON = "depends_on"
    EXPOSED_TO = "exposed_to"
    REGULATES = "regulates"
    INFLUENCES = "influences"
    SUPPLIES = "supplies"
    SETTLES_IN = "settles_in"
    CONSTRAINED_BY = "constrained_by"
    AMPLIFIES = "amplifies"


class Stance(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    UNCERTAIN = "uncertain"


class EmotionalState(str, Enum):
    STABLE = "stable"
    CONCERNED = "concerned"
    FEARFUL = "fearful"
    PANICKED = "panicked"
    REASSURED = "reassured"


class PhaseLabel(str, Enum):
    T0 = "T0"
    T1 = "T1"
    T2 = "T2"
    T3 = "T3"
    T4 = "T4"
    T5 = "T5"


class Horizon(str, Enum):
    H6 = "6h"
    H24 = "24h"
    D7 = "7d"
    D30 = "30d"


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class StrategyType(str, Enum):
    TRANSPARENT = "transparent"
    DELAYED = "delayed"
    DEFENSIVE = "defensive"
    SILENT = "silent"
    PHASED = "phased"


class TimestampedModel(DeevoBaseModel):
    timestamp: datetime = Field(..., description="UTC timestamp")


class ConfidenceMixin(DeevoBaseModel):
    confidence: float = Field(..., ge=0.0, le=1.0)


class NumericRange(DeevoBaseModel):
    low: float
    high: float


class MoneyRange(DeevoBaseModel):
    currency: str = Field(default="USD", min_length=3, max_length=3)
    low: float = Field(..., ge=0)
    high: float = Field(..., ge=0)

    @property
    def midpoint(self) -> float:
        return (self.low + self.high) / 2


class Assumption(DeevoBaseModel):
    text: str
    source: Optional[str] = None


# ─── Mathematical payload structures ────────────────────────────


class FieldConfidence(DeevoBaseModel):
    """Confidence annotation for a single extracted field: u_i = (v_i, c_i)."""
    field_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class UncertaintyEnvelope(DeevoBaseModel):
    """Lightweight uncertainty descriptor for a pipeline stage.

    U = { stage, score ∈ [0,1], drivers[] }
    Score closer to 1.0 means *higher* uncertainty.
    """
    stage: str
    score: float = Field(..., ge=0.0, le=1.0, description="0=certain, 1=fully uncertain")
    drivers: list[str] = Field(default_factory=list)


class GraphSummary(DeevoBaseModel):
    """Compact summary of graph structural properties."""
    node_count: int = Field(default=0, ge=0)
    edge_count: int = Field(default=0, ge=0)
    avg_degree: float = Field(default=0.0, ge=0.0)
    density: float = Field(default=0.0, ge=0.0, le=1.0)
    max_influence_node: Optional[str] = None


class NodeMetrics(DeevoBaseModel):
    """Centrality metrics for a single graph node.

    I_i = η₁·C_D(i) + η₂·C_B(i) + η₃·C_E(i)
    """
    node_id: str
    degree_centrality: float = Field(default=0.0, ge=0.0)
    betweenness_centrality: float = Field(default=0.0, ge=0.0)
    importance_score: float = Field(default=0.0, ge=0.0, le=1.0)


class RankedAction(DeevoBaseModel):
    """A single scored candidate action on the decision surface.

    D(a_j) = θ₁R + θ₂M + θ₃F + θ₄T − θ₅C − θ₆H
    """
    name: str
    composite_score: float = Field(..., ge=0.0, le=1.0)
    risk_reduction: float = Field(default=0.0, ge=0.0, le=1.0)
    trust_gain: float = Field(default=0.0, ge=0.0, le=1.0)
    revenue_penalty: float = Field(default=0.0, ge=0.0, le=1.0)
    regulatory_penalty: float = Field(default=0.0, ge=0.0, le=1.0)
