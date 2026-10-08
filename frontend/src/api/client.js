import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "";

const api = axios.create({ baseURL: BASE });

/** Analyze a full user profile */
export const analyzeProfile = (profile) =>
  api.post("/api/profile/analyze", profile).then((r) => r.data);

/** Extract skills from resume text */
export const extractSkillsFromText = (text) =>
  api.post("/api/profile/extract-skills", { text }).then((r) => r.data);

/** Get detailed gap analysis for a specific role */
export const getGapAnalysis = (roleId, userSkills) =>
  api
    .post("/api/profile/gap-analysis", { role_id: roleId, user_skills: userSkills })
    .then((r) => r.data);

/** Compare multiple roles */
export const compareRoles = (roleIds, userSkills) =>
  api
    .post("/api/profile/compare", { role_ids: roleIds, user_skills: userSkills })
    .then((r) => r.data);

/** List all available career roles */
export const listRoles = () =>
  api.get("/api/profile/roles").then((r) => r.data);
