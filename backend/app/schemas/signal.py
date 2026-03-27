from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Union

from pydantic import Field

from app.schemas.common import ConfidenceMixin, DeevoBaseModel, SignalCategory, SignalKind


class RawSource(DeevoBaseModel):
    source_type: str = Field(..., description="news, advisory, market_feed, official_statement, social")
    source_name: Optional[str] = None
    content: str
    published_at: Optional[datetime] = None


class SignalExtractionRequest(DeevoBaseModel):
    scenario_id: str
    raw_sources: List[RawSource] = Field(default_factory=list)


class Signal(ConfidenceMixin):
    id: str
    source: str
    kind: SignalKind
    category: SignalCategory
    value: Union[str, float, int]
    velocity: float = Field(default=0.0, ge=0.0)
    volatility: float = Field(default=0.0, ge=0.0)
    timestamp: datetime


class SignalExtractionResponse(ConfidenceMixin):
    scenario_id: str
    signals: List[Signal] = Field(default_factory=list)
    extracted_count: int = Field(default=0, ge=0)
