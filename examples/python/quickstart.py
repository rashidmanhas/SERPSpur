"""
SERPSpur Universal SEO & AI Intelligence API (v3.0) — Python Quickstart

Defaults to the free 0-credit sandbox token so you can test immediately:
    python examples/python/quickstart.py

For live production calls:
    SERPSPUR_API_KEY="ss_live_YOUR_KEY" SERPSPUR_MODE="auto" python examples/python/quickstart.py
"""

import os
import requests

BASE_URL = "https://serpspur.com/api/v1"
API_KEY = os.getenv("SERPSPUR_API_KEY", "ss_live_sandbox_demo")
MODE = os.getenv("SERPSPUR_MODE", "sandbox")

session = requests.Session()
session.headers.update({
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
})


def print_summary(label: str, response: requests.Response) -> dict:
    response.raise_for_status()
    payload = response.json()
    print(
        f"[{label}] status={response.status_code} "
        f"cache={response.headers.get('X-SerpSpur-Cache')} "
        f"credits={response.headers.get('X-SerpSpur-Credits-Deducted')} "
        f"remaining={response.headers.get('X-SerpSpur-Credits-Remaining')}"
    )
    return payload


def main() -> None:
    # 1. Keyword Research (Seed + Related Cluster + Backlinks Needed to Rank)
    kw = print_summary(
        "Keywords",
        session.get(
            f"{BASE_URL}/keywords",
            params={"keyword": "seo audit tool", "country": "us", "language": "en", "depth": 3, "mode": MODE},
            timeout=30,
        ),
    )
    print("  ->", kw.get("data", {}).get("keyword"), "Vol:", kw.get("data", {}).get("search_volume"))

    # 2. 7-Engine SERP Parallel Lookup
    serp = print_summary(
        "7-Engine SERP",
        session.post(
            f"{BASE_URL}/serp/multi",
            json={
                "keyword": "seo audit tool",
                "domain": "serpspur.com",
                "engines": ["google", "bing", "youtube"],
                "mode": MODE,
            },
            timeout=45,
        ),
    )
    print("  -> Engines:", list(serp.get("data", {}).get("engines", {}).keys()))

    # 3. Headless Chrome Site Audit + AI Crawler Readiness
    audit = print_summary(
        "Site Audit",
        session.get(
            f"{BASE_URL}/audit",
            params={"url": "https://serpspur.com/", "device": "desktop", "detail": "full", "mode": MODE},
            timeout=45,
        ),
    )
    print("  -> Health:", audit.get("data", {}).get("health_score"), audit.get("data", {}).get("grade"))

    # 4. AI Mentions & GEO Visibility (ChatGPT + Google AI Overviews)
    geo = print_summary(
        "AI Mentions (GEO)",
        session.get(
            f"{BASE_URL}/ai-mentions",
            params={"domain": "serpspur.com", "engine": "both", "location": "United States", "mode": MODE},
            timeout=30,
        ),
    )
    print("  -> GEO Score:", geo.get("data", {}).get("geo_visibility_score"))

    # 5. Domain Explorer (Global Traffic & Top Countries)
    dom = print_summary(
        "Domain Explorer",
        session.get(
            f"{BASE_URL}/domain",
            params={"domain": "ahrefs.com", "top_countries": 5, "mode": MODE},
            timeout=30,
        ),
    )
    print("  -> Organic Traffic:", dom.get("data", {}).get("global_summary", {}).get("organic_traffic"))

    # 6. TAI™ Traffic Authenticity Forensics
    tai = print_summary(
        "TAI Forensics",
        session.get(
            f"{BASE_URL}/tai",
            params={"domain": "serpspur.com", "mode": MODE},
            timeout=30,
        ),
    )
    print("  -> TAI Score:", tai.get("data", {}).get("tai_score"), tai.get("data", {}).get("verdict"))


if __name__ == "__main__":
    main()
