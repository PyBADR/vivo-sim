"""Signal extraction service.

Pipeline position: Step 2
Input:  NormalizedScenario + raw sources
Output: List[Signal] with typed categories, confidence, velocity
"""
from __future__ import annotations

import hashlib
import logging
from datetime import datetime, timezone
from typing import List

from app.schemas.common import SignalCategory, SignalKind
from app.schemas.signal import (
    RawSource,
    Signal,
    SignalExtractionRequest,
    SignalExtractionResponse,
)

logger = logging.getLogger(__name__)


class SignalService:
    """Extracts structured signals from scenario context and raw sources.

    Phase 1: rule-based extraction from text keywords.
    Phase 2: will integrate Ollama for Arabic NER + market feed parsing.
    """

    # ── category detection keywords ──────────────────────────────────
    CATEGORY_KEYWORDS: dict[str, SignalCategory] = {
        "flight": SignalCategory.AVIATION,
        "airline": SignalCategory.AVIATION,
        "airport": SignalCategory.AVIATION,
        "NOTAM": SignalCategory.AVIATION,
        "ship": SignalCategory.SHIPPING,
        "port": SignalCategory.SHIPPING,
        "vessel": SignalCategory.SHIPPING,
        "tanker": SignalCategory.SHIPPING,
        "bank": SignalCategory.BANKING,
        "SWIFT": SignalCategory.BANKING,
        "liquidity": SignalCategory.BANKING,
        "oil": SignalCategory.MARKET,
        "crude": SignalCategory.MARKET,
        "gold": SignalCategory.MARKET,
        "brent": SignalCategory.MARKET,
        "sanction": SignalCategory.POLICY,
        "regulation": SignalCategory.POLICY,
        "ministry": SignalCategory.POLICY,
        "protest": SignalCategory.SOCIAL,
        "hashtag": SignalCategory.SOCIAL,
        "viral": SignalCategory.SOCIAL,
        "pipeline": SignalCategory.ENERGY,
        "refinery": SignalCategory.ENERGY,
        "opec": SignalCategory.ENERGY,
        "media": SignalCategory.MEDIA,
        "news": SignalCategory.MEDIA,
        "broadcast": SignalCategory.MEDIA,
    }

    def extract(self, request: SignalExtractionRequest) -> SignalExtractionResponse:
        """Extract signals from raw sources for a given scenario."""
        signals: List[Signal] = []

        for source in request.raw_sources:
            extracted = self._extract_from_source(source, request.scenario_id)
            signals.extend(extracted)

        # Deduplicate by category
        seen_categories: set[str] = set()
        unique_signals: List[Signal] = []
        for sig in signals:
            if sig.category not in seen_categories:
                seen_categories.add(sig.category)
                unique_signals.append(sig)

        overall_confidence = (
            sum(s.confidence for s in unique_signals) / len(unique_signals) if unique_signals else 0.5
        )

        return SignalExtractionResponse(
            scenario_id=request.scenario_id,
            signals=unique_signals,
            extracted_count=len(unique_signals),
            confidence=round(overall_confidence, 3),
        )

    def _extract_from_source(self, source: RawSource, scenario_id: str) -> List[Signal]:
        """Extract signals from a single raw source."""
        signals: List[Signal] = []
        content_lower = source.content.lower()
        now = datetime.now(timezone.utc)

        for keyword, category in self.CATEGORY_KEYWORDS.items():
            if keyword.lower() in content_lower:
                signal_id = self._generate_signal_id(scenario_id, category.value, keyword)
                kind = self._infer_kind(source.source_type)
                confidence = self._estimate_confidence(source.source_type, category)

                signals.append(
                    Signal(
                        id=signal_id,
                        source=source.source_name or source.source_type,
                        kind=kind,
                        category=category,
                        value=f"{keyword} signal detected",
                        velocity=self._estimate_velocity(category),
                        volatility=self._estimate_volatility(category),
                        timestamp=source.published_at or now,
                        confidence=confidence,
                    )
                )

        return signals

    def _generate_signal_id(self, scenario_id: str, category: str, keyword: str) -> str:
        raw = f"{scenario_id}:{category}:{keyword}"
        return f"sig-{hashlib.sha256(raw.encode()).hexdigest()[:10]}"

    def _infer_kind(self, source_type: str) -> SignalKind:
        if source_type in ("market_feed",):
            return SignalKind.MARKET
        if source_type in ("advisory", "official_statement"):
            return SignalKind.STRUCTURED
        return SignalKind.UNSTRUCTURED

    def _estimate_confidence(self, source_type: str, category: SignalCategory) -> float:
        base = {"official_statement": 0.9, "advisory": 0.8, "market_feed": 0.85, "news": 0.7, "social": 0.5}
        return base.get(source_type, 0.6)

    def _estimate_velocity(self, category: SignalCategory) -> float:
        fast = {SignalCategory.MARKET, SignalCategory.SOCIAL, SignalCategory.MEDIA}
        return 0.8 if category in fast else 0.4

    def _estimate_volatility(self, category: SignalCategory) -> float:
        volatile = {SignalCategory.MARKET, SignalCategory.SOCIAL}
        return 0.7 if category in volatile else 0.3
