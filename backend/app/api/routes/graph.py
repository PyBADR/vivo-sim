from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_graph_service
from app.schemas.graph import (
    GraphBuildRequest,
    GraphBuildResponse,
    GraphEnrichRequest,
    GraphEnrichResponse,
)
from app.services.graph_service import GraphService

router = APIRouter(prefix="/graph", tags=["graph"])


@router.post(
    "/build",
    response_model=GraphBuildResponse,
    status_code=status.HTTP_200_OK,
)
def build_graph(
    payload: GraphBuildRequest,
    service: GraphService = Depends(get_graph_service),
) -> GraphBuildResponse:
    try:
        return service.build(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to build graph.",
        ) from exc


@router.post(
    "/enrich",
    response_model=GraphEnrichResponse,
    status_code=status.HTTP_200_OK,
)
def enrich_graph(
    payload: GraphEnrichRequest,
    service: GraphService = Depends(get_graph_service),
) -> GraphEnrichResponse:
    try:
        return service.enrich(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enrich graph.",
        ) from exc
