import React, { useState } from "react";
import {
  RecommendationCard,
  SkillGapTable,
  RoadmapTimeline,
  ReadinessDashboard,
} from "../components/ResultComponents";

export default function ResultsPage({ results, profile, onBack }) {
  const [selectedRec, setSelectedRec] = useState(results.recommendations?.[0] || null);
  const [activeTab, setActiveTab] = useState("overview");

  if (!results) return null;

  const { recommendations, readiness, normalized_skills, name } = results;
  const displayName = name || profile?.name || "";

  return (
    <div>
      {/* ── Header Summary ─────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="flex-between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="page-title" style={{ marginBottom: 4 }}>
              {displayName ? `${displayName}'s Career Analysis` : "Your Career Analysis"}
            </div>
            <div className="text-muted text-sm">
              {normalized_skills?.length || 0} skills identified &nbsp;·&nbsp;
              {recommendations?.length || 0} career matches found
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            ← Edit Profile
          </button>
        </div>

        {/* Identified skills */}
        {normalized_skills?.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div className="text-sm bold text-muted" style={{ marginBottom: 8 }}>Identified Skills</div>
            <div className="flex-gap">
              {normalized_skills.map((s) => (
                <span key={s} className="skill-chip matched">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sub-tabs ────────────────────────────────────── */}
      <div className="tabs" style={{ marginBottom: 20, borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
        {[
          { id: "overview",    label: "🎯 Career Matches" },
          { id: "readiness",   label: "📊 Readiness Score" },
          { id: "gap",         label: "🔍 Skill Gap" },
          { id: "roadmap",     label: "🗺 Learning Roadmap" },
        ].map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ────────────────────────────────── */}
      {activeTab === "overview" && (
        <div>
          <div style={{ display: "grid", gap: 14 }}>
            {recommendations?.map((rec) => (
              <RecommendationCard
                key={rec.role_id}
                rec={rec}
                isSelected={selectedRec?.role_id === rec.role_id}
                onClick={() => {
                  setSelectedRec(rec);
                  setActiveTab("gap");
                }}
              />
            ))}
          </div>
          {recommendations?.length === 0 && (
            <div className="alert alert-info">
              No recommendations found. Try adding more skills to your profile.
            </div>
          )}
          <div className="alert alert-info" style={{ marginTop: 16 }}>
            <span>💡</span>
            <div>Click any career card to view your detailed skill gap analysis and personalized learning roadmap.</div>
          </div>
        </div>
      )}

      {/* ── Readiness Tab ───────────────────────────────── */}
      {activeTab === "readiness" && (
        <div className="card">
          <div className="card-title">📊 Career Readiness Score</div>
          <ReadinessDashboard readiness={readiness} />
          <hr className="divider" />
          <div className="text-sm text-muted" style={{ lineHeight: 1.7 }}>
            <strong>How this is calculated:</strong><br />
            Technical breadth (30%) · Education alignment (25%) ·
            Projects (20%) · Certifications (15%) · Experience (10%).<br />
            Add more projects and certifications to improve your score.
          </div>
        </div>
      )}

      {/* ── Skill Gap Tab ───────────────────────────────── */}
      {activeTab === "gap" && (
        <div>
          {/* Role selector */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Select a Career to Analyze</div>
            <div className="flex-gap">
              {recommendations?.map((rec) => (
                <button
                  key={rec.role_id}
                  className={`btn btn-sm ${selectedRec?.role_id === rec.role_id ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setSelectedRec(rec)}
                >
                  {rec.title} <span style={{ opacity: 0.8, marginLeft: 4 }}>{rec.fit_score}%</span>
                </button>
              ))}
            </div>
          </div>

          {selectedRec && (
            <div className="card">
              <div className="card-title">
                {selectedRec.title}
                <span
                  style={{
                    marginLeft: "auto",
                    background: selectedRec.fit_score >= 70 ? "var(--success-bg)" : "var(--warning-bg)",
                    color: selectedRec.fit_score >= 70 ? "var(--success)" : "var(--warning)",
                    border: "1px solid",
                    borderRadius: 20,
                    padding: "2px 14px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                  }}
                >
                  {selectedRec.fit_score}% Match
                </span>
              </div>

              {/* Explainable AI section */}
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                <span>🤖</span>
                <div>
                  <strong>Why this career matches you:</strong> Based on your{" "}
                  {selectedRec.required_matched?.length > 0
                    ? `strong match in ${selectedRec.required_matched.slice(0, 3).join(", ")}`
                    : "current profile"}
                  .{" "}
                  {selectedRec.required_missing?.length > 0
                    ? `Strengthening ${selectedRec.required_missing.slice(0, 2).join(" and ")} would significantly improve your fit.`
                    : "You have a strong technical foundation for this role."}
                </div>
              </div>

              <SkillGapTable rec={selectedRec} />
            </div>
          )}
        </div>
      )}

      {/* ── Roadmap Tab ─────────────────────────────────── */}
      {activeTab === "roadmap" && (
        <div>
          {/* Role selector */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Select a Career Roadmap</div>
            <div className="flex-gap">
              {recommendations?.map((rec) => (
                <button
                  key={rec.role_id}
                  className={`btn btn-sm ${selectedRec?.role_id === rec.role_id ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setSelectedRec(rec)}
                >
                  {rec.title}
                </button>
              ))}
            </div>
          </div>

          {selectedRec && (
            <div className="card">
              <div className="card-title">
                🗺 Learning Roadmap — {selectedRec.title}
              </div>
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                <span>🎯</span>
                <div>
                  This roadmap is personalized based on your skill gaps. Skills you already have are automatically
                  de-prioritized so you can focus on what matters most.
                </div>
              </div>
              <RoadmapTimeline roadmap={selectedRec.roadmap} />

              {/* Missing skills priority summary */}
              {selectedRec.missing_with_priority?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <hr className="divider" />
                  <div className="card-title">🎯 Priority Skills to Develop</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {selectedRec.missing_with_priority.map((item) => (
                      <div
                        key={item.skill}
                        className="flex-between"
                        style={{
                          padding: "8px 12px",
                          background: "var(--surface2)",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{item.skill}</span>
                        <span className={`priority-dot ${item.priority}`}>{item.priority} priority</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
