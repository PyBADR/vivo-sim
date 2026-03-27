from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class AirportRiskInput:
    airspace_risk: float
    reroute_severity: float
    cancellation_risk: float
    cargo_delay_risk: float
    passenger_confidence_risk: float


class AirportEngine:
    """
    Airport stress model.

    AirportStress =
        w1 * airspace_risk
      + w2 * reroute_severity
      + w3 * cancellation_risk
      + w4 * cargo_delay_risk
      + w5 * passenger_confidence_risk
    """

    DEFAULT_WEIGHTS = {
        "airspace_risk": 0.30,
        "reroute_severity": 0.20,
        "cancellation_risk": 0.20,
        "cargo_delay_risk": 0.15,
        "passenger_confidence_risk": 0.15,
    }

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def __init__(self, weights: dict[str, float] | None = None) -> None:
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()

    def score_airport(self, payload: AirportRiskInput) -> float:
        score = (
            self.weights["airspace_risk"] * payload.airspace_risk
            + self.weights["reroute_severity"] * payload.reroute_severity
            + self.weights["cancellation_risk"] * payload.cancellation_risk
            + self.weights["cargo_delay_risk"] * payload.cargo_delay_risk
            + self.weights["passenger_confidence_risk"] * payload.passenger_confidence_risk
        )
        return self._clamp(score)

    def classify_airport_risk(self, score: float) -> str:
        if score < 0.25:
            return "Low"
        if score < 0.50:
            return "Medium"
        if score < 0.75:
            return "High"
        return "Critical"
