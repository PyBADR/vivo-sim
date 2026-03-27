"""FastAPI router for scenario packs, presets, and impact computation.

Endpoints for scenario discovery, airport impact, fuel transmission,
e-commerce disruption analysis, and full crisis assessment.
"""
from fastapi import APIRouter, HTTPException, status

from app.engines.airport_disruption_engine import AirportDisruptionEngine
from app.engines.ecommerce_disruption_engine import ECommerceDisruptionEngine
from app.engines.fuel_transmission_engine import FuelTransmissionEngine
from app.scenarios.gcc_airport_nodes import get_gcc_airports, GCC_AIRPORT_MAP
from app.schemas.scenarios import (
    AirportImpactRequest,
    AirportImpactResponse,
    AirportNodeResponse,
    ECommerceImpactRequest,
    ECommerceImpactResponse,
    FuelImpactRequest,
    FuelImpactResponse,
    ScenarioPackSummary,
    ScenarioPreset,
)

# Crisis pack imports
from app.scenarios.us_iran_gcc_pack import get_us_iran_gcc_pack
from app.schemas.crisis_outputs import (
    CrisisAssessment,
    AirportImpact as CrisisAirportImpact,
    EnergyImpact,
    ECommerceImpact as CrisisECommerceImpact,
)
from app.engines.crisis_risk_engine import (
    airport_disruption_score,
    fuel_impact_score,
    ecommerce_disruption_score,
)
from app.engines.propagation_engine_v3 import run_propagation
from app.engines.decision_engine import build_ranked_actions

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


# Lazy-initialized engines
_airport_engine: AirportDisruptionEngine | None = None
_fuel_engine: FuelTransmissionEngine | None = None
_ecommerce_engine: ECommerceDisruptionEngine | None = None


def get_airport_engine() -> AirportDisruptionEngine:
    """Get or initialize airport disruption engine."""
    global _airport_engine
    if _airport_engine is None:
        _airport_engine = AirportDisruptionEngine()
    return _airport_engine


def get_fuel_engine() -> FuelTransmissionEngine:
    """Get or initialize fuel transmission engine."""
    global _fuel_engine
    if _fuel_engine is None:
        _fuel_engine = FuelTransmissionEngine()
    return _fuel_engine


def get_ecommerce_engine() -> ECommerceDisruptionEngine:
    """Get or initialize e-commerce disruption engine."""
    global _ecommerce_engine
    if _ecommerce_engine is None:
        _ecommerce_engine = ECommerceDisruptionEngine()
    return _ecommerce_engine


@router.get(
    "/packs",
    response_model=list[ScenarioPackSummary],
    status_code=status.HTTP_200_OK,
    summary="List all available scenario packs",
)
async def list_scenario_packs() -> list[ScenarioPackSummary]:
    """List all available scenario packs.

    Returns:
        List of scenario pack summaries with titles and descriptions in English and Arabic.
    """
    try:
        # Placeholder: US-Iran-GCC pack
        packs = [
            ScenarioPackSummary(
                pack_id="us_iran_gcc_pack",
                title_en="US-Iran GCC Crisis Pack",
                title_ar="حزمة أزمة الولايات المتحدة وإيران في مجلس التعاون الخليجي",
                description_en="Comprehensive scenario pack for US-Iran tensions affecting GCC infrastructure, aviation, energy, and logistics.",
                description_ar="حزمة سيناريوهات شاملة لتوترات الولايات المتحدة وإيران التي تؤثر على البنية التحتية بدول مجلس التعاون الخليجي",
            ),
        ]
        return packs
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list scenario packs: {exc}",
        ) from exc


