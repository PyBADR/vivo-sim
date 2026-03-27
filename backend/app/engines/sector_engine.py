from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class SectorImpactInput:
    direct_impact: float
    upstream_impacts: list[float]
    dependency_weights: list[float]


class SectorEngine:
    """
    Sector impact model.

    SectorImpact = direct_impact + weighted spillover
    spillover = sum(upstream_impact * dependency_weight)
    """

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def compute_spillover(self, upstream_impacts: list[float], dependency_weights: list[float]) -> float:
        if len(upstream_impacts) != len(dependency_weights):
            raise ValueError("upstream_impacts and dependency_weights must have same length")

        spillover = sum(
            float(impact) * float(weight)
            for impact, weight in zip(upstream_impacts, dependency_weights)
        )
        return self._clamp(spillover)

    def compute_sector_impact(self, payload: SectorImpactInput) -> float:
        spillover = self.compute_spillover(payload.upstream_impacts, payload.dependency_weights)
        total = payload.direct_impact + spillover
        return self._clamp(total)

    def classify_sector_impact(self, score: float) -> str:
        if score < 0.25:
            return "Low"
        if score < 0.50:
            return "Medium"
        if score < 0.75:
            return "High"
        return "Severe"
