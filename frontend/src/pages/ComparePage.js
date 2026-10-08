import React, { useState, useEffect } from "react";
import { listRoles, compareRoles } from "../api/client";

export default function ComparePage({ userSkills }) {
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listRoles()
      .then((d) => setRoles(d.roles || []))
      .catch(() => setError("Could not load roles. Make sure the backend is running."));
  }, []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setComparison(null);
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setError("");
    try {
      const res = await compareRoles(selected, userSkills || []);
      setComparison(res.comparison);
    } catch {
      setError("Comparison failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">⚖ Career Comparison</div>
      <div className="page-subtitle">
        Select 2 or more careers to compare them side by side based on your skill set.
      </div>

      {error && <div className="alert alert-error"><span>⚠</span><div>{error}</div></div>}

      {/* Role selector */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Select Careers to Compare</div>
        <div className="flex-gap">
          {roles.map((r) => (
            <button
              key={r.id}
              className={`btn btn-sm ${selected.includes(r.id) ? "btn-primary" : "btn-secondary"}`}
              onClick={() => toggle(r.id)}
            >
              {selected.includes(r.id) ? "✓ " : ""}{r.title}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            className="btn btn-primary"
            onClick={handleCompare}
            disabled={selected.length < 2 || loading}
          >
            {loading ? "Comparing…" : `Compare ${selected.length} Careers`}
          </button>
          {selected.length < 2 && (
            <span className="text-sm text-muted" style={{ marginLeft: 12 }}>
              Select at least 2 careers
            </span>
          )}
        </div>
      </div>

      {/* Comparison result */}
      {comparison && (
        <div className="card">
          <div className="card-title">Comparison Results</div>
          <div style={{ overflowX: "auto" }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Attribute</th>
                  {comparison.map((r) => <th key={r.role_id}>{r.title}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fit Score</td>
                  {comparison.map((r) => (
                    <td key={r.role_id}>
                      <strong style={{ color: r.fit_score >= 70 ? "var(--success)" : r.fit_score >= 50 ? "var(--warning)" : "var(--high)" }}>
                        {r.fit_score}%
                      </strong>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Industry</td>
                  {comparison.map((r) => <td key={r.role_id}>{r.industry}</td>)}
                </tr>
                <tr>
                  <td>Skills You Match</td>
                  {comparison.map((r) => (
                    <td key={r.role_id}>
                      <span style={{ color: "var(--success)", fontWeight: 700 }}>{r.matched_count}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Skills to Learn</td>
                  {comparison.map((r) => (
                    <td key={r.role_id}>
                      <span style={{ color: "var(--high)", fontWeight: 700 }}>{r.missing_count}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Core Required Skills</td>
                  {comparison.map((r) => (
                    <td key={r.role_id} style={{ fontSize: "0.8rem", textAlign: "left" }}>
                      {r.required_skills?.join(", ")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="alert alert-info" style={{ marginTop: 16 }}>
            <span>💡</span>
            <div>
              <strong>Tip:</strong> Careers with a lower "Skills to Learn" count are faster to achieve from your
              current position. Consider starting with the highest-matching role to build confidence and experience.
            </div>
          </div>
        </div>
      )}

      {!comparison && !loading && (
        <div className="card text-center" style={{ color: "var(--muted)", padding: "40px 20px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚖</div>
          <div>Select 2 or more careers above and click Compare to see a detailed side-by-side analysis.</div>
        </div>
      )}
    </div>
  );
}