@router.get(
    "/presets",
    response_model=list[ScenarioPreset],
    status_code=status.HTTP_200_OK,
    summary="List scenario presets for ScenarioComposer",
)
async def list_scenario_presets() -> list[ScenarioPreset]:
    """List scenario presets available for ScenarioComposer.

    Returns:
        List of preset scenarios with raw text in English and Arabic.
    """
    try:
        presets = [
            ScenarioPreset(
                id="strait_blockade",
                title_en="Strait of Hormuz Blockade",
                title_ar="حصار مضيق هرمز",
                description_en="Oil tanker blockade in Strait of Hormuz, restricting 20% of global oil supply.",
                description_ar="حصار ناقلات النفط في مضيق هرمز، مما يقيد 20% من إمدادات النفط العالمية",
                raw_text_en="A military blockade of the Strait of Hormuz reduces oil shipping by 20%, causing immediate fuel price spike across GCC region.",
                raw_text_ar="حصار عسكري لمضيق هرمز يقلل من شحن النفط بنسبة 20%، مما يسبب ارتفاع أسعار الوقود الفورية عبر منطقة مجلس التعاون الخليجي",
            ),
            ScenarioPreset(
                id="airspace_closure",
                title_en="Regional Airspace Closure",
                title_ar="إغلاق المجال الجوي الإقليمي",
                description_en="Complete closure of regional airspace due to military conflict, grounding all commercial flights.",
                description_ar="إغلاق كامل للمجال الجوي الإقليمي بسبب نزاع عسكري، وتعطيل جميع الرحلات التجارية",
                raw_text_en="Regional airspace declared unsafe for civilian traffic. All commercial flights rerouted, causing 72-hour ground stop.",
                raw_text_ar="يتم إعلان المجال الجوي الإقليمي غير آمن لحركة المدنيين. يتم إعادة توجيه جميع الرحلات التجارية، مما يسبب توقفاً لمدة 72 ساعة",
            ),
        ]
        return presets
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list scenario presets: {exc}",
        ) from exc


@router.get(
    "/airports",
    response_model=list[AirportNodeResponse],
    status_code=status.HTTP_200_OK,
    summary="List GCC airport nodes with metadata",
)
async def list_gcc_airports_handler() -> list[AirportNodeResponse]:
    """List all GCC Tier-1 airports with metadata.

    Returns:
        List of 9 GCC airports with hub importance, cargo relevance, fuel dependency, and strait proximity.
    """
    try:
        airports = get_gcc_airports()
        return [
            AirportNodeResponse(
                code=airport.code,
                name=airport.name,
                city=airport.city,
                country=airport.country,
                hub_importance=airport.hub_importance,
                cargo_relevance=airport.cargo_relevance,
                fuel_dependency=airport.fuel_dependency,
                strait_proximity=airport.strait_proximity,
                latitude=airport.latitude,
                longitude=airport.longitude,
            )
            for airport in airports
        ]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list airports: {exc}",
        ) from exc


@router.get(
    "/airports/{code}",
    response_model=AirportNodeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single airport by IATA code",
)
async def get_airport_by_code(code: str) -> AirportNodeResponse:
    """Get single airport node by IATA code.

    Args:
        code: IATA airport code (e.g., DXB, RUH, DOH)

    Returns:
        Airport node with all metadata.

    Raises:
        HTTPException: 404 if airport code not found.
    """
    try:
        airport = GCC_AIRPORT_MAP.get(code.upper())
        if not airport:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Airport with code {code} not found",
            )
        return AirportNodeResponse(
            code=airport.code,
            name=airport.name,
            city=airport.city,
            country=airport.country,
            hub_importance=airport.hub_importance,
            cargo_relevance=airport.cargo_relevance,
            fuel_dependency=airport.fuel_dependency,
            strait_proximity=airport.strait_proximity,
            latitude=airport.latitude,
            longitude=airport.longitude,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve airport: {exc}",
        ) from exc


