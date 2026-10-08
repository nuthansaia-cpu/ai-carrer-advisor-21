"""
AI logic correctness tests — run directly with:  python test_ai_logic.py
"""
from app.services.skill_extractor import extract_skills_from_text, normalize_skill_list
from app.services.recommender import generate_recommendations, get_role_gap_analysis, compare_careers, compute_career_readiness

PASS = 0
FAIL = 0

def check(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        print(f"  [PASS] {name}")
        PASS += 1
    else:
        print(f"  [FAIL] {name}  {detail}")
        FAIL += 1


print("\n=== SKILL EXTRACTOR ===")
skills = extract_skills_from_text("Python pandas SQL Power BI machine learning Docker REST APIs")
check("python extracted",         "python" in skills)
check("pandas extracted",         "pandas" in skills)
check("sql extracted",            "sql" in skills)
check("power bi extracted",       "power bi" in skills)
check("machine learning extracted","machine learning" in skills)
check("docker extracted",         "docker" in skills)
check("rest api extracted",       "rest api" in skills)

norm = normalize_skill_list(["py", "sklearn", "tf", "powerbi", "ML", "k8s"])
check("py -> python",             "python" in norm)
check("sklearn -> scikit-learn",  "scikit-learn" in norm)
check("tf -> tensorflow",         "tensorflow" in norm)
check("powerbi -> power bi",      "power bi" in norm)
check("ML -> machine learning",   "machine learning" in norm)
check("k8s -> kubernetes",        "kubernetes" in norm)


print("\n=== CAREER MATCHING ===")
# Perfect data analyst profile
recs = generate_recommendations(
    user_skills=["python","sql","excel","statistics","data visualization","power bi","tableau","pandas"],
    education="B.Sc", branch="Statistics",
    years_experience=2, projects=["d1","d2","d3"],
    certifications=["Google DA","IBM DA"],
    interests=["Data Analytics"], career_goal="Data Analyst", top_n=5
)
top = recs[0]
check("DA is top for DA profile",     top["title"] == "Data Analyst",      f"got {top['title']}")
check("DA score >= 90% (perfect)",    top["fit_score"] >= 90,              f"got {top['fit_score']}")
check("DA no missing required",       top["required_missing"] == [],        f"got {top['required_missing']}")

# Weak profile
recs2 = generate_recommendations(
    user_skills=["html","css"],
    education="BBA", branch="Business",
    years_experience=0, projects=[], certifications=[],
    interests=[], career_goal="", top_n=10
)
ml = next(r for r in recs2 if r["role_id"] == "ml_engineer")
check("Weak profile ML score < 20%",  ml["fit_score"] < 20,               f"got {ml['fit_score']}")

# Career goal bonus applied
recs3 = generate_recommendations(
    user_skills=["python","machine learning","statistics"],
    education="B.Tech", branch="Computer Science",
    years_experience=0, projects=[], certifications=[],
    interests=[], career_goal="Machine Learning Engineer", top_n=5
)
goal_role = next((r for r in recs3 if r["role_id"] == "ml_engineer"), None)
check("Goal ML Eng appears in top-5", goal_role is not None)
check("Goal bonus boosts ML Eng",     goal_role["fit_score"] >= 50,        f"got {goal_role['fit_score'] if goal_role else 'N/A'}")

# Returns exactly top_n results
recs4 = generate_recommendations(["python"], "B.Tech", "CS", 0, [], [], [], "", top_n=3)
check("Returns top_n=3 results",      len(recs4) == 3,                     f"got {len(recs4)}")


print("\n=== SKILL GAP ANALYSIS ===")
gap = get_role_gap_analysis("ml_engineer", ["python","statistics","sql"])
check("Gap returns valid role",        gap is not None)
check("Fit score is numeric",          isinstance(gap["fit_score"], float))
check("Required matched has python",   "python" in gap["required_matched"])
check("Deep learning is missing",      "deep learning" in gap["required_missing"])
check("Missing has priority field",    all("priority" in m for m in gap["missing_with_priority"]))
check("High priority items exist",     any(m["priority"]=="high" for m in gap["missing_with_priority"]))
check("Roadmap has 6 months",          len(gap["roadmap"]) == 6)

gap404 = get_role_gap_analysis("nonexistent_role", ["python"])
check("Returns None for bad role_id",  gap404 is None)


print("\n=== CAREER COMPARISON ===")
cmp = compare_careers(["data_analyst","ml_engineer","frontend_developer"], ["python","sql","pandas"])
check("Returns 3 comparison results",  len(cmp) == 3)
check("Sorted by fit_score desc",      cmp[0]["fit_score"] >= cmp[1]["fit_score"])
check("Has matched_count field",       all("matched_count" in r for r in cmp))
check("Has missing_count field",       all("missing_count" in r for r in cmp))
check("DA outranks frontend for DA skills", cmp[0]["role_id"] in ["data_analyst","ml_engineer"])


print("\n=== CAREER READINESS SCORE ===")
rd = compute_career_readiness(
    user_skills=["python","sql","pandas","numpy","machine learning","statistics"],
    education="computer science",
    years_experience=2, projects=["p1","p2"],
    certifications=["cert1"]
)
check("Returns overall score",         "overall" in rd)
check("Overall is 0-100",              0 <= rd["overall"] <= 100)
check("Has 5 breakdown fields",        all(k in rd for k in ["technical_skills","education","projects","certifications","experience"]))
check("Education 100 for CS degree",   rd["education"] == 100)
check("Experience > 0 for 2 years",   rd["experience"] > 0)

rd0 = compute_career_readiness([], "other", 0, [], [])
check("Zero skills -> low score",      rd0["overall"] < 40)


print(f"\n{'='*40}")
print(f"RESULTS: {PASS} passed, {FAIL} failed")
if FAIL == 0:
    print("ALL TESTS PASSED")
else:
    print(f"WARNING: {FAIL} test(s) failed")
