from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ConfidenceInput:
    source_reliability: float
    data_coverage: float
    model_consistency: float
    uncertainty_penalty: float


class ConfidenceEngine:
    """
    ConfidenceScore =
        e1 * source_reliability
      + e2 * data_coverage
      + e3 * model_consistency
      - e4 * uncertainty_penalty
    """

    DEFAULT_WEIGHTS = {
        "source_reliability": 0.35,
        "data_coverage": 0.25,
        "model_consistency": 0.25,
        "uncertainty_penalty": 0.15,
    }

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def __init__(self, weights: dict[str, float] | None = None) -> None:
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()

    def compute(self, payload: ConfidenceInput) -> float:
        score = (
            self.weights["source_reliability"] * payload.source_reliability
            + self.weights["data_coverage"] * payload.data_coverage
            + self.weights["model_consistency"] * payload.model_consistency
            - self.weights["uncertainty_penalty"] * payload.uncertainty_penalty
        )
        return self._clamp(score)

    def classify(self, score: float) -> str:
        if score < 0.40:
            return "Low confidence"
        if score < 0.70:
            return "Moderate confidence"
        return "High confidence"
