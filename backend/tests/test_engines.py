from __future__ import annotations

import math

import pytest

from app.engines.airport_engine import AirportEngine, AirportRiskInput
from app.engines.confidence_engine import ConfidenceEngine, ConfidenceInput
from app.engines.market_engine import MarketEngine, MarketStressInput
from app.engines.propagation_engine import (
    NodeUpdateInput,
    PropagationEngine,
    PropagationInput,
)
from app.engines.risk_engine import RiskEngine
from app.engines.sector_engine import SectorEngine, SectorImpactInput
from app.engines.strategy_engine import (
    StrategyEngine,
    StrategyEvaluationInput,
)


# ============================================================
# Propagation Engine
# ============================================================

def test_propagation_compute_delta_basic() -> None:
    engine = PropagationEngine()

    payload = PropagationInput(
        source_activation=0.80,
        edge_weight=0.50,
        channel_boost=1.10,
        emotion_boost=1.05,
        time_decay=0.90,
        constraint_multiplier=1.00,
    )

    delta = engine.compute_delta(payload)

    expected = 0.80 * 0.50 * 1.10 * 1.05 * 0.90 * 1.00
    assert math.isclose(delta, expected, rel_tol=1e-9)


def test_propagation_compute_delta_clamps_to_one() -> None:
    engine = PropagationEngine()

    payload = PropagationInput(
        source_activation=1.00,
        edge_weight=1.00,
        channel_boost=2.00,
        emotion_boost=2.00,
        time_decay=1.00,
        constraint_multiplier=2.00,
    )

    delta = engine.compute_delta(payload)
    assert delta == 1.0


def test_propagation_compute_delta_rejects_negative_weight() -> None:
    engine = PropagationEngine()

    payload = PropagationInput(
        source_activation=0.80,
        edge_weight=-0.10,
        channel_boost=1.00,
        emotion_boost=1.00,
        time_decay=1.00,
        constraint_multiplier=1.00,
    )

    with pytest.raises(ValueError):
        engine.compute_delta(payload)


def test_propagation_update_node_basic() -> None:
    engine = PropagationEngine()

    payload = NodeUpdateInput(
        current_value=0.30,
        incoming_deltas=[0.10, 0.12],
        stabilization_effect=0.05,
    )

    next_value = engine.update_node(payload)
    expected = 0.30 + 0.10 + 0.12 - 0.05
    assert math.isclose(next_value, expected, rel_tol=1e-9)


def test_propagation_update_node_clamps() -> None:
    engine = PropagationEngine()

    payload = NodeUpdateInput(
        current_value=0.95,
        incoming_deltas=[0.50, 0.20],
        stabilization_effect=0.00,
    )

    next_value = engine.update_node(payload)
    assert next_value == 1.0


def test_propagation_phase_updates_graph() -> None:
    engine = PropagationEngine()

    node_states = {
        "A": 0.80,
        "B": 0.10,
        "C": 0.20,
    }

    edges = [
        {
            "source": "A",
            "target": "B",
            "weight": 0.50,
            "channel": "aviation",
            "emotion": "concern",
        },
        {
            "source": "B",
            "target": "C",
            "weight": 0.40,
            "channel": "media",
            "emotion": "panic",
        },
    ]

    next_states = engine.propagate_phase(
        node_states=node_states,
        edges=edges,
        channel_boosts={"aviation": 1.20, "media": 1.10, "default": 1.0},
        emotion_boosts={"concern": 1.05, "panic": 1.20, "default": 1.0},
        time_decay=0.90,
        constraint_multiplier=1.10,
        stabilization_effects={"A": 0.02, "B": 0.03, "C": 0.01},
    )

    assert set(next_states.keys()) == {"A", "B", "C"}
    assert 0.0 <= next_states["A"] <= 1.0
    assert 0.0 <= next_states["B"] <= 1.0
    assert 0.0 <= next_states["C"] <= 1.0
    assert next_states["B"] > node_states["B"]


# ============================================================
# Airport Engine
# ============================================================

