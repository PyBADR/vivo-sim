"""Scenario normalization service.

Pipeline position: Step 1
Input:  raw_text (user or system)
Output: NormalizedScenario with typed trigger, region, domain, constraints
"""
from __future__ import annotations

import hashlib
import logging
from datetime import datetime, timezone
from typing import List, Optional

from app.schemas.common import (
    Assumption,
    ConstraintType,
    Domain,
    Horizon,
    Region,
    TriggerType,
)
from app.schemas.scenario import (
    NormalizedScenario,
    ScenarioConstraint,
    ScenarioNormalizeRequest,
    ScenarioTrigger,
)

logger = logging.getLogger(__name__)


class ScenarioService:
    """Normalizes raw scenario text into a structured, typed scenario object.

    Deterministic first pass — no LLM calls. Future versions will integrate
    Ollama for Arabic NER and contextual classification.
    """

    # ── trigger keyword map ──────────────────────────────────────────
    TRIGGER_KEYWORDS: dict[str, TriggerType] = {
        "airspace": TriggerType.AIRSPACE,
        "flight": TriggerType.AIRSPACE,
        "aviation": TriggerType.AIRSPACE,
        "NOTAM": TriggerType.AIRSPACE,
        "shipping": TriggerType.SHIPPING,
        "strait": TriggerType.SHIPPING,
        "hormuz": TriggerType.SHIPPING,
        "port": TriggerType.SHIPPING,
        "bank": TriggerType.BANKING,
        "liquidity": TriggerType.BANKING,
        "SWIFT": TriggerType.BANKING,
        "oil": TriggerType.MARKET,
        "crude": TriggerType.MARKET,
        "gold": TriggerType.MARKET,
        "market": TriggerType.MARKET,
        "military": TriggerType.MILITARY,
        "missile": TriggerType.MILITARY,
        "drone": TriggerType.MILITARY,
        "attack": TriggerType.MILITARY,
        "sanction": TriggerType.POLICY,
        "regulation": TriggerType.POLICY,
        "PDPL": TriggerType.POLICY,
        "protest": TriggerType.SOCIAL,
        "hashtag": TriggerType.SOCIAL,
        "viral": TriggerType.SOCIAL,
    }

    # ── region keyword map ───────────────────────────────────────────
    REGION_KEYWORDS: dict[str, Region] = {
        "saudi": Region.SAUDI,
        "riyadh": Region.SAUDI,
        "jeddah": Region.SAUDI,
        "uae": Region.UAE,
        "dubai": Region.UAE,
        "abu dhabi": Region.UAE,
        "qatar": Region.QATAR,
        "doha": Region.QATAR,
        "kuwait": Region.KUWAIT,
        "bahrain": Region.BAHRAIN,
        "oman": Region.OMAN,
        "muscat": Region.OMAN,
        "gcc": Region.GCC,
        "gulf": Region.GCC,
    }

    @staticmethod
    def _enum_str(val) -> str:
        """Safely extract string from enum or passthrough string.

        Pydantic v2 with use_enum_values=True stores enum fields as raw
        strings, so request attributes may be str or Enum depending on
        whether they came from the model or from internal helpers.
        """
        return val.value if hasattr(val, "value") else str(val)

    def normalize(self, request: ScenarioNormalizeRequest) -> NormalizedScenario:
        """Normalize raw text into a structured scenario."""
        text_lower = request.raw_text.lower()

        scenario_id = self._generate_id(request.raw_text)
        trigger_type = self._detect_trigger(text_lower, request.domain_hint)
        region = request.region_hint or self._detect_region(text_lower)
        domain = request.domain_hint or self._infer_domain(trigger_type)
        severity = self._estimate_severity(text_lower, trigger_type)
        constraints = self._detect_constraints(text_lower, trigger_type)
        horizon_hours = self._resolve_horizon(request.preferred_horizon, trigger_type)

        trigger = ScenarioTrigger(
            type=trigger_type,
            label=f"{self._enum_str(trigger_type).title()} event in {self._enum_str(region)}",
            severity=severity,
            timestamp=datetime.now(timezone.utc),
        )

        return NormalizedScenario(
            scenario_id=scenario_id,
            title=request.raw_text[:120],
            raw_text=request.raw_text,
            region=region,
            domain=domain,
            trigger=trigger,
            actors=self._extract_actors(text_lower),
            signal_categories=self._infer_signal_categories(trigger_type),
            constraints=constraints,
            time_horizon_hours=horizon_hours,
            assumptions=[
                Assumption(text="Scenario derived from raw text — no live signal feed", source="system")
            ],
            confidence=0.6 if len(request.raw_text) < 100 else 0.75,
        )

    # ── private helpers ──────────────────────────────────────────────

    def _generate_id(self, text: str) -> str:
        return f"scn-{hashlib.sha256(text.encode()).hexdigest()[:12]}"

    def _detect_trigger(self, text: str, hint: Optional[Domain] = None) -> TriggerType:
        for keyword, ttype in self.TRIGGER_KEYWORDS.items():
            if keyword.lower() in text:
                return ttype
        return TriggerType.MARKET  # default fallback

    def _detect_region(self, text: str) -> Region:
        for keyword, region in self.REGION_KEYWORDS.items():
            if keyword in text:
                return region
        return Region.GCC

    def _infer_domain(self, trigger: TriggerType) -> Domain:
        mapping = {
            TriggerType.AIRSPACE: Domain.AVIATION,
            TriggerType.SHIPPING: Domain.LOGISTICS,
            TriggerType.BANKING: Domain.BANKING,
            TriggerType.MARKET: Domain.ENERGY,
            TriggerType.MILITARY: Domain.MULTI_SECTOR,
            TriggerType.POLICY: Domain.PUBLIC_SECTOR,
            TriggerType.SOCIAL: Domain.MULTI_SECTOR,
        }
        return mapping.get(trigger, Domain.MULTI_SECTOR)

    def _estimate_severity(self, text: str, trigger: TriggerType) -> float:
        base = 0.5
        escalators = ["critical", "emergency", "war", "attack", "closure", "collapse", "crash"]
        for word in escalators:
            if word in text:
                base = min(1.0, base + 0.1)
        return round(base, 2)

    def _detect_constraints(self, text: str, trigger: TriggerType) -> List[ScenarioConstraint]:
        constraints: List[ScenarioConstraint] = []
        if "notam" in text or trigger == TriggerType.AIRSPACE:
            constraints.append(
                ScenarioConstraint(type=ConstraintType.NOTAM, details="Airspace restriction detected", severity=0.7)
            )
        if "strait" in text or "hormuz" in text:
            constraints.append(
                ScenarioConstraint(type=ConstraintType.ROUTE_CLOSURE, details="Maritime route disruption", severity=0.8)
            )
        if "swift" in text or "bank" in text:
            constraints.append(
                ScenarioConstraint(
                    type=ConstraintType.BANK_CONTINUITY, details="Banking continuity concern", severity=0.6
                )
            )
        return constraints

    def _resolve_horizon(self, hint: Optional[Horizon], trigger: TriggerType) -> int:
        if hint:
            hint_str = self._enum_str(hint)
            return {"6h": 6, "24h": 24, "7d": 168, "30d": 720}[hint_str]
        fast_triggers = {TriggerType.MILITARY, TriggerType.AIRSPACE}
        return 24 if trigger in fast_triggers else 168

    def _extract_actors(self, text: str) -> List[str]:
        actors: List[str] = []
        known = [
            "emirates", "qatar airways", "saudia", "GACA", "GCAA",
            "aramco", "adnoc", "central bank", "SCA", "CMA",
        ]
        for actor in known:
            if actor.lower() in text:
                actors.append(actor)
        return actors

    def _infer_signal_categories(self, trigger: TriggerType) -> List[str]:
        mapping = {
            TriggerType.AIRSPACE: ["aviation", "media", "market"],
            TriggerType.SHIPPING: ["shipping", "energy", "market"],
            TriggerType.BANKING: ["banking", "market", "policy"],
            TriggerType.MARKET: ["market", "energy", "banking"],
            TriggerType.MILITARY: ["aviation", "shipping", "market", "media"],
            TriggerType.POLICY: ["policy", "banking", "market"],
            TriggerType.SOCIAL: ["social", "media"],
        }
        return mapping.get(trigger, ["market"])
