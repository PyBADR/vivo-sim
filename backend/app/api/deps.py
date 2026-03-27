from functools import lru_cache

from app.services.analysis_service import AnalysisService
from app.services.analysis_service_v2 import AnalysisServiceV2
from app.services.agent_service import AgentService
from app.services.brief_service import BriefService
from app.services.brief_service_v2 import BriefServiceV2
from app.services.decision_service import DecisionService
from app.services.decision_service_v2 import DecisionServiceV2
from app.services.graph_service import GraphService
from app.services.scenario_service import ScenarioService
from app.services.signal_service import SignalService
from app.services.simulation_service import SimulationService
from app.services.simulation_service_v2 import SimulationServiceV2


@lru_cache
def get_scenario_service() -> ScenarioService:
    return ScenarioService()


@lru_cache
def get_signal_service() -> SignalService:
    return SignalService()


@lru_cache
def get_graph_service() -> GraphService:
    return GraphService()


@lru_cache
def get_agent_service() -> AgentService:
    return AgentService()


@lru_cache
def get_simulation_service() -> SimulationService:
    return SimulationService()


@lru_cache
def get_simulation_service_v2() -> SimulationServiceV2:
    return SimulationServiceV2()


@lru_cache
def get_decision_service() -> DecisionService:
    return DecisionService()


@lru_cache
def get_decision_service_v2() -> DecisionServiceV2:
    return DecisionServiceV2()


@lru_cache
def get_brief_service() -> BriefService:
    return BriefService()


@lru_cache
def get_brief_service_v2() -> BriefServiceV2:
    return BriefServiceV2()


@lru_cache
def get_analysis_service() -> AnalysisService:
    return AnalysisService()


@lru_cache
def get_analysis_service_v2() -> AnalysisServiceV2:
    return AnalysisServiceV2()
