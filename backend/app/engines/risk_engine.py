from __future__ import annotations


class RiskEngine:
    DEFAULT_WEIGHTS = {
        "airport": 0.15,
        "shipping": 0.10,
        "banking": 0.10,
        "media": 0.10,
        "public": 0.10,
        "energy": 0.10,
        "market": 0.10,
        "logistics": 0.15,
        "policy": 0.10,
    }

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def __init__(self, weights: dict[str, float] | None = None) -> None:
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()

    def score(
        self,
        airport: float,
        shipping: float,
        banking: float,
        media: float,
        public: float,
        energy: float,
        market: float,
        logistics: float,
        policy: float,
    ) -> float:
        value = (
            self.weights["airport"] * airport
            + self.weights["shipping"] * shipping
            + self.weights["banking"] * banking
            + self.weights["media"] * media
            + self.weights["public"] * public
            + self.weights["energy"] * energy
            + self.weights["market"] * market
            + self.weights["logistics"] * logistics
            + self.weights["policy"] * policy
        )
        return self._clamp(value)

    def classify(self, score: float) -> str:
        if score < 0.25:
            return "Low"
        if score < 0.50:
            return "Medium"
        if score < 0.75:
            return "High"
        return "Critical"
