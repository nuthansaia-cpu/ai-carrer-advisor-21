"""
Career matching and recommendation engine.
Implements the hybrid rule-based + cosine similarity approach described in the PRD.
"""

from typing import List, Dict, Any, Optional
from app.data.career_roles import CAREER_ROLES
from app.services.skill_extractor import normalize_skill_list


# Education keyword → normalised category mapping
EDUCATION_MAP = {
    "computer science": "computer science",
    "cs": "computer science",
    "cse": "computer science",
    "software engineering": "software engineering",
    "se": "software engineering",
    "information technology": "information technology",
    "it": "information technology",
    "data science": "data science",
    "ds": "data science",
    "statistics": "statistics",
    "mathematics": "mathematics",
    "math": "mathematics",
    "maths": "mathematics",
    "artificial intelligence": "artificial intelligence",
    "ai": "artificial intelligence",
    "machine learning": "artificial intelligence",
    "networking": "networking",
    "network engineering": "networking",
    "electrical engineering": "electrical engineering",
    "ee": "electrical engineering",
    "physics": "physics",
    "linguistics": "linguistics",
    "cybersecurity": "cybersecurity",
    "cyber security": "cybersecurity",
    "web development": "web development",
    "commerce": "commerce",
    "business": "commerce",
    "mba": "commerce",
}


def _normalize_education(degree: str, branch: str) -> str:
    """Return a normalised education label from degree + branch input."""
    combined = f"{degree} {branch}".lower().strip()
    for key, val in EDUCATION_MAP.items():
        if key in combined:
            return val
    return combined


def _skill_match_score(user_skills: List[str], role: Dict) -> Dict:
    """
    Calculate skill match details between user skills and a role.
    Returns a dict with score, matched, missing, and priority breakdown.
    """
    user_set = set(s.lower() for s in user_skills)
    required = [s.lower() for s in role["required_skills"]]
    preferred = [s.lower() for s in role["preferred_skills"]]
    priorities = {k.lower(): v for k, v in role.get("skill_priorities", {}).items()}

    # Required skills: worth 70% of the score
    req_matched = [s for s in required if s in user_set]
    req_missing = [s for s in required if s not in user_set]
    req_score = (len(req_matched) / len(required)) * 70 if required else 0

    # Preferred skills: worth 30%
    pref_matched = [s for s in preferred if s in user_set]
    pref_missing = [s for s in preferred if s not in user_set]
    pref_score = (len(pref_matched) / len(preferred)) * 30 if preferred else 0

    raw_score = req_score + pref_score

    # All missing skills with priorities
    all_missing = req_missing + pref_missing
    missing_with_priority = [
        {"skill": s, "priority": priorities.get(s, "medium")} for s in all_missing
    ]

    # Sort missing by priority: high → medium → low
    priority_order = {"high": 0, "medium": 1, "low": 2}
    missing_with_priority.sort(key=lambda x: priority_order.get(x["priority"], 1))

    return {
        "raw_score": round(raw_score, 2),
        "required_matched": req_matched,
        "required_missing": req_missing,
        "preferred_matched": pref_matched,
        "preferred_missing": pref_missing,
        "missing_with_priority": missing_with_priority,
    }


def _education_bonus(user_education: str, role: Dict) -> float:
    """Return a small education alignment bonus (0–5 points)."""
    edu = user_education.lower()
    for role_edu in role.get("education", []):
        if role_edu.lower() in edu or edu in role_edu.lower():
            return 5.0
    return 0.0


def _experience_bonus(years_experience: int, role: Dict) -> float:
    """Return a small experience bonus (0–5 points)."""
    if not role.get("experience_boost"):
        return 0.0
    if years_experience >= 2:
        return 5.0
    if years_experience == 1:
        return 2.5
    return 0.0


def _certifications_bonus(certifications: List[str]) -> float:
    """Up to 3 bonus points for certifications."""
    return min(len(certifications) * 1.0, 3.0)


def _projects_bonus(projects: List[str]) -> float:
    """Up to 2 bonus points for projects."""
    return min(len(projects) * 0.5, 2.0)


