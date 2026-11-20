def rice_score(reach: float, impact: float, confidence_percent: float, effort: float) -> float:
    """RICE prioritization: (reach * impact * confidence proportion) / effort."""
    if effort <= 0:
        raise ValueError("Effort must be positive")
    if not 0 <= confidence_percent <= 100:
        raise ValueError("Confidence must be between 0 and 100")
    if reach < 0 or impact < 0:
        raise ValueError("Reach and impact cannot be negative")
    return round(reach*impact*(confidence_percent/100)/effort,2)

def user_story(persona: str, goal: str, benefit: str) -> str:
    if not all((persona.strip(),goal.strip(),benefit.strip())):
        raise ValueError("All user story fields are required")
    return f"As a {persona.strip()}, I want to {goal.strip()} so that {benefit.strip()}."
