"""
Router: /api/profile — career analysis endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from app.services.recommender import (
    generate_recommendations,
    get_role_gap_analysis,
    compute_career_readiness,
    compare_careers,
)
from app.services.skill_extractor import extract_skills_from_text, normalize_skill_list
from app.data.career_roles import CAREER_ROLES

router = APIRouter(prefix="/api/profile", tags=["profile"])


# ── Request / Response Models ──────────────────────────────────────────────────

class UserProfile(BaseModel):
    name: Optional[str] = Field(default="", description="User's name (optional)")
    education: str = Field(..., description="Degree title, e.g. 'B.Tech', 'B.Sc'")
    branch: str = Field(..., description="Specialization / branch, e.g. 'Computer Science'")
    graduation_year: Optional[int] = Field(default=None)
    technical_skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list, description="List of project titles/descriptions")
    certifications: List[str] = Field(default_factory=list)
    years_experience: int = Field(default=0, ge=0)
    interests: List[str] = Field(default_factory=list)
    career_goal: Optional[str] = Field(default="")
    preferred_industries: List[str] = Field(default_factory=list)


class ResumeText(BaseModel):
    text: str = Field(..., description="Raw text extracted from a resume")


class GapAnalysisRequest(BaseModel):
    role_id: str
    user_skills: List[str]


class CompareRequest(BaseModel):
    role_ids: List[str]
    user_skills: List[str]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/analyze")
def analyze_profile(profile: UserProfile):
    """
    Main endpoint: analyze a user profile and return top career recommendations,
    career readiness score, and skill analysis.
    """
    all_skills = profile.technical_skills + profile.soft_skills
    norm_skills = normalize_skill_list(all_skills)

    # Generate recommendations
    recommendations = generate_recommendations(
        user_skills=norm_skills,
        education=profile.education,
        branch=profile.branch,
        years_experience=profile.years_experience,
        projects=profile.projects,
        certifications=profile.certifications,
        interests=profile.interests,
        career_goal=profile.career_goal,
        top_n=5,
    )

    # Career readiness breakdown
    readiness = compute_career_readiness(
        user_skills=norm_skills,
        education=profile.branch,
        years_experience=profile.years_experience,
        projects=profile.projects,
        certifications=profile.certifications,
    )

    return {
        "name": profile.name,
        "normalized_skills": norm_skills,
        "readiness": readiness,
        "recommendations": recommendations,
    }


@router.post("/extract-skills")
def extract_skills(resume: ResumeText):
    """
    Extract skills from raw resume text.
    Returns a list of identified canonical skill names.
    """
    skills = extract_skills_from_text(resume.text)
    return {"extracted_skills": skills, "count": len(skills)}


@router.post("/gap-analysis")
def gap_analysis(req: GapAnalysisRequest):
    """
    Get detailed skill gap analysis for a specific target role.
    """
    result = get_role_gap_analysis(req.role_id, req.user_skills)
    if not result:
        raise HTTPException(status_code=404, detail=f"Role '{req.role_id}' not found.")
    return result


@router.post("/compare")
def compare(req: CompareRequest):
    """
    Compare multiple careers side by side for a given skill set.
    """
    if len(req.role_ids) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 role IDs to compare.")
    result = compare_careers(req.role_ids, req.user_skills)
    return {"comparison": result}


@router.get("/roles")
def list_roles():
    """
    Return the list of all available career roles.
    """
    return {
        "roles": [
            {
                "id": r["id"],
                "title": r["title"],
                "industry": r["industry"],
                "description": r["description"],
                "required_skills": r["required_skills"],
            }
            for r in CAREER_ROLES.values()
        ]
    }


@router.get("/roles/{role_id}")
def get_role(role_id: str):
    """
    Return details about a specific career role.
    """
    role = CAREER_ROLES.get(role_id)
    if not role:
        raise HTTPException(status_code=404, detail=f"Role '{role_id}' not found.")
    return role