def compute_career_readiness(
    user_skills: List[str],
    education: str,
    years_experience: int,
    projects: List[str],
    certifications: List[str],
) -> Dict:
    """
    Compute the overall Career Readiness Score (0–100) breakdown.
    """
    # Technical skills breadth: how many distinct skills the user has
    total_known_skills = 80  # approximate total skills in our dictionary
    tech_pct = min(len(user_skills) / total_known_skills, 1.0) * 100

    # Education score: 100 if any recognised education, 60 otherwise
    edu_score = 100 if education and education != "other" else 60

    # Projects
    proj_score = min(len(projects) * 20, 100)

    # Certifications
    cert_score = min(len(certifications) * 25, 100)

    # Experience
    exp_score = min(years_experience * 30, 100)

    overall = round(
        tech_pct * 0.30
        + edu_score * 0.25
        + proj_score * 0.20
        + cert_score * 0.15
        + exp_score * 0.10,
        1,
    )

    return {
        "overall": overall,
        "technical_skills": round(tech_pct, 1),
        "education": edu_score,
        "projects": proj_score,
        "certifications": cert_score,
        "experience": exp_score,
    }


def generate_recommendations(
    user_skills: List[str],
    education: str,
    branch: str,
    years_experience: int,
    projects: List[str],
    certifications: List[str],
    interests: List[str],
    career_goal: Optional[str],
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    """
    Generate ranked career recommendations for a user profile.
    Returns top_n career matches sorted by fit score descending.
    """
    # Normalize inputs
    norm_skills = normalize_skill_list(user_skills)
    norm_edu = _normalize_education(education, branch)

    results = []

    for role_id, role in CAREER_ROLES.items():
        skill_data = _skill_match_score(norm_skills, role)
        edu_bonus = _education_bonus(norm_edu, role)
        exp_bonus = _experience_bonus(years_experience, role)
        cert_bonus = _certifications_bonus(certifications)
        proj_bonus = _projects_bonus(projects)

        # Interest alignment bonus (up to 5 points)
        interest_bonus = 0.0
        if interests:
            role_industry = role.get("industry", "").lower()
            for interest in interests:
                if interest.lower() in role_industry or role_industry in interest.lower():
                    interest_bonus = 5.0
                    break

        # Career goal alignment bonus
        goal_bonus = 0.0
        if career_goal:
            if career_goal.lower() in role["title"].lower() or role_id in career_goal.lower().replace(" ", "_"):
                goal_bonus = 8.0

        raw = skill_data["raw_score"]
        total_score = min(
            raw + edu_bonus + exp_bonus + cert_bonus + proj_bonus + interest_bonus + goal_bonus,
            100.0,
        )

        results.append(
            {
                "role_id": role_id,
                "title": role["title"],
                "industry": role["industry"],
                "description": role["description"],
                "fit_score": round(total_score, 1),
                "skill_score": round(raw, 1),
                "matched_skills": skill_data["required_matched"] + skill_data["preferred_matched"],
                "missing_skills": skill_data["missing_with_priority"],
                "required_matched": skill_data["required_matched"],
                "required_missing": skill_data["required_missing"],
                "preferred_matched": skill_data["preferred_matched"],
                "roadmap": role["roadmap"],
            }
        )

    # Sort by fit score
    results.sort(key=lambda x: x["fit_score"], reverse=True)
    return results[:top_n]


def get_role_gap_analysis(role_id: str, user_skills: List[str]) -> Optional[Dict]:
    """
    Get detailed skill gap analysis for a specific role.
    """
    role = CAREER_ROLES.get(role_id)
    if not role:
        return None

    norm_skills = normalize_skill_list(user_skills)
    skill_data = _skill_match_score(norm_skills, role)

    return {
        "role_id": role_id,
        "title": role["title"],
        "description": role["description"],
        "fit_score": round(skill_data["raw_score"], 1),
        "required_matched": skill_data["required_matched"],
        "required_missing": skill_data["required_missing"],
        "preferred_matched": skill_data["preferred_matched"],
        "preferred_missing": skill_data["preferred_missing"],
        "missing_with_priority": skill_data["missing_with_priority"],
        "roadmap": role["roadmap"],
    }


def compare_careers(role_ids: List[str], user_skills: List[str]) -> List[Dict]:
    """
    Return side-by-side comparison data for a list of role IDs.
    """
    norm_skills = normalize_skill_list(user_skills)
    comparison = []
    for role_id in role_ids:
        role = CAREER_ROLES.get(role_id)
        if not role:
            continue
        skill_data = _skill_match_score(norm_skills, role)
        comparison.append(
            {
                "role_id": role_id,
                "title": role["title"],
                "fit_score": round(skill_data["raw_score"], 1),
                "required_skills": role["required_skills"],
                "preferred_skills": role["preferred_skills"],
                "matched_count": len(skill_data["required_matched"]) + len(skill_data["preferred_matched"]),
                "missing_count": len(skill_data["required_missing"]) + len(skill_data["preferred_missing"]),
                "industry": role["industry"],
            }
        )
    comparison.sort(key=lambda x: x["fit_score"], reverse=True)
    return comparison
