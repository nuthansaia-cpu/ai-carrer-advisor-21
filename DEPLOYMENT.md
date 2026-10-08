# 🚀 Deployment Guide — AI Career Advisor

## Overview

| Layer | Platform | Cost | URL pattern |
|---|---|---|---|
| **Backend (FastAPI)** | [Render](https://render.com) | Free | `https://ai-career-advisor-backend.onrender.com` |
| **Frontend (HTML)** | [Netlify](https://netlify.com) | Free | `https://ai-career-advisor.netlify.app` |
| **Source code** | [GitHub](https://github.com) | Free | your repo |

---

## STEP 1 — Install Git

Download and install Git from: **https://git-scm.com/download/win**

- Click **Next** through all defaults
- After install, open a **new** PowerShell or Command Prompt window

Verify:
```bash
git --version
# should print: git version 2.x.x
```

---

## STEP 2 — Create a GitHub Account

1. Go to **https://github.com** and sign up (free)
2. Verify your email

---

## STEP 3 — Create a GitHub Repository

1. Click **+** → **New repository**
2. Name it: `ai-career-advisor`
3. Set to **Public** (required for free Netlify/Render deployments)
4. **Do NOT** check "Add README" (we already have one)
5. Click **Create repository**
6. Copy the repo URL shown — it looks like:
   `https://github.com/YOUR_USERNAME/ai-career-advisor.git`

---

## STEP 4 — Push Code to GitHub

Open PowerShell, navigate to your project, and run these commands **one by one**:

```powershell
# Go into the project folder
cd "D:\bob ibm\ai-career-advisor"

# Initialize git
git init

# Set your identity (replace with your details)
git config user.email "you@example.com"
git config user.name "Your Name"

# Stage all files
git add .

# First commit
git commit -m "Initial commit: AI Career Advisor - IBM Internship Project"

# Add your GitHub repo as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ai-career-advisor.git

# Push to GitHub
git branch -M main
git push -u origin main
```

When prompted, enter your GitHub username and password.
> **Note:** GitHub now uses Personal Access Tokens instead of passwords.
> If prompted, go to GitHub → Settings → Developer Settings → Personal Access Tokens → Generate new token (classic) → select `repo` scope → use that token as your password.

---

## STEP 5 — Deploy Backend on Render (Free)

1. Go to **https://render.com** and sign up with your GitHub account
2. Click **New** → **Web Service**
3. Click **Connect GitHub** → select your `ai-career-advisor` repo
4. Fill in the settings:

   | Field | Value |
   |---|---|
   | **Name** | `ai-career-advisor-backend` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | `Free` |

5. Click **Create Web Service**
6. Wait 2–3 minutes for deployment
7. Copy your backend URL — it looks like:
   `https://ai-career-advisor-backend.onrender.com`
8. Test it: open `https://ai-career-advisor-backend.onrender.com/health` in your browser — you should see `{"status":"ok"}`

---

## STEP 6 — Update Frontend with Backend URL

Edit `frontend/index.html` — find line 363 and change:

```javascript
// Before:
const API = window.AI_CAREER_API_URL || 'http://localhost:8000';

// After (replace with YOUR actual Render URL):
const API = window.AI_CAREER_API_URL || 'https://ai-career-advisor-backend.onrender.com';
```

Then push the update:
```powershell
cd "D:\bob ibm\ai-career-advisor"
git add frontend/index.html
git commit -m "feat: update API URL to deployed Render backend"
git push
```

---

## STEP 7 — Deploy Frontend on Netlify (Free)

### Option A — Drag & Drop (Fastest, no account linking needed)

1. Go to **https://app.netlify.com/drop**
2. Drag and drop the entire `frontend/` folder onto the page
3. Netlify instantly gives you a live URL like `https://random-name.netlify.app`
4. To get a custom name: go to **Site settings** → **Change site name** → set `ai-career-advisor`

### Option B — Connect GitHub (Auto-deploys on every push)

1. Go to **https://app.netlify.com** → **Add new site** → **Import an existing project**
2. Connect GitHub → select `ai-career-advisor`
3. Set build settings:

   | Field | Value |
   |---|---|
   | **Base directory** | `frontend` |
   | **Build command** | *(leave empty)* |
   | **Publish directory** | `frontend` |

4. Click **Deploy site**
5. Your site is live at `https://ai-career-advisor.netlify.app` (after name change)

---

## STEP 8 — Verify Full Deployment

Test the live URLs:

```
Backend health:    https://ai-career-advisor-backend.onrender.com/health
Backend API docs:  https://ai-career-advisor-backend.onrender.com/docs
Frontend:          https://ai-career-advisor.netlify.app
```

Open the frontend URL in your browser, enter some skills, and click **Analyze My Career Fit** — it should call your live Render backend and return results.

---

## Troubleshooting

### "Network Error" on the deployed frontend
- Make sure you updated the `API` constant in `index.html` with your Render URL (Step 6)
- Check Render logs: Dashboard → your service → **Logs** tab

### Render service sleeps after inactivity (free tier)
- Free Render services sleep after 15 minutes of no requests
- First request after sleep takes ~30 seconds to wake up
- This is normal for free tier — upgrade to paid ($7/month) to avoid it

### Git push asks for password
- Use a Personal Access Token (PAT) instead: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → select `repo` → copy and use as password

---

## Final URLs (fill in after deployment)

| | URL |
|---|---|
| GitHub Repo | `https://github.com/YOUR_USERNAME/ai-career-advisor` |
| Backend (Render) | `https://ai-career-advisor-backend.onrender.com` |
| Frontend (Netlify) | `https://ai-career-advisor.netlify.app` |
| API Docs | `https://ai-career-advisor-backend.onrender.com/docs` |
