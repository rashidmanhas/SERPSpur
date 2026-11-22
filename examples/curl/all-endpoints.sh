#!/usr/bin/env bash
# SERPSpur Universal SEO & AI Intelligence API (v3.0) — cURL Examples
# Defaults to the free 0-credit sandbox token so you can run safe tests immediately.
# For live production calls, export SERPSPUR_API_KEY="ss_live_YOUR_API_KEY" and set MODE="auto".

set -euo pipefail

BASE_URL="https://serpspur.com/api/v1"
API_KEY="${SERPSPUR_API_KEY:-ss_live_sandbox_demo}"
MODE="${SERPSPUR_MODE:-sandbox}"

echo "=== 0. OpenAPI 3.1 Spec (Public, 0 Credits) ==="
curl -sS "${BASE_URL}/openapi.json" | head -c 300
echo -e "\n"

echo "=== 1. Site Audit — Single URL (Headless Chrome + CWV + AI Crawler Readiness) ==="
curl -sS -X GET "${BASE_URL}/audit?url=https%3A%2F%2Fserpspur.com%2F&device=desktop&detail=full&mode=${MODE}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Accept: application/json"
echo -e "\n"

echo "=== 2. Site Audit — Dispatch Async Multi-Page Crawl (5–100 Pages) ==="
curl -sS -X POST "${BASE_URL}/audit/crawl" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://serpspur.com/\",\"max_pages\":25,\"device\":\"desktop\",\"mode\":\"${MODE}\"}"
echo -e "\n"

echo "=== 3. Site Audit — Poll Completed Crawl & Stream CSV (0 Credits) ==="
curl -sS -X GET "${BASE_URL}/audit/crawl/crawl_sandbox_demo?page=1&per_page=10" \
  -H "Authorization: Bearer ${API_KEY}"
echo -e "\n"

echo "=== 4. Backlinks — Authority Summary & Filtered Links ==="
curl -sS -X GET "${BASE_URL}/backlinks?domain=serpspur.com&include_links=1&limit=50&dofollow_only=1&mode=${MODE}" \
  -H "Authorization: Bearer ${API_KEY}"
echo -e "\n"

echo "=== 5. Backlinks — Competitor Link Gap Intersection ==="
curl -sS -X POST "${BASE_URL}/backlinks/gap" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"target\":\"serpspur.com\",\"competitors\":[\"ahrefs.com\",\"semrush.com\"],\"intersection\":\"all\",\"limit\":25,\"mode\":\"${MODE}\"}"
echo -e "\n"

echo "=== 6. Keyword Research — Volume, KD, Momentum & Backlinks-to-Rank ==="
curl -sS -X GET "${BASE_URL}/keywords?keyword=seo+audit+tool&country=us&language=en&depth=3&mode=${MODE}" \
  -H "Authorization: Bearer ${API_KEY}"
echo -e "\n"

echo "=== 7. 7-Engine SERP — Parallel Multi-Engine Rank Comparison ==="
curl -sS -X POST "${BASE_URL}/serp/multi" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"keyword\":\"seo audit tool\",\"domain\":\"serpspur.com\",\"engines\":[\"google\",\"bing\",\"yahoo\",\"youtube\"],\"mode\":\"${MODE}\"}"
echo -e "\n"

echo "=== 8. AI Mentions (GEO) — ChatGPT + Google AI Overviews ==="
curl -sS -X GET "${BASE_URL}/ai-mentions?domain=serpspur.com&engine=both&location=United+States&mode=${MODE}" \
  -H "Authorization: Bearer ${API_KEY}"
echo -e "\n"

echo "=== 9. Domain Explorer — Global Traffic, ETV & Top Countries ==="
curl -sS -X GET "${BASE_URL}/domain?domain=ahrefs.com&top_countries=10&mode=${MODE}" \
  -H "Authorization: Bearer ${API_KEY}"
echo -e "\n"

echo "=== 10. TAI™ Forensics — 4-Pillar Fake Traffic & Ad-Fraud Audit ==="
curl -sS -X GET "${BASE_URL}/tai?domain=serpspur.com&mode=${MODE}" \
  -H "Authorization: Bearer ${API_KEY}"
echo -e "\n"