def test_airport_score_basic() -> None:
    engine = AirportEngine()

    payload = AirportRiskInput(
        airspace_risk=0.80,
        reroute_severity=0.60,
        cancellation_risk=0.40,
        cargo_delay_risk=0.50,
        passenger_confidence_risk=0.30,
    )

    score = engine.score_airport(payload)

    expected = (
        0.30 * 0.80
        + 0.20 * 0.60
        + 0.20 * 0.40
        + 0.15 * 0.50
        + 0.15 * 0.30
    )
    assert math.isclose(score, expected, rel_tol=1e-9)


def test_airport_score_clamps() -> None:
    engine = AirportEngine()

    payload = AirportRiskInput(
        airspace_risk=2.00,
        reroute_severity=2.00,
        cancellation_risk=2.00,
        cargo_delay_risk=2.00,
        passenger_confidence_risk=2.00,
    )

    score = engine.score_airport(payload)
    assert score == 1.0


@pytest.mark.parametrize(
    ("score", "label"),
    [
        (0.10, "Low"),
        (0.30, "Medium"),
        (0.60, "High"),
        (0.90, "Critical"),
    ],
)
def test_airport_classification(score: float, label: str) -> None:
    engine = AirportEngine()
    assert engine.classify_airport_risk(score) == label


# ============================================================
# Market Engine
# ============================================================

def test_market_score_basic() -> None:
    engine = MarketEngine()

    payload = MarketStressInput(
        oil_stress=0.70,
        gold_stress=0.40,
        fx_stress=0.30,
        crypto_stress=0.20,
        shipping_stress=0.60,
    )

    score = engine.score_market(payload)

    expected = (
        0.30 * 0.70
        + 0.15 * 0.40
        + 0.20 * 0.30
        + 0.10 * 0.20
        + 0.25 * 0.60
    )

    assert math.isclose(score, expected, rel_tol=1e-9)


@pytest.mark.parametrize(
    ("score", "regime"),
    [
        (0.10, "Stable"),
        (0.35, "Watch"),
        (0.60, "Stress"),
        (0.80, "Shock"),
    ],
)
def test_market_regime(score: float, regime: str) -> None:
    engine = MarketEngine()
    assert engine.market_regime(score) == regime


# ============================================================
# Sector Engine
# ============================================================

def test_sector_compute_spillover_basic() -> None:
    engine = SectorEngine()

    spillover = engine.compute_spillover(
        upstream_impacts=[0.50, 0.80],
        dependency_weights=[0.40, 0.30],
    )

    expected = 0.50 * 0.40 + 0.80 * 0.30
    assert math.isclose(spillover, expected, rel_tol=1e-9)


def test_sector_compute_spillover_length_mismatch() -> None:
    engine = SectorEngine()

    with pytest.raises(ValueError):
        engine.compute_spillover(
            upstream_impacts=[0.50, 0.80],
            dependency_weights=[0.40],
        )


def test_sector_compute_sector_impact_basic() -> None:
    engine = SectorEngine()

    payload = SectorImpactInput(
        direct_impact=0.30,
        upstream_impacts=[0.50, 0.20],
        dependency_weights=[0.40, 0.30],
    )

    score = engine.compute_sector_impact(payload)

    expected_spillover = 0.50 * 0.40 + 0.20 * 0.30
    expected_total = 0.30 + expected_spillover
    assert math.isclose(score, expected_total, rel_tol=1e-9)


@pytest.mark.parametrize(
    ("score", "label"),
    [
        (0.10, "Low"),
        (0.35, "Medium"),
        (0.60, "High"),
        (0.90, "Severe"),
    ],
)
def test_sector_classification(score: float, label: str) -> None:
    engine = SectorEngine()
    assert engine.classify_sector_impact(score) == label


# ============================================================
# Confidence Engine
# ============================================================

def test_confidence_score_basic() -> None:
    engine = ConfidenceEngine()

    payload = ConfidenceInput(
        source_reliability=0.90,
        data_coverage=0.80,
        model_consistency=0.70,
        uncertainty_penalty=0.20,
    )

    score = engine.compute(payload)

    expected = (
        0.35 * 0.90
        + 0.25 * 0.80
        + 0.25 * 0.70
        - 0.15 * 0.20
    )

    assert math.isclose(score, expected, rel_tol=1e-9)


