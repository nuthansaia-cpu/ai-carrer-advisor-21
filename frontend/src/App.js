import React, { useState } from "react";
import ProfileForm from "./pages/ProfilePage";
import ResultsPage from "./pages/ResultsPage";
import ComparePage from "./pages/ComparePage";

const TABS = [
  { id: "profile", label: "My Profile" },
  { id: "compare", label: "Compare Careers" },
  { id: "about",   label: "About" },
];

export default function App() {
  const [tab, setTab] = useState("profile");
  const [results, setResults] = useState(null);
  const [lastProfile, setLastProfile] = useState(null);

  const handleResults = (res, profile) => {
    setResults(res);
    setLastProfile(profile);
    // Stay on profile tab — results are shown in the same tab
  };

  const handleBack = () => {
    setResults(null);
  };

  return (
    <div>
      {/* ── Top Header ─────────────────────────────────── */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="header-logo">🎓</div>
            <div>
              <h1>AI Career Advisor</h1>
              <p>Explainable AI · Skill–Job Matching · Personalized Roadmaps</p>
            </div>
            <span className="sdg-badge">SDG 8</span>
          </div>
        </div>
      </header>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="tabs">
        <div className="container" style={{ display: "flex" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => {
                setTab(t.id);
                if (t.id === "profile") setResults(null);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Page Content ───────────────────────────────── */}
      <main className="container page">
        {tab === "profile" && (
          results
            ? <ResultsPage results={results} profile={lastProfile} onBack={handleBack} />
            : (
              <div>
                <div className="page-title">Build Your Career Profile</div>
                <div className="page-subtitle">
                  Tell us about your education, skills, projects, and goals. Our AI engine will
                  identify your best-fit career paths, calculate your Job Fit Score, analyze your
                  skill gaps, and generate a personalized learning roadmap.
                </div>
                <div className="card">
                  <ProfileForm onResults={handleResults} />
                </div>
              </div>
            )
        )}

        {tab === "compare" && (
          <ComparePage userSkills={lastProfile?.technical_skills || []} />
        )}

        {tab === "about" && <AboutPage />}
      </main>
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <div className="page-title">About AI Career Advisor</div>
      <div className="page-subtitle">An IBM internship project supporting SDG 8 — Decent Work and Economic Growth</div>

      <div className="card">
        <div className="card-title">🎯 What This Platform Does</div>
        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          AI Career Advisor is an explainable AI-powered career intelligence platform that bridges the gap
          between a user's current skills and the requirements of the modern job market. By combining skill
          extraction, career matching, skill-gap analysis, and personalized learning roadmaps, the platform
          helps students and job seekers make informed career decisions and become better prepared for
          meaningful employment.
        </p>
      </div>

      <div className="card">
        <div className="card-title">❓ The Four Questions We Answer</div>
        <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
          {[
            { q: "What am I good at?", a: "We identify and map your technical and soft skills from your profile or resume." },
            { q: "Which careers match my profile?", a: "Our AI engine compares your skills against 10 career role profiles and ranks them by fit score." },
            { q: "What skills am I missing?", a: "Skill-gap analysis highlights exactly which skills you need for each target career, with priority levels." },
            { q: "What should I learn next?", a: "A personalized month-by-month learning roadmap guides you from your current level to job-readiness." },
          ].map((item) => (
            <div key={item.q} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>🔹 {item.q}</div>
              <div className="text-muted text-sm">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">🤖 AI Architecture</div>
        <div className="text-muted text-sm" style={{ lineHeight: 1.9 }}>
          <strong>Layer 1 — Skill Extraction:</strong> Regex + alias dictionary matches raw text and normalizes skills to canonical names.<br />
          <strong>Layer 2 — Career Matching:</strong> Weighted scoring engine (70% required skills, 30% preferred) with bonuses for education, experience, projects, certifications, and interests.<br />
          <strong>Layer 3 — Gap Analysis:</strong> Every skill is compared against role requirements and tagged with priority (High / Medium / Low).<br />
          <strong>Layer 4 — Explainability:</strong> Every recommendation includes a human-readable explanation of why it was recommended.<br />
          <strong>Layer 5 — Roadmap Generation:</strong> Personalized month-by-month learning plans based on identified gaps.
        </div>
      </div>

      <div className="card">
        <div className="card-title">🌍 SDG 8 — Decent Work and Economic Growth</div>
        <div className="text-muted text-sm" style={{ lineHeight: 1.8 }}>
          AI Career Advisor supports SDG 8 by reducing skill–job mismatch through personalized AI-driven
          career recommendations and skill-gap analysis, enabling students and job seekers to identify
          suitable career paths and develop the skills required for meaningful employment.
        </div>
      </div>

      <div className="card">
        <div className="card-title">🛠 Technology Stack</div>
        <div className="grid-2" style={{ gap: 14, marginTop: 4 }}>
          {[
            { layer: "Frontend", stack: "React.js, HTML5, CSS3, JavaScript (ES6+)" },
            { layer: "Backend", stack: "Python, FastAPI, Pydantic, Uvicorn" },
            { layer: "AI Engine", stack: "Rule-based matching, Weighted scoring, NLP keyword extraction" },
            { layer: "Data", stack: "Curated career roles knowledge base with 10 career profiles" },
          ].map((item) => (
            <div key={item.layer} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{item.layer}</div>
              <div className="text-sm text-muted">{item.stack}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">⚖ Responsible AI Principles</div>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            "Transparency — every recommendation explains why it was made",
            "Fairness — no demographic or personal attributes affect career recommendations",
            "Explainability — skill matching details are shown, not just a final score",
            "Privacy — only career-relevant information is used",
            "Human decision-making — the AI provides guidance, not absolute decisions",
            "Growth mindset — low scores are framed as learning opportunities, never as rejection",
          ].map((p) => (
            <div key={p} className="text-sm" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
              ✅ {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
