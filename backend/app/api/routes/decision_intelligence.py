"""Decision Intelligence API route.

GET /api/v1/decision-intelligence/us-iran-gcc
  → Runs full crisis assessment
  → Transforms into Decision Intelligence Bundle
  → Returns executive-grade decision options, windows, critical nodes, narrative
"""
from fastapi import APIRouter, HTTPException, status

from app.schemas.decision_intelligence import DecisionIntelligenceBundle
from app.engines.decision_intelligence_engine import build_decision_bundle
from app.engines.executive_narrative_engine import build_executive_narrative
from app.api.routes.scenarios import get_crisis_assessment

router = APIRouter(prefix="/decision-intelligence", tags=["decision-intelligence"])


@router.get(
    "/us-iran-gcc",
    response_model=DecisionIntelligenceBundle,
    status_code=status.HTTP_200_OK,
    summary="Decision intelligence for US-Iran GCC scenario",
)
async def get_decision_intelligence():
    """Generate decision intelligence bundle for US-Iran GCC crisis.

    Pipeline:
      1. Run full crisis assessment (airport, energy, trade, maritime, financial, social)
      2. Build decision options calibrated to assessment severity
      3. Identify critical nodes with highest cascade risk
      4. Generate time-bound decision windows
      5. Build executive narrative
      6. Compute confidence bands

    Returns:
        DecisionIntelligenceBundle with options, windows, critical nodes,
        executive narrative, and confidence bands.
    """
    try:
        # Step 1: Get the full crisis assessment
        assessment = await get_crisis_assessment()

        # Step 2: Build decision intelligence bundle
        bundle = build_decision_bundle(assessment)

        # Step 3: Generate executive narrative
        narrative = build_executive_narrative(assessment)
        bundle.executive_narrative = narrative

        return bundle

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate decision intelligence: {exc}",
        ) from exc
