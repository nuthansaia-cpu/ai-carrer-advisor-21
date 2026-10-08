"""
Skill extraction service.
Extracts skills from raw text (resume text, descriptions) using keyword matching
and basic NLP normalization.
"""

import re
from typing import List

# Master skill dictionary: alias → canonical skill name
SKILL_ALIASES = {
    # Python ecosystem
    "python": "python",
    "python3": "python",
    "py": "python",
    "pandas": "pandas",
    "numpy": "numpy",
    "scipy": "scipy",
    "matplotlib": "matplotlib",
    "seaborn": "seaborn",
    # Machine learning / AI
    "machine learning": "machine learning",
    "ml": "machine learning",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "deep learning": "deep learning",
    "dl": "deep learning",
    "tensorflow": "tensorflow",
    "tf": "tensorflow",
    "pytorch": "pytorch",
    "torch": "pytorch",
    "keras": "keras",
    "xgboost": "xgboost",
    "lightgbm": "lightgbm",
    "neural network": "deep learning",
    "neural networks": "deep learning",
    "computer vision": "computer vision",
    "cv": "computer vision",
    "nlp": "nlp",
    "natural language processing": "nlp",
    "transformers": "transformers",
    "hugging face": "hugging face",
    "huggingface": "hugging face",
    "bert": "bert",
    "gpt": "gpt",
    "spacy": "spacy",
    "nltk": "nltk",
    "mlops": "mlops",
    "model deployment": "model deployment",
    "feature engineering": "feature engineering",
    # Data
    "sql": "sql",
    "mysql": "sql",
    "postgresql": "postgresql",
    "postgres": "postgresql",
    "mongodb": "mongodb",
    "nosql": "mongodb",
    "redis": "redis",
    "sqlite": "sql",
    "databases": "databases",
    "database": "databases",
    "excel": "excel",
    "ms excel": "excel",
    "microsoft excel": "excel",
    "statistics": "statistics",
    "stats": "statistics",
    "probability": "statistics",
    "hypothesis testing": "hypothesis testing",
    "statistical analysis": "statistics",
    "data visualization": "data visualization",
    "data viz": "data visualization",
    "power bi": "power bi",
    "powerbi": "power bi",
    "tableau": "tableau",
    "looker": "looker",
    "big data": "big data",
    "hadoop": "big data",
    "spark": "big data",
    "r": "r",
    "r language": "r",
    # Web / Development
    "html": "html",
    "html5": "html",
    "css": "css",
    "css3": "css",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "angular": "angular",
    "angularjs": "angular",
    "vue": "vue",
    "vuejs": "vue",
    "node": "nodejs",
    "nodejs": "nodejs",
    "node.js": "nodejs",
    "express": "nodejs",
    "django": "django",
    "flask": "flask",
    "fastapi": "fastapi",
    "spring": "java",
    "rest api": "rest api",
    "rest apis": "rest api",
    "restful": "rest api",
    "restful api": "rest api",
    "restful apis": "rest api",
    "api": "rest api",
    "graphql": "graphql",
    "responsive design": "responsive design",
    "tailwind": "tailwind css",
    "tailwind css": "tailwind css",
    "bootstrap": "bootstrap",
    "ux/ui": "ux/ui",
    "ui/ux": "ux/ui",
    # Programming languages
    "java": "java",
    "c": "c",
    "c++": "c++",
    "cpp": "c++",
    "c#": "c#",
    "golang": "go",
    "go": "go",
    "rust": "rust",
    "kotlin": "kotlin",
    "swift": "swift",
    "php": "php",
    "ruby": "ruby",
    "scala": "scala",
    "oop": "oop",
    "object oriented": "oop",
    "object-oriented": "oop",
    "data structures": "data structures",
    "algorithms": "data structures",
    "scripting": "scripting",
    "bash": "scripting",
    "shell scripting": "scripting",
    # Cloud / DevOps / Infrastructure
    "aws": "aws",
    "amazon web services": "aws",
    "azure": "azure",
    "microsoft azure": "azure",
    "gcp": "gcp",
    "google cloud": "gcp",
    "ibm cloud": "ibm cloud",
    "cloud": "cloud platforms",
    "cloud platforms": "cloud platforms",
    "cloud computing": "cloud platforms",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "k8s": "kubernetes",
    "terraform": "terraform",
    "ansible": "ansible",
    "devops": "devops",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "github actions": "ci/cd",
    "jenkins": "ci/cd",
    "git": "git",
    "github": "git",
    "gitlab": "git",
    "linux": "linux",
    "unix": "linux",
    "ubuntu": "linux",
    "centos": "linux",
    "networking": "networking",
    "tcp/ip": "networking",
    "monitoring": "monitoring",
    "prometheus": "monitoring",
    "grafana": "monitoring",
    # Security
    "security": "security",
    "cybersecurity": "security",
    "penetration testing": "penetration testing",
    "pentest": "penetration testing",
    "ethical hacking": "ethical hacking",
    "siem": "siem",
    "cryptography": "cryptography",
    "incident response": "incident response",
    "firewalls": "firewalls",
    "risk assessment": "risk assessment",
    # Soft skills
    "communication": "communication",
    "teamwork": "teamwork",
    "problem solving": "problem solving",
    "leadership": "leadership",
    "critical thinking": "critical thinking",
    "time management": "time management",
    "project management": "project management",
    "agile": "agile",
    "scrum": "agile",
    "unit testing": "unit testing",
    "testing": "unit testing",
    "jest": "unit testing",
    "pytest": "unit testing",
    "authentication": "authentication",
    "jwt": "authentication",
    "oauth": "authentication",
    "caching": "caching",
    "ner": "ner",
    "text classification": "text classification",
}


def normalize_text(text: str) -> str:
    """Lowercase and normalize whitespace."""
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract canonical skills from free-form text using alias dictionary.
    Returns a deduplicated list of canonical skill names.
    """
    text = normalize_text(text)
    found = set()

    # Sort by length descending so longer phrases match first
    sorted_aliases = sorted(SKILL_ALIASES.keys(), key=len, reverse=True)

    for alias in sorted_aliases:
        # Use word-boundary-aware matching
        pattern = r"\b" + re.escape(alias) + r"\b"
        if re.search(pattern, text):
            found.add(SKILL_ALIASES[alias])

    return sorted(found)


def normalize_skill_list(skills: List[str]) -> List[str]:
    """
    Normalize a manually entered skill list to canonical names.
    Unrecognized skills are kept as-is (lowercased).
    """
    result = set()
    for skill in skills:
        norm = normalize_text(skill)
        canonical = SKILL_ALIASES.get(norm, norm)
        result.add(canonical)
    return sorted(result)
