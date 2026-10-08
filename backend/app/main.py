"""
AI Career Advisor — FastAPI Application Entry Point
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import profile

# ALLOWED_ORIGINS env var: comma-separated list of allowed frontend origins.
# Defaults to "*" (all origins) for local dev and simple deployments.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",")] if _raw_origins != "*" else ["*"]

app = FastAPI(
    title="AI Career Advisor",
    description=(
        "An explainable AI-powered career intelligence platform that bridges the gap "
        "between a user's current skills and the requirements of the modern job market. "
        "Supports SDG 8 — Decent Work and Economic Growth."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router)

INDEX_HTML_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "index.html")
)


@app.get("/")
def root():
    from fastapi.responses import FileResponse, JSONResponse
    if os.path.exists(INDEX_HTML_PATH):
        return FileResponse(INDEX_HTML_PATH)
    return {
        "project": "AI Career Advisor",
        "version": "1.0.0",
        "sdg": "SDG 8 — Decent Work and Economic Growth",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}