def test_confidence_score_clamps_to_zero() -> None:
    engine = ConfidenceEngine()

    payload = ConfidenceInput(
        source_reliability=0.00,
        data_coverage=0.00,
        model_consistency=0.00,
        uncertainty_penalty=1.00,
    )

    score = engine.compute(payload)
    assert score == 0.0


@pytest.mark.parametrize(
    ("score", "label"),
    [
        (0.20, "Low confidence"),
        (0.50, "Moderate confidence"),
        (0.80, "High confidence"),
    ],
)
def test_confidence_classification(score: float, label: str) -> None:
    engine = ConfidenceEngine()
    assert engine.classify(score) == label


# ============================================================
# Strategy Engine
# ============================================================

def test_strategy_score_basic() -> None:
    engine = StrategyEngine()

    payload = StrategyEvaluationInput(
        name="transparent",
        risk_reduction=0.60,
        trust_gain=0.40,
        revenue_penalty=0.10,
        regulatory_penalty=0.05,
    )

    score = engine.score_strategy(payload)

    expected = (
        0.40 * 0.60
        + 0.25 * 0.40
        - 0.20 * 0.10
        - 0.15 * 0.05
    )

    assert math.isclose(score, expected, rel_tol=1e-9)


def test_strategy_evaluate_ranks_descending() -> None:
    engine = StrategyEngine()

    strategies = [
        StrategyEvaluationInput(
            name="silent",
            risk_reduction=0.05,
            trust_gain=0.00,
            revenue_penalty=0.02,
            regulatory_penalty=0.25,
        ),
        StrategyEvaluationInput(
            name="transparent",
            risk_reduction=0.50,
            trust_gain=0.35,
            revenue_penalty=0.10,
            regulatory_penalty=0.08,
        ),
        StrategyEvaluationInput(
            name="phased",
            risk_reduction=0.35,
            trust_gain=0.20,
            revenue_penalty=0.12,
            regulatory_penalty=0.10,
        ),
    ]

    ranked = engine.evaluate(strategies)

    assert len(ranked) == 3
    assert ranked[0].score >= ranked[1].score >= ranked[2].score
    assert ranked[0].rank == 1
    assert ranked[1].rank == 2
    assert ranked[2].rank == 3
    assert ranked[0].name == "transparent"


def test_strategy_choose_best() -> None:
    engine = StrategyEngine()

    strategies = [
        StrategyEvaluationInput(
            name="delayed",
            risk_reduction=0.10,
            trust_gain=0.05,
            revenue_penalty=0.04,
            regulatory_penalty=0.20,
        ),
        StrategyEvaluationInput(
            name="transparent",
            risk_reduction=0.55,
            trust_gain=0.30,
            revenue_penalty=0.10,
            regulatory_penalty=0.06,
        ),
    ]

    best = engine.choose_best(strategies)

    assert best.rank == 1
    assert best.name == "transparent"


def test_strategy_choose_best_empty_raises() -> None:
    engine = StrategyEngine()

    with pytest.raises(ValueError):
        engine.choose_best([])


# ============================================================
# Risk Engine
# ============================================================

def test_risk_engine_score_basic() -> None:
    engine = RiskEngine()

    score = engine.score(
        airport=0.60,
        shipping=0.30,
        banking=0.20,
        media=0.40,
        public=0.35,
        energy=0.50,
        market=0.45,
        logistics=0.55,
        policy=0.25,
    )

    expected = (
        0.15 * 0.60
        + 0.10 * 0.30
        + 0.10 * 0.20
        + 0.10 * 0.40
        + 0.10 * 0.35
        + 0.10 * 0.50
        + 0.10 * 0.45
        + 0.15 * 0.55
        + 0.10 * 0.25
    )

    assert math.isclose(score, expected, rel_tol=1e-9)


@pytest.mark.parametrize(
    ("score", "label"),
    [
        (0.10, "Low"),
        (0.35, "Medium"),
        (0.60, "High"),
        (0.80, "Critical"),
    ],
)
def test_risk_engine_classification(score: float, label: str) -> None:
    engine = RiskEngine()
    assert engine.classify(score) == label
