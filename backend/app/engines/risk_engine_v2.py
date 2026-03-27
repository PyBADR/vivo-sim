"""Risk Engine V2 — Enhanced risk scoring with exposure, shock, vulnerability, and criticality.

Formula: RiskScore_i = α·E_i + β·X_i + γ·V_i + δ·C_i

Where:
  E_i = Exposure (degree of interconnection)
  X_i = External shock intensity
  V_i = Vulnerability (structural fragility)
  C_i = Criticality (systemic importance)
"""
from __future__ import annotations

from typing import Any

from app.scenarios.scenario_coefficients import GCCCrisisConstants


class RiskEngineV2:
    """Enhanced risk scoring engine with multi-dimensional risk assessment."""

    def __init__(self, constants: GCCCrisisConstants | None = None) -> None:
        self.constants = constants or GCCCrisisConstants()
        self.coeff = self.constants.risk_v2

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        """Clamp value to [low, high] range."""
        return max(low, min(high, value))

    def compute_risk_score(
        self,
        exposure: float,
        shock: float,
        vulnerability: float,
        criticality: float,
    ) -> float:
        """Compute risk score from four components.

        Args:
            exposure: Node exposure/interconnection (0-1)
            shock: External shock intensity (0-1)
            vulnerability: Structural vulnerability/fragility (0-1)
            criticality: Systemic criticality/importance (0-1)

        Returns:
            Risk score in [0, 1]
        """
        score = (
            self.coeff.alpha_exposure * self._clamp(exposure)
            + self.coeff.beta_shock * self._clamp(shock)
            + self.coeff.gamma_vulnerability * self._clamp(vulnerability)
            + self.coeff.delta_criticality * self._clamp(criticality)
        )
        return self._clamp(score)

    def compute_node_risks(
        self,
        nodes: list[dict[str, Any]],
        scenario_context: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """Compute risk scores for a list of nodes.

        Derives exposure, shock, vulnerability, and criticality from node
        metadata and scenario context, then computes per-node risk scores.

        Args:
            nodes: List of node dicts with keys:
                - node_id (str): unique node identifier
                - degree (float, 0-1): network degree/interconnection
                - betweenness (float, 0-1): betweenness centrality
                - fragility (float, 0-1): structural fragility
                - recovery_time (float, 0-1): recovery difficulty
                - importance (float, 0-1): systemic importance
            scenario_context: Dict with crisis metadata:
                - shock_intensity (float, 0-1): external shock
                - propagation_multiplier (float, >=0): shock amplification
                - network_stress (float, 0-1): overall network stress
                - criticality_multiplier (float, >=0): importance scaling

        Returns:
            List of dicts with keys:
                - node_id (str)
                - exposure (float): computed exposure
                - shock (float): effective shock intensity
                - vulnerability (float): computed vulnerability
                - criticality (float): computed criticality
                - risk_score (float)
                - classification (str): "Low" / "Medium" / "High" / "Critical"
        """
        shock_intensity = self._clamp(scenario_context.get("shock_intensity", 0.0))
        prop_mult = max(0.0, scenario_context.get("propagation_multiplier", 1.0))
        network_stress = self._clamp(scenario_context.get("network_stress", 0.0))
        crit_mult = max(0.0, scenario_context.get("criticality_multiplier", 1.0))

        results = []
        for node in nodes:
            node_id = node.get("node_id", "unknown")
            degree = self._clamp(node.get("degree", 0.0))
            betweenness = self._clamp(node.get("betweenness", 0.0))
            fragility = self._clamp(node.get("fragility", 0.0))
            recovery_time = self._clamp(node.get("recovery_time", 0.0))
            importance = self._clamp(node.get("importance", 0.0))

            # Derive risk components from metadata and context
            # Exposure: combined degree and betweenness centrality
            exposure = self._clamp(0.5 * degree + 0.5 * betweenness + 0.1 * network_stress)

            # Shock: scaled by propagation multiplier
            shock = self._clamp(shock_intensity * prop_mult)

            # Vulnerability: fragility and recovery time
            vulnerability = self._clamp(0.6 * fragility + 0.4 * recovery_time)

            # Criticality: importance scaled by multiplier
            criticality = self._clamp(importance * crit_mult)

            risk_score = self.compute_risk_score(
                exposure, shock, vulnerability, criticality
            )

            results.append({
                "node_id": node_id,
                "exposure": exposure,
                "shock": shock,
                "vulnerability": vulnerability,
                "criticality": criticality,
                "risk_score": risk_score,
                "classification": self.classify(risk_score),
            })

        return results

    def classify(self, score: float) -> str:
        """Classify risk level based on score thresholds.

        Args:
            score: Risk score in [0, 1]

        Returns:
            Classification: "Low" / "Medium" / "High" / "Critical"
        """
        if score < 0.25:
            return "Low"
        if score < 0.50:
            return "Medium"
        if score < 0.75:
            return "High"
        return "Critical"

    def compute_composite_system_risk(
        self,
        node_risks: list[dict[str, Any]],
    ) -> float:
        """Compute weighted average system risk across all nodes.

        Args:
            node_risks: List of node risk dicts (from compute_node_risks)
                with keys: node_id, risk_score, criticality

        Returns:
            Composite system risk score in [0, 1]
        """
        if not node_risks:
            return 0.0

        total_weight = 0.0
        weighted_risk = 0.0

        for node_risk in node_risks:
            risk_score = self._clamp(node_risk.get("risk_score", 0.0))
            # Weight by criticality: more critical nodes contribute more
            weight = self._clamp(node_risk.get("criticality", 0.0))
            # If no criticality, use uniform weight
            if weight < 0.01:
                weight = 1.0

            weighted_risk += risk_score * weight
            total_weight += weight

        if total_weight < 1e-6:
            return 0.0

        composite = weighted_risk / total_weight
        return self._clamp(composite)
