"""
Run this script after getting your Render backend URL.
Usage:
    python update_frontend_url.py https://your-service-name.onrender.com
"""
import sys, re, subprocess
from pathlib import Path

if len(sys.argv) < 2:
    print("Usage: python update_frontend_url.py https://YOUR-SERVICE.onrender.com")
    sys.exit(1)

render_url = sys.argv[1].rstrip("/")
html_path = Path(__file__).parent / "frontend" / "index.html"

content = html_path.read_text(encoding="utf-8")
updated = re.sub(
    r"const API = window\.AI_CAREER_API_URL \|\| '[^']*';",
    f"const API = window.AI_CAREER_API_URL || '{render_url}';",
    content,
)

if updated == content:
    print("WARNING: Pattern not found. Check frontend/index.html manually.")
    sys.exit(1)

html_path.write_text(updated, encoding="utf-8")
print(f"Updated frontend/index.html with API URL: {render_url}")

# Git commit and push
git = r"C:\Program Files\Git\bin\git.exe"
subprocess.run([git, "add", "frontend/index.html"], check=True)
subprocess.run([git, "commit", "-m", f"feat: set deployed backend URL to {render_url}"], check=True)
subprocess.run([git, "push"], check=True)
print("Pushed to GitHub! GitHub Pages will update in ~30 seconds.")
print(f"\nYour live app: https://nuthansaia-cpu.github.io/ai-career-advisor/")
