from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class MarketStressInput:
    oil_stress: float
    gold_stress: float
    fx_stress: float
    crypto_stress: float
    shipping_stress: float


class MarketEngine:
    """
    Market stress model.

    MarketStress =
        b1 * oil_stress
      + b2 * gold_stress
      + b3 * fx_stress
      + b4 * crypto_stress
      + b5 * shipping_stress
    """

    DEFAULT_WEIGHTS = {
        "oil_stress": 0.30,
        "gold_stress": 0.15,
        "fx_stress": 0.20,
        "crypto_stress": 0.10,
        "shipping_stress": 0.25,
    }

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def __init__(self, weights: dict[str, float] | None = None) -> None:
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()

    def score_market(self, payload: MarketStressInput) -> float:
        score = (
            self.weights["oil_stress"] * payload.oil_stress
            + self.weights["gold_stress"] * payload.gold_stress
            + self.weights["fx_stress"] * payload.fx_stress
            + self.weights["crypto_stress"] * payload.crypto_stress
            + self.weights["shipping_stress"] * payload.shipping_stress
        )
        return self._clamp(score)

    def market_regime(self, score: float) -> str:
        if score < 0.25:
            return "Stable"
        if score < 0.50:
            return "Watch"
        if score < 0.75:
            return "Stress"
        return "Shock"
