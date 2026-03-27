from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class StrategyEvaluationInput:
    name: str
    risk_reduction: float
    trust_gain: float
    revenue_penalty: float
    regulatory_penalty: float


@dataclass(slots=True)
class StrategyResult:
    name: str
    score: float
    rank: int | None = None


class StrategyEngine:
    """
    StrategyScore =
        d1 * risk_reduction
      + d2 * trust_gain
      - d3 * revenue_penalty
      - d4 * regulatory_penalty
    """

    DEFAULT_WEIGHTS = {
        "risk_reduction": 0.40,
        "trust_gain": 0.25,
        "revenue_penalty": 0.20,
        "regulatory_penalty": 0.15,
    }

    def __init__(self, weights: dict[str, float] | None = None) -> None:
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()

    def score_strategy(self, payload: StrategyEvaluationInput) -> float:
        return (
            self.weights["risk_reduction"] * payload.risk_reduction
            + self.weights["trust_gain"] * payload.trust_gain
            - self.weights["revenue_penalty"] * payload.revenue_penalty
            - self.weights["regulatory_penalty"] * payload.regulatory_penalty
        )

    def evaluate(self, strategies: list[StrategyEvaluationInput]) -> list[StrategyResult]:
        results = [
            StrategyResult(name=s.name, score=self.score_strategy(s))
            for s in strategies
        ]
        results.sort(key=lambda item: item.score, reverse=True)

        for idx, result in enumerate(results, start=1):
            result.rank = idx

        return results

    def choose_best(self, strategies: list[StrategyEvaluationInput]) -> StrategyResult:
        ranked = self.evaluate(strategies)
        if not ranked:
            raise ValueError("No strategies provided")
        return ranked[0]
