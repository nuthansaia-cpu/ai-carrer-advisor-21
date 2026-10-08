import React, { useState } from "react";
import TagInput from "../components/TagInput";
import { analyzeProfile, extractSkillsFromText } from "../api/client";

const DEFAULT_PROFILE = {
  name: "",
  education: "",
  branch: "",
  graduation_year: "",
  technical_skills: [],
  soft_skills: [],
  projects: [],
  certifications: [],
  years_experience: 0,
  interests: [],
  career_goal: "",
  preferred_industries: [],
};

const INTEREST_OPTIONS = [
  "AI / Machine Learning", "Data Science", "Software Development",
  "Cloud Computing", "Cybersecurity", "Data Analytics",
  "Frontend Development", "Backend Development", "DevOps",
  "NLP / Language AI", "Mobile Development", "Blockchain",
];

export default function ProfileForm({ onResults }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [resumeText, setResumeText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractMsg, setExtractMsg] = useState("");

  const set = (key, val) => setProfile((p) => ({ ...p, [key]: val }));

  /* Extract skills from pasted resume text */
  const handleExtract = async () => {
    if (!resumeText.trim()) return;
    setExtracting(true);
    setExtractMsg("");
    try {
      const res = await extractSkillsFromText(resumeText);
      const existing = new Set(profile.technical_skills.map((s) => s.toLowerCase()));
      const newSkills = res.extracted_skills.filter((s) => !existing.has(s.toLowerCase()));
      set("technical_skills", [...profile.technical_skills, ...newSkills]);
      setExtractMsg(`✓ Extracted ${res.count} skills — ${newSkills.length} new skills added.`);
    } catch {
      setExtractMsg("⚠ Could not extract skills. Check backend connection.");
    } finally {
      setExtracting(false);
    }
  };

  /* Toggle interest chips */
  const toggleInterest = (item) => {
    const current = profile.interests;
    if (current.includes(item)) {
      set("interests", current.filter((i) => i !== item));
    } else {
      set("interests", [...current, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!profile.education.trim() || !profile.branch.trim()) {
      setError("Please fill in your Education and Branch/Specialization fields.");
      return;
    }
    if (profile.technical_skills.length === 0) {
      setError("Please add at least one technical skill or extract skills from your resume.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...profile,
        graduation_year: profile.graduation_year ? Number(profile.graduation_year) : null,
        years_experience: Number(profile.years_experience) || 0,
      };
      const results = await analyzeProfile(payload);
      onResults(results, profile);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        "Failed to connect to the AI engine. Make sure the backend server is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Personal & Education ─────────────────────────── */}
      <div className="form-section">
        <div className="form-section-title">📋 Personal & Education</div>
        <div className="form-row">
          <div className="field">
            <label>Your Name (optional)</label>
            <input
              value={profile.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Alex Johnson"
            />
          </div>
          <div className="field">
            <label>Graduation Year</label>
            <input
              type="number" min="2000" max="2030"
              value={profile.graduation_year}
              onChange={(e) => set("graduation_year", e.target.value)}
              placeholder="e.g. 2025"
            />
          </div>
        </div>
        <div className="form-row mt-8">
          <div className="field">
            <label>Degree / Education Level *</label>
            <input
              value={profile.education}
              onChange={(e) => set("education", e.target.value)}
              placeholder="e.g. B.Tech, B.Sc, M.Sc, MBA"
              required
            />
          </div>
          <div className="field">
            <label>Branch / Specialization *</label>
            <input
              value={profile.branch}
              onChange={(e) => set("branch", e.target.value)}
              placeholder="e.g. Computer Science, Data Science"
              required
            />
          </div>
        </div>
        <div className="form-row single mt-8">
          <div className="field">
            <label>Years of Work Experience</label>
            <input
              type="number" min="0" max="40"
              value={profile.years_experience}
              onChange={(e) => set("years_experience", e.target.value)}
              placeholder="0 for students/freshers"
            />
          </div>
        </div>
      </div>

      {/* ── Resume Upload / Paste ────────────────────────── */}
      <div className="form-section">
        <div className="form-section-title">📄 Resume Skill Extraction (optional)</div>
        <div className="field">
          <label>Paste your resume text below and click Extract Skills</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your entire resume text here. The AI will automatically identify your skills…"
            rows={5}
          />
        </div>
        <div className="flex-gap mt-8">
          <button
            type="button" className="btn btn-secondary btn-sm"
            onClick={handleExtract} disabled={extracting || !resumeText.trim()}
          >
            {extracting ? "Extracting…" : "⚡ Extract Skills from Resume"}
          </button>
          {extractMsg && <span className="text-sm text-muted">{extractMsg}</span>}
        </div>
      </div>

      {/* ── Skills ─────────────────────────────────────────── */}
      <div className="form-section">
        <div className="form-section-title">🛠 Skills</div>
        <div className="field">
          <label>Technical Skills *</label>
          <TagInput
            tags={profile.technical_skills}
            onChange={(v) => set("technical_skills", v)}
            placeholder="e.g. Python, SQL, React… (Enter to add)"
          />
          <span className="field-hint">Type a skill and press Enter or comma to add. Examples: Python, SQL, Machine Learning, React, Docker</span>
        </div>
        <div className="field mt-8">
          <label>Soft Skills</label>
          <TagInput
            tags={profile.soft_skills}
            onChange={(v) => set("soft_skills", v)}
            placeholder="e.g. Communication, Leadership…"
          />
        </div>
      </div>

      {/* ── Experience ─────────────────────────────────────── */}
      <div className="form-section">
        <div className="form-section-title">🏆 Projects & Certifications</div>
        <div className="field">
          <label>Projects</label>
          <TagInput
            tags={profile.projects}
            onChange={(v) => set("projects", v)}
            placeholder="e.g. Sales Dashboard, ML Price Predictor…"
          />
          <span className="field-hint">List project titles — each project improves your readiness score.</span>
        </div>
        <div className="field mt-8">
          <label>Certifications</label>
          <TagInput
            tags={profile.certifications}
            onChange={(v) => set("certifications", v)}
            placeholder="e.g. AWS Certified, Google Data Analytics…"
          />
        </div>
      </div>

      {/* ── Interests & Goals ─────────────────────────────── */}
      <div className="form-section">
        <div className="form-section-title">🎯 Career Interests & Goals</div>
        <div className="field">
          <label>Select your areas of interest</label>
          <div className="flex-gap mt-8">
            {INTEREST_OPTIONS.map((opt) => (
              <button
                key={opt} type="button"
                className={`btn btn-sm ${profile.interests.includes(opt) ? "btn-primary" : "btn-secondary"}`}
                onClick={() => toggleInterest(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="field mt-16">
          <label>Career Goal (optional)</label>
          <input
            value={profile.career_goal}
            onChange={(e) => set("career_goal", e.target.value)}
            placeholder="e.g. Become a Machine Learning Engineer, Data Analyst…"
          />
          <span className="field-hint">If you have a specific target role, the AI will prioritize it in recommendations.</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠</span>
          <div>{error}</div>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
        {loading ? "🔍 Analyzing your profile…" : "🚀 Analyze My Career Fit"}
      </button>
    </form>
  );
}
