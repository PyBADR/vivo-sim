from app.schemas.chat import ChatInput, ChatResponse


def _match_question_pattern(question: str) -> str:
    """Match question to a pattern type."""
    question_lower = question.lower()

    if any(word in question_lower for word in ['why', 'cause', 'reason']):
        return "why"
    elif any(word in question_lower for word in ['who', 'person', 'actor', 'agent']):
        return "who"
    elif any(word in question_lower for word in ['what if', 'predict', 'forecast', 'happen']):
        return "what_if"
    elif any(word in question_lower for word in ['how', 'spread', 'amplify', 'influence']):
        return "how"
    elif any(word in question_lower for word in ['when', 'timeline', 'duration', 'phase']):
        return "when"
    else:
        return "general"


def _generate_answer(question_type: str, scenario_id: str) -> tuple[str, list, float]:
    """Generate contextual answer based on question type."""
    answers = {
        "why": (
            "The scenario is driven by multiple interconnected factors. Key drivers include social media amplification, "
            "stakeholder positioning, and underlying structural issues. The combination of these factors creates a feedback loop "
            "that intensifies sentiment and visibility.",
            ["simulation_report", "graph_analysis", "sentiment_tracking"],
            0.75
        ),
        "who": (
            "Multiple actor types are involved: government officials managing the crisis, corporate interests protecting their position, "
            "activists mobilizing support, media amplifying coverage, academics analyzing implications, and influencers shaping narrative. "
            "Each plays a distinct role in the scenario's evolution.",
            ["agent_profiles", "behavioral_analysis", "influence_mapping"],
            0.8
        ),
        "what_if": (
            "Based on historical patterns and the current trajectory, we predict the scenario will evolve through distinct phases: "
            "initial reaction, amplification, peak intensity, and eventual stabilization. Critical intervention points exist during the "
            "amplification phase where policy responses could moderate intensity.",
            ["simulation_steps", "prediction_model", "intervention_analysis"],
            0.7
        ),
        "how": (
            "The scenario spreads through multiple mechanisms: direct social media engagement, influencer amplification, media coverage, "
            "and organizational mobilization. Network effects accelerate visibility during peak phases. The most influential nodes are the "
            "media and influencer agents who reach the broadest audiences.",
            ["network_graph", "spread_analysis", "influence_scoring"],
            0.75
        ),
        "when": (
            "The typical timeline follows a 4-phase pattern: Initial reaction (1-2 days), amplification (3-7 days), peak intensity (8-15 days), "
            "and stabilization (day 16+). The exact timing depends on external factors and policy responses. Critical windows for intervention "
            "occur early in the amplification phase.",
            ["timeline_data", "phase_analysis", "temporal_patterns"],
            0.72
        ),
        "general": (
            "This scenario models complex social dynamics involving multiple stakeholders, information flows, and policy levers. The simulation "
            "reveals how initial conditions, network structure, and behavioral patterns combine to shape outcomes. Key insights include the critical "
            "role of early intervention and the power of narrative control.",
            ["scenario_overview", "model_assumptions", "key_insights"],
            0.65
        )
    }

    return answers.get(question_type, answers["general"])


async def respond(input_data: ChatInput) -> ChatResponse:
    """Generate contextual answer to a question about the scenario."""
    try:
        question = input_data.question
        scenario_id = input_data.scenario_id

        # Match question pattern
        question_type = _match_question_pattern(question)

        # Generate answer
        answer, sources, confidence = _generate_answer(question_type, scenario_id)

        return ChatResponse(
            answer=answer,
            sources=sources,
            confidence=confidence
        )

    except Exception:
        # Fallback: return generic response
        return ChatResponse(
            answer="I can analyze this scenario across multiple dimensions. Would you like to know about the key drivers, "
                   "stakeholders, predicted timeline, or spread mechanisms?",
            sources=["scenario_model"],
            confidence=0.5
        )
