# AI Career Advisor

> **An Explainable AI Platform for Skill–Job Matching and Personalized Career Development**
>
> IBM Internship Project · SDG 8 — Decent Work and Economic Growth

---

## 📋 Project Overview

AI Career Advisor is an AI-powered career guidance platform that helps students and job seekers:

| Question | Answer |
|---|---|
| What am I good at? | Skill extraction from profile or resume |
| Which careers match me? | AI career matching with Job Fit Score |
| What am I missing? | Detailed skill-gap analysis with priority levels |
| What should I learn? | Personalized month-by-month learning roadmap |

---

## 🏗 Architecture

```
ai-career-advisor/
├── backend/                    ← FastAPI Python backend
│   ├── app/
│   │   ├── main.py             ← FastAPI app entry point
│   │   ├── routers/
│   │   │   └── profile.py      ← API endpoints
│   │   ├── services/
│   │   │   ├── skill_extractor.py   ← NLP skill extraction engine
│   │   │   └── recommender.py       ← Career matching & scoring engine
│   │   └── data/
│   │       └── career_roles.py      ← Career knowledge base (10 roles)
│   └── requirements.txt
│
└── frontend/                   ← React.js frontend
    ├── public/
    └── src/
        ├── App.js              ← Root component + navigation
        ├── api/
        │   └── client.js       ← Axios API calls
        ├── components/
        │   ├── TagInput.js         ← Tag chip input component
        │   └── ResultComponents.js ← Score rings, gap tables, roadmap
        └── pages/
            ├── ProfilePage.js  ← Profile form + resume extraction
            ├── ResultsPage.js  ← Results, gap analysis, roadmap
            └── ComparePage.js  ← Career comparison table
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+ and pip
- Node.js 18+ and npm

### 1. Start the Backend

```bash
cd ai-career-advisor/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend API available at: http://localhost:8000  
Interactive API docs: http://localhost:8000/docs

### 2. Start the Frontend

```bash
cd ai-career-advisor/frontend
npm install
npm start
```

Frontend available at: http://localhost:3000

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profile/analyze` | Analyze full user profile → recommendations |
| POST | `/api/profile/extract-skills` | Extract skills from resume text |
| POST | `/api/profile/gap-analysis` | Detailed gap for a specific role |
| POST | `/api/profile/compare` | Side-by-side career comparison |
| GET  | `/api/profile/roles` | List all available career roles |
| GET  | `/api/profile/roles/{id}` | Single role details |

### Example: Analyze Profile

```bash
curl -X POST http://localhost:8000/api/profile/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "education": "B.Tech",
    "branch": "Computer Science",
    "technical_skills": ["Python", "SQL", "Pandas", "Power BI"],
    "soft_skills": ["Communication"],
    "projects": ["Sales Dashboard"],
    "certifications": [],
    "years_experience": 0,
    "interests": ["Data Analytics"],
    "career_goal": "Data Analyst"
  }'
```

---

## 🎯 Supported Career Roles

| Role ID | Career Title | Industry |
|---------|-------------|----------|
| `data_analyst` | Data Analyst | Data & Analytics |
| `data_scientist` | Data Scientist | Data & Analytics |
| `ml_engineer` | Machine Learning Engineer | AI / ML |
| `nlp_engineer` | NLP Engineer | AI / ML |
| `python_developer` | Python Developer | Software Dev |
| `frontend_developer` | Frontend Developer | Software Dev |
| `backend_developer` | Backend Developer | Software Dev |
| `cloud_engineer` | Cloud Engineer | Cloud |
| `devops_engineer` | DevOps Engineer | Cloud |
| `cybersecurity_analyst` | Cybersecurity Analyst | Security |

---

## 🤖 AI Engine

### Scoring Formula

```
Fit Score = skill_score + education_bonus + experience_bonus
           + certifications_bonus + projects_bonus
           + interest_bonus + goal_bonus

skill_score = (required_matched / required_total × 70)
            + (preferred_matched / preferred_total × 30)
```

### Layers

1. **Skill Extraction** — 150+ skill aliases mapped to canonical names using regex
2. **Career Matching** — Weighted scoring engine comparing user skills to role requirements
3. **Gap Analysis** — Each missing skill tagged: 🔴 High / 🟡 Medium / 🟢 Low priority
4. **Explainability** — Human-readable explanation for every recommendation
5. **Roadmap Generation** — Month-by-month plans from the career knowledge base

---

## 🌍 SDG 8 Alignment

> **SDG 8 — Decent Work and Economic Growth**

AI Career Advisor contributes by:
- Reducing skill–job mismatch
- Helping students identify suitable career paths
- Providing actionable learning roadmaps
- Improving employability through targeted skill development

---

## ⚖ Responsible AI

- **Transparency** — Every recommendation explains why it was made
- **Fairness** — No demographic attributes affect recommendations
- **Explainability** — Skill details shown, not just a black-box score
- **Growth mindset** — Low scores shown as learning opportunities, never as rejection
- **Human agency** — The AI provides guidance; the user makes decisions

---

## 🔮 Future Scope

- **V2**: IBM watsonx NLP integration, real-time job market data, resume builder
- **V3**: Sentence transformer embeddings for semantic skill matching, salary insights
- **V4**: AI mock interviews, job application tracking, career progression prediction
