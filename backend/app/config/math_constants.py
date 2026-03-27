"""Centralized mathematical coefficients for the Deevo simulation engine.

All weights, thresholds, and coefficients that control the mathematical
behavior of the pipeline are defined here. No magic numbers should be
scattered across service or engine code — they should reference this
module instead.

Pipeline: x → S → Σ → G → Ĝ → Z(0:T) → D → B → Q
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True, slots=True)
class SignalScoringCoefficients:
    """SignalScore(σ) = α·strength + β·confidence + γ·relevance + δ·direction"""
    alpha: float = 0.30   # strength weight
    beta: float = 0.30    # confidence weight
    gamma: float = 0.25   # relevance weight
    delta: float = 0.15   # direction weight


@dataclass(frozen=True, slots=True)
class GraphEdgeWeightCoefficients:
    """w_ij = λ₁·relationship + λ₂·influence + λ₃·exposure + λ₄·propagation"""
    lambda_relationship: float = 0.30
    lambda_influence: float = 0.25
    lambda_exposure: float = 0.25
    lambda_propagation: float = 0.20


@dataclass(frozen=True, slots=True)
class NodeImportanceCoefficients:
    """I_i = η₁·C_D + η₂·C_B + η₃·C_E"""
    eta_degree: float = 0.40
    eta_betweenness: float = 0.35
    eta_eigenvector: float = 0.25


@dataclass(frozen=True, slots=True)
class DecisionScoringCoefficients:
    """D(a) = θ₁·R + θ₂·M + θ₃·F + θ₄·T − θ₅·C − θ₆·H"""
    theta_risk_reduction: float = 0.25
    theta_mitigation_impact: float = 0.20
    theta_feasibility: float = 0.15
    theta_timeliness: float = 0.15
    theta_cost: float = 0.15          # subtracted
    theta_downside_risk: float = 0.10  # subtracted


@dataclass(frozen=True, slots=True)
class ConfidenceThresholds:
    """Classification boundaries for confidence levels."""
    low_upper: float = 0.40
    moderate_upper: float = 0.70
    # >= moderate_upper → high confidence


@dataclass(frozen=True, slots=True)
class RiskThresholds:
    """Classification boundaries for risk levels."""
    low_upper: float = 0.25
    medium_upper: float = 0.50
    high_upper: float = 0.75
    # >= high_upper → critical


@dataclass(frozen=True, slots=True)
class InferredEdgeThresholds:
    """Controls for graph enrichment edge inference."""
    probability_threshold: float = 0.55  # add inferred edge when Pr > τ_e
    theta_similarity: float = 0.40
    theta_shared_neighbors: float = 0.35
    theta_co_exposure: float = 0.25


@dataclass(frozen=True, slots=True)
class PropagationConstants:
    """Controls for simulation propagation dynamics.

    z_i(t+1) = (1 - μ_i) * z_i(t) + μ_i * φ(Σ w_ji z_j(t) + b_i + u_i(t) + η_i(t))
    """
    damping_default: float = 0.15          # μ_i default adaptation rate
    baseline_susceptibility: float = 0.10  # b_i default sensitivity
    noise_scale: float = 0.03             # η_i(t) perturbation scale
    logistic_steepness: float = 5.0       # k in φ(x) = 1/(1+exp(-k*(x-0.5)))
    logistic_midpoint: float = 0.50       # x₀ in logistic response
    energy_node_weight_default: float = 1.0  # ω_i default for E(t) = Σ ω_i z_i(t)
    stability_window: int = 3             # last N phases for stability score


@dataclass(frozen=True, slots=True)
class BranchingConstants:
    """Controls for scenario branching engine.

    B = {b_1, ..., b_k} with Σ p(b_i) = 1.
    E[Y] = Σ p(b_i) Y(b_i).
    """
    max_branches: int = 4
    # Default branch probability weights (baseline, amplification, containment, adverse)
    default_branch_weights: tuple[float, ...] = (0.40, 0.25, 0.20, 0.15)
    # Amplification modifiers
    amplification_edge_boost: float = 1.35
    amplification_damping_reduction: float = 0.60  # multiply damping by this
    # Containment modifiers
    containment_damping_boost: float = 1.80        # multiply damping by this
    containment_edge_reduction: float = 0.70
    # Adverse modifiers
    adverse_noise_boost: float = 2.50              # multiply noise scale by this
    adverse_susceptibility_boost: float = 1.40


@dataclass(frozen=True, slots=True)
class UncertaintyConstants:
    """Controls for the uncertainty envelope.

    U_Σ = 1 - mean(c_i)
    U_G = mean(1 - c_ij) over edges
    U_B = -Σ p(b_i) log p(b_i)   (branch entropy)
    U_D = 1 - σ((D(a*) - D(a²)) / (σ̂_D + ε))
    """
    monte_carlo_runs: int = 5             # K perturbed simulation runs
    decision_margin_epsilon: float = 0.01  # ε to prevent division by zero
    logistic_scale: float = 10.0          # steepness for σ in U_D


@dataclass(frozen=True, slots=True)
class InterventionConstants:
    """Controls for the intervention engine.

    ΔE(i_k) = E_baseline_max - E_intervened_max
    Eff(i_k) = ΔE(i_k) / (Cost(i_k) + ε)
    """
    efficiency_epsilon: float = 0.001     # ε in efficiency denominator
    max_interventions: int = 6
    # Default cost range for each intervention type (normalized 0-1)
    default_cost: float = 0.30
    # Timing decay — intervention loses effectiveness over phases
    timing_decay_per_phase: float = 0.15


@dataclass(frozen=True, slots=True)
class MathConstants:
    """Root container for all mathematical coefficients.

    Usage:
        from app.config import MathConstants
        mc = MathConstants()
        score = mc.signal.alpha * strength + mc.signal.beta * confidence
    """
    signal: SignalScoringCoefficients = field(default_factory=SignalScoringCoefficients)
    graph_edge: GraphEdgeWeightCoefficients = field(default_factory=GraphEdgeWeightCoefficients)
    node_importance: NodeImportanceCoefficients = field(default_factory=NodeImportanceCoefficients)
    decision: DecisionScoringCoefficients = field(default_factory=DecisionScoringCoefficients)
    confidence: ConfidenceThresholds = field(default_factory=ConfidenceThresholds)
    risk: RiskThresholds = field(default_factory=RiskThresholds)
    inferred_edge: InferredEdgeThresholds = field(default_factory=InferredEdgeThresholds)
    propagation: PropagationConstants = field(default_factory=PropagationConstants)
    branching: BranchingConstants = field(default_factory=BranchingConstants)
    uncertainty: UncertaintyConstants = field(default_factory=UncertaintyConstants)
    intervention: InterventionConstants = field(default_factory=InterventionConstants)