@router.post(
    "/airport-impact",
    response_model=AirportImpactResponse,
    status_code=status.HTTP_200_OK,
    summary="Compute airport disruption scores",
)
async def compute_airport_impact(
    payload: AirportImpactRequest,
) -> AirportImpactResponse:
    """Compute airport disruption scores (ADS) given scenario context.

    Derives rerouting, fuel, congestion, and insurance pressures for each
    airport based on metadata and crisis context, returning per-airport ADS
    and disruption classifications.

    Args:
        payload: Airport impact request with escalation, disruption, and fuel parameters.

    Returns:
        Airport impact response with global context and per-airport disruption scores.
    """
    try:
        engine = get_airport_engine()
        airports = get_gcc_airports()

        # Build scenario context
        scenario_context = {
            "global_rerouting_pressure": payload.escalation_level * payload.airspace_closure_level,
            "fuel_shock_intensity": payload.fuel_shock,
            "network_congestion": payload.escalation_level,
            "insurance_cost_escalation": payload.escalation_level * 0.7,
        }

        # Convert airport dataclass to dict for engine
        airport_dicts = [
            {
                "airport_id": airport.code,
                "strait_proximity": airport.strait_proximity,
                "hub_importance": airport.hub_importance,
                "cargo_relevance": airport.cargo_relevance,
                "fuel_dependency": airport.fuel_dependency,
            }
            for airport in airports
        ]

        # Compute disruption scores
        results = engine.compute_airport_states(airport_dicts, scenario_context)

        # Build per-airport response list
        per_airport_list = []
        for result in results:
            airport_node = GCC_AIRPORT_MAP.get(result["airport_id"])
            if airport_node:
                per_airport_list.append(
                    {
                        "code": result["airport_id"],
                        "name": airport_node.name,
                        "disruption_score": result["disruption_score"],
                        "classification": result["classification"],
                        "rerouting_pressure": result["rerouting_pressure"],
                        "fuel_stress": result["fuel_stress"],
                        "congestion": result["congestion_pressure"],
                        "insurance_stress": result["insurance_stress"],
                    }
                )

        return AirportImpactResponse(
            scenario_id=payload.scenario_id,
            global_rerouting_pressure=scenario_context["global_rerouting_pressure"],
            fuel_shock_intensity=scenario_context["fuel_shock_intensity"],
            network_congestion=scenario_context["network_congestion"],
            insurance_cost_escalation=scenario_context["insurance_cost_escalation"],
            per_airport=[
                {
                    "code": p["code"],
                    "name": p["name"],
                    "disruption_score": p["disruption_score"],
                    "classification": p["classification"],
                    "rerouting_pressure": p["rerouting_pressure"],
                    "fuel_stress": p["fuel_stress"],
                    "congestion": p["congestion"],
                    "insurance_stress": p["insurance_stress"],
                }
                for p in per_airport_list
            ],
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute airport impact: {exc}",
        ) from exc


@router.post(
    "/fuel-impact",
    response_model=FuelImpactResponse,
    status_code=status.HTTP_200_OK,
    summary="Compute fuel transmission impact",
)
async def compute_fuel_impact(
    payload: FuelImpactRequest,
) -> FuelImpactResponse:
    """Compute fuel price transmission impact and sector-specific costs.

    Models how oil shocks, refining constraints, and logistics delays
    translate into fuel cost pressures for aviation, trucking, industrial,
    and consumer sectors.

    Args:
        payload: Fuel impact request with oil shock, refining stress, and logistics delay.

    Returns:
        Fuel impact response with aggregate impact, sector transmission, and timeline.
    """
    try:
        engine = get_fuel_engine()

        # Compute aggregate fuel impact
        fuel_impact = engine.compute_fuel_impact(
            payload.oil_shock,
            payload.refining_stress,
            payload.logistics_delay,
        )

        # Compute sector transmission
        sector_transmission = engine.compute_sector_transmission(fuel_impact)

        # Compute timeline projection (6 phases with escalation factor 0.9)
        escalation_factor = 0.9  # Gradual dampening
        timeline_data = engine.compute_fuel_timeline(
            payload.oil_shock,
            escalation_factor,
            phases=6,
        )

        timeline_list = [
            {
                "phase": item["phase"],
                "oil_shock": item["oil_shock"],
                "fuel_impact": item["fuel_impact"],
                "sector_impacts": item["sector_impacts"],
            }
            for item in timeline_data
        ]

        return FuelImpactResponse(
            scenario_id=payload.scenario_id,
            fuel_impact=fuel_impact,
            sector_transmission=sector_transmission,
            timeline=timeline_list,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute fuel impact: {exc}",
        ) from exc


@router.post(
    "/ecommerce-impact",
    response_model=ECommerceImpactResponse,
    status_code=status.HTTP_200_OK,
    summary="Compute e-commerce disruption",
)
async def compute_ecommerce_impact(
    payload: ECommerceImpactRequest,
) -> ECommerceImpactResponse:
    """Compute e-commerce and trade disruption score (EDS).

    Models how disruptions in shipping, inventory, demand, and payments
    impact e-commerce fulfillment, cross-border trade, and warehouse operations.

    Args:
        payload: E-commerce impact request with delivery delay, inventory stress, demand volatility, and payment friction.

    Returns:
        E-commerce impact response with EDS score, classification, and breakdown.
    """
    try:
        engine = get_ecommerce_engine()

        # Compute disruption score
        eds_score = engine.compute_disruption_score(
            payload.delivery_delay,
            payload.inventory_stress,
            payload.demand_volatility,
            payload.payment_friction,
        )

        # Compute trade impact breakdown
        scenario_context = {
            "shipping_delay": payload.delivery_delay,
            "inventory_shortage": payload.inventory_stress,
            "demand_shock": payload.demand_volatility,
            "payment_system_stress": payload.payment_friction,
            "border_congestion": payload.delivery_delay * 0.7,
            "warehouse_capacity_stress": payload.inventory_stress,
        }
        trade_impact = engine.compute_trade_impact(scenario_context)

        # Get classification
        classification = engine.classify_disruption(eds_score)

        return ECommerceImpactResponse(
            scenario_id=payload.scenario_id,
            eds_score=eds_score,
            classification=classification,
            breakdown=trade_impact,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute e-commerce impact: {exc}",
        ) from exc


