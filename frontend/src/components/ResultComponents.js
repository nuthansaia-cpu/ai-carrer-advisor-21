import React from "react";

/** Circular score display */
function ScoreRing({ score, label, size = 80, color }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const c = color || (pct >= 70 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--high)");
  const r = (size / 2) - 6;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={c} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div style={{ marginTop: -size/2 - 4, fontSize: size > 70 ? "1.1rem" : "0.9rem", fontWeight: 800, color: c }}>
        {Math.round(pct)}
      </div>
      {label && <div className="score-label">{label}</div>}
    </div>
  );
}

/** Horizontal progress bar */
function ProgressBar({ value, max = 100 }) {
  const pct = Math.min((value / max) * 100, 100);
  const cls = pct >= 70 ? "high" : pct >= 50 ? "medium" : "";
  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Individual recommendation card */
export function RecommendationCard({ rec, isSelected, onClick }) {
  const score = rec.fit_score;
  const badgeCls = score >= 70 ? "high" : score >= 50 ? "medium" : "low";

  return (
    <div className={`rec-card ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className="rec-header">
        <div>
          <div className="rec-title">{rec.title}</div>
          <div className="rec-industry">{rec.industry}</div>
        </div>
        <div className={`fit-badge ${badgeCls}`}>{score}%</div>
      </div>
      <div className="rec-desc">{rec.description}</div>
      <ProgressBar value={score} />
      <div className="rec-skills">
        {rec.required_matched?.slice(0, 4).map((s) => (
          <span key={s} className="skill-chip matched">✓ {s}</span>
        ))}
        {rec.required_missing?.slice(0, 3).map((s) => (
          <span key={s} className="skill-chip missing">✗ {s}</span>
        ))}
      </div>
    </div>
  );
}

/** Skill gap table for a career */
export function SkillGapTable({ rec }) {
  if (!rec) return null;
  const matched = [
    ...(rec.required_matched || []).map((s) => ({ skill: s, status: "matched", priority: "high" })),
    ...(rec.preferred_matched || []).map((s) => ({ skill: s, status: "matched", priority: "medium" })),
  ];
  const missing = rec.missing_with_priority || [];

  return (
    <table className="gap-table">
      <thead>
        <tr>
          <th>Skill</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        {matched.map((row) => (
          <tr key={row.skill}>
            <td style={{ fontWeight: 600 }}>{row.skill}</td>
            <td>
              <span className="skill-chip matched" style={{ fontSize: "0.8rem" }}>✓ You have this</span>
            </td>
            <td><span className={`priority-dot ${row.priority}`}>{row.priority}</span></td>
          </tr>
        ))}
        {missing.map((row) => (
          <tr key={row.skill}>
            <td style={{ fontWeight: 600 }}>{row.skill}</td>
            <td>
              <span className="skill-chip missing" style={{ fontSize: "0.8rem" }}>✗ Missing</span>
            </td>
            <td><span className={`priority-dot ${row.priority}`}>{row.priority}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Roadmap timeline */
export function RoadmapTimeline({ roadmap }) {
  if (!roadmap) return null;
  const months = Object.entries(roadmap);

  return (
    <div className="roadmap-timeline">
      {months.map(([month, tasks], i) => (
        <div key={month} className="roadmap-item">
          <div className="roadmap-dot">{i + 1}</div>
          <div className="roadmap-body">
            <div className="roadmap-month">{month}</div>
            <ul className="roadmap-tasks">
              {tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Career readiness score dashboard */
export function ReadinessDashboard({ readiness }) {
  if (!readiness) return null;
  const items = [
    { label: "Technical Skills", key: "technical_skills" },
    { label: "Education", key: "education" },
    { label: "Projects", key: "projects" },
    { label: "Certifications", key: "certifications" },
    { label: "Experience", key: "experience" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
        <ScoreRing score={readiness.overall} label="Overall" size={90} />
        <div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{readiness.overall}/100</div>
          <div className="text-muted text-sm">Career Readiness Score</div>
          <div className="text-sm mt-8">
            {readiness.overall >= 70
              ? "🟢 You are well-positioned for several careers."
              : readiness.overall >= 50
              ? "🟡 Good foundation — a few focused skills will unlock more roles."
              : "🔴 Great starting point — follow the roadmap to accelerate your readiness."}
          </div>
        </div>
      </div>
      <div className="readiness-grid">
        {items.map((item) => (
          <div key={item.key} className="readiness-item">
            <div className="readiness-pct">{Math.round(readiness[item.key])}%</div>
            <div className="readiness-lbl">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ScoreRing, ProgressBar };