# ═══════════════════════════════════════════════════════════════
# Crisis Pack Endpoints — US-Iran GCC Assessment
# ═══════════════════════════════════════════════════════════════


@router.get(
    "/crisis/packs",
    status_code=status.HTTP_200_OK,
    summary="List crisis scenario packs",
    tags=["crisis"],
)
async def list_crisis_packs():
    """List available crisis scenario packs."""
    pack = get_us_iran_gcc_pack()
    return [
        {
            "scenario_id": pack.scenario_id,
            "title": pack.title,
            "categories": pack.categories,
        }
    ]


@router.get(
    "/crisis/packs/us-iran-gcc",
    status_code=status.HTTP_200_OK,
    summary="Get US-Iran GCC scenario pack",
    tags=["crisis"],
)
async def get_crisis_pack():
    """Get the complete US-Iran GCC crisis scenario pack."""
    return get_us_iran_gcc_pack()


@router.get(
    "/crisis/packs/us-iran-gcc/assessment",
    response_model=CrisisAssessment,
    status_code=status.HTTP_200_OK,
    summary="Run full crisis assessment for US-Iran GCC pack",
    tags=["crisis"],
)
async def get_crisis_assessment():
    """Run full crisis assessment: airport impact, energy, e-commerce,
    propagation, and ranked decision actions.

    Returns:
        CrisisAssessment with per-airport ADS, energy impact,
        e-commerce disruption, 5-step propagation, and ranked actions.
    """
    pack = get_us_iran_gcc_pack()

    # ── Airport Impacts ──
    airport_impacts = []
    for node in pack.nodes:
        if node.node_type != "airport":
            continue
        meta = node.metadata
        rerouting = min(1.0, node.exposure * 0.95)
        fuel_stress = min(1.0, meta.get("fuel_relevance", 0.5) * 0.92)
        congestion = min(1.0, meta.get("cargo_relevance", 0.5) * 0.88)
        insurance = min(1.0, node.criticality * 0.75)

        score = airport_disruption_score(
            rerouting, fuel_stress, congestion, insurance,
        )
        airport_impacts.append(
            CrisisAirportImpact(
                airport_code=meta["code"],
                airport_name=node.label,
                rerouting_pressure=round(rerouting, 4),
                fuel_stress=round(fuel_stress, 4),
                congestion_pressure=round(congestion, 4),
                insurance_operating_stress=round(insurance, 4),
                disruption_score=score,
            )
        )

    # ── Energy Impact ──
    energy = EnergyImpact(
        oil_shock=0.78,
        refining_stress=0.62,
        logistics_delay=0.59,
        fuel_impact_score=fuel_impact_score(0.78, 0.62, 0.59),
    )

    # ── E-Commerce Impact ──
    ecommerce = CrisisECommerceImpact(
        delay=0.66,
        inventory_stress=0.61,
        demand_volatility=0.57,
        payment_friction=0.34,
        ecommerce_disruption_score=ecommerce_disruption_score(
            0.66, 0.61, 0.57, 0.34,
        ),
    )

    # ── Propagation ──
    propagation = run_propagation(
        nodes=pack.nodes,
        edges=pack.edges,
        initial_shocks={
            "event_escalation": 1.0,
            "energy_oil": 0.75,
            "social_panic": 0.45,
        },
        steps=5,
    )

    # ── Ranked Actions ──
    actions = build_ranked_actions()

    return CrisisAssessment(
        scenario_id=pack.scenario_id,
        branch_id="regional_escalation",
        airport_impacts=airport_impacts,
        energy_impact=energy,
        ecommerce_impact=ecommerce,
        propagation=propagation,
        ranked_actions=actions,
        summary=(
            "Regional escalation scenario showing strong "
            "airport-fuel-trade coupling across GCC systems."
        ),
    )
