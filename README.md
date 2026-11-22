<p align="center">
  <a href="https://serpspur.com/api-docs/">
    <img src="https://serpspur.com/wp-content/uploads/2026/03/Primary-Logo-Hi-Res-.png?v=2" alt="SERPSpur" width="280" />
  </a>
</p>

<h1 align="center">SERPSpur Universal SEO &amp; AI Intelligence API (v3.0)</h1>

<p align="center">
  Official developer documentation, OpenAPI 3.1 specifications, Postman collections, and client code examples for all <strong>7 live SERPSpur REST APIs (21 endpoints)</strong>.
</p>

<p align="center">
  <a href="https://serpspur.com/api-docs/"><img src="https://img.shields.io/badge/API_Version-v3.0-10b981?style=flat-square" alt="API Version v3.0" /></a>
  <a href="./openapi.yaml"><img src="https://img.shields.io/badge/OpenAPI-3.1.0-3b82f6?style=flat-square" alt="OpenAPI 3.1.0" /></a>
  <a href="./docs/credits-and-vault-caching.md"><img src="https://img.shields.io/badge/Sandbox-0_Credits_Free-0f172a?style=flat-square" alt="0-Credit Sandbox" /></a>
  <a href="https://serpspur.com/api-docs/pricing-calculator/"><img src="https://img.shields.io/badge/Cost_Calculator-Live-6366f1?style=flat-square" alt="Interactive Cost Calculator" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-64748b?style=flat-square" alt="MIT License" /></a>
</p>

---

## Live Developer Resources

| Resource | URL |
| :--- | :--- |
| **Developer Portal & Live Playground** | https://serpspur.com/api-docs/ |
| **Interactive API Cost Calculator** | https://serpspur.com/api-docs/pricing-calculator/ |
| **Live OpenAPI 3.1 Spec (JSON)** | https://serpspur.com/api/v1/openapi.json |
| **API Pricing & Rollover Credits** | https://serpspur.com/pricing/?tab=api |
| **Live System Status & Uptime** | https://serpspur.com/system-status/ |

---

## 7 Live SEO & AI Intelligence APIs

All 7 APIs share one unified REST gateway at **`https://serpspur.com/api/v1`**, one unified never-expiring rollover credit wallet, and strict **0-credit billing** on all sandbox calls, 4xx/5xx errors, and Vault batch misses.

| # | API Module | What It Delivers | Endpoints | Reference Guide |
| :-: | :--- | :--- | :-: | :--- |
| **0** | **Core Gateway & Auth** | Dual Auth (`Bearer`, `X-API-Key`, HTTP Basic), rate limits, headers, error codes, low-balance webhooks, OpenAPI 3.1 | 2 | [Authentication & Quotas](./docs/authentication-and-quotas.md) |
| **1** | **Site Audit & Async Crawl API** | Real Headless Chrome rendering (desktop & mobile), Core Web Vitals (`LCP`, `CLS`, `TTFB`, `INP`, `TBT`), 60+ On-Page SEO signals, AI-bot readiness (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `/llms.txt`), async 5–100 page crawls with unused-page auto-refund & RFC-4180 CSV export | 5 | [Site Audit & Crawl API](./docs/site-audit-api.md) |
| **2** | **Backlinks & Competitor Gap API** | Domain Rank (`0–100`), 11 zero-surcharge filters (CMS/platform, link type, spam score, semantic location, TLD, live/lost), unlimited cursor pagination (millions of links), competitor backlink gap intersections & CSV export | 3 | [Backlinks & Gap API](./docs/backlinks-api.md) |
| **3** | **Keyword Research API** | Live search volume, 12-month seasonality sparklines, YoY/QoQ momentum, KD (`0–100`), Top-10 referring domains & dofollow links needed to rank, forum-weakness signals, Depth 0–4 clusters (up to 200 KWs), 50-KW batch vault & Golden Gems feed | 3 | [Keyword Research API](./docs/keyword-research-api.md) |
| **4** | **7-Engine Live SERP API** | Live organic rankings, AI Overviews, SERP features, and automatic target-domain rank matching across **Google, Bing, YouTube, Yahoo!, Seznam.cz, Naver, and Baidu** — single or parallel multi-engine | 2 | [7-Engine SERP API](./docs/serp-api.md) |
| **5** | **AI Mentions & GEO Visibility API** | Quantify brand citations, AI search impressions, `0–100` GEO Visibility Score, top citing domains, and LLM entity associations across **ChatGPT** and **Google AI Overviews** | 2 | [AI Mentions (GEO) API](./docs/ai-mentions-geo-api.md) |
| **6** | **Domain Traffic & Competitor Explorer API** | Deduplicated worldwide organic & paid traffic, equivalent PPC value (USD), SERP position buckets, keyword momentum, country breakdown & zero-cost cross-vault enrichment | 2 | [Domain Explorer API](./docs/domain-explorer-api.md) |
| **7** | **TAI™ Traffic Authenticity API** | Proprietary 4-pillar fake traffic & ad-fraud forensics (Intent Authenticity, Referral Hygiene, Authority Equilibrium, Routing Integrity), `0.00–1.00` valuation multiplier, boolean cloaking/botnet flags & verifiable certificate URL | 2 | [TAI™ Forensics API](./docs/tai-forensics-api.md) |

---

## 60-Second Quickstart

### 1. Test Free Immediately (0 Credits — No Account Required)
Pass `mode=sandbox` with the public demo token `ss_live_sandbox_demo` to inspect real JSON payloads at **0 credits**:

```bash
curl -X GET "https://serpspur.com/api/v1/keywords?keyword=seo+audit+tool&country=us&mode=sandbox" \
  -H "Authorization: Bearer ss_live_sandbox_demo" \
  -H "Accept: application/json"
```

### 2. Authenticate in Production (3 Supported Methods)
Generate your personal `ss_live_...` API key inside the [SERPSpur Developer Portal](https://serpspur.com/api-docs/) (supports per-key scopes, IP CIDR whitelisting, and daily credit guardrails):

```bash
# Method 1: Bearer Token (Recommended)
curl -X GET "https://serpspur.com/api/v1/account" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"

# Method 2: X-API-Key Header
curl -X GET "https://serpspur.com/api/v1/account" \
  -H "X-API-Key: ss_live_YOUR_API_KEY"

# Method 3: HTTP Basic Auth (Account Email + ss_live_ Key)
curl -u "developer@yourcompany.com:ss_live_YOUR_API_KEY" \
  "https://serpspur.com/api/v1/account"
```

---

## Complete Endpoint Reference (All 21 Endpoints)

| Method | Endpoint | Credit Cost | Vault Cache | Documentation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/account` | `0 Cr` (Free) | Live state | [Auth & Quotas](./docs/authentication-and-quotas.md#get-apiv1account) |
| `GET` | `/api/v1/openapi.json` | `0 Cr` (Public) | 1h HTTP | [Auth & Quotas](./docs/authentication-and-quotas.md#get-apiv1openapijson) |
| `GET` | `/api/v1/audit` | `3 Cr` Vault · `10 Cr` Live · `20 Cr` Deep (+30 links) | 24h Vault | [Site Audit API](./docs/site-audit-api.md#get-apiv1audit) |
| `POST` | `/api/v1/audit/crawl` | `2 Cr` / crawled page *(unused auto-refunded)* | Permanent archive | [Site Audit API](./docs/site-audit-api.md#post-apiv1auditcrawl) |
| `GET` | `/api/v1/audit/crawl/{job_id}` | `0 Cr` *(JSON poll & CSV stream)* | Permanent archive | [Site Audit API](./docs/site-audit-api.md#get-apiv1auditcrawljob_id) |
| `GET` | `/api/v1/audit/crawls` | `0 Cr` (Task history) | Live history | [Site Audit API](./docs/site-audit-api.md#get-apiv1auditcrawls) |
| `POST` | `/api/v1/audit/batch` | `3 Cr` / hit *(0 Cr misses, up to 50 URLs)* | 24h Vault | [Site Audit API](./docs/site-audit-api.md#post-apiv1auditbatch) |
| `GET` | `/api/v1/backlinks` | `8 Cr` Vault · `30 Cr` Summary · `110 Cr` P1 1K · `80 Cr` P2+ 1K | 30d Vault | [Backlinks API](./docs/backlinks-api.md#get-apiv1backlinks) |
| `POST` | `/api/v1/backlinks/gap` | `30 Cr` / intersection (1–4 competitors) | Live | [Backlinks API](./docs/backlinks-api.md#post-apiv1backlinksgap) |
| `POST` | `/api/v1/backlinks/batch` | `8 Cr` / hit *(0 Cr misses, up to 50 domains)* | 30d Vault | [Backlinks API](./docs/backlinks-api.md#post-apiv1backlinksbatch) |
| `GET` | `/api/v1/keywords` | `5 Cr` Vault · `15–50 Cr` Live (Depth `0–4`) | 30d Vault | [Keyword Research API](./docs/keyword-research-api.md#get-apiv1keywords) |
| `POST` | `/api/v1/keywords/batch` | `18 Cr` / hit *(0 Cr misses; 50 Vault / 10 Live)* | 30d Vault | [Keyword Research API](./docs/keyword-research-api.md#post-apiv1keywordsbatch) |
| `GET` | `/api/v1/keywords/golden` | `5 Cr` / call | Daily / Weekly | [Keyword Research API](./docs/keyword-research-api.md#get-apiv1keywordsgolden) |
| `GET` | `/api/v1/serp` | `3 Cr` Vault · `15 Cr` Live | 24h Vault | [7-Engine SERP API](./docs/serp-api.md#get-apiv1serp) |
| `POST` | `/api/v1/serp/multi` | `10 Cr` / live engine (`3 Cr` cached, 1–7 engines) | 24h Hybrid | [7-Engine SERP API](./docs/serp-api.md#post-apiv1serpmulti) |
| `GET` | `/api/v1/ai-mentions` | `15 Cr` Vault · `125 Cr` Single · `245 Cr` Dual LLM | 30d Vault | [AI Mentions API](./docs/ai-mentions-geo-api.md#get-apiv1ai-mentions) |
| `POST` | `/api/v1/ai-mentions/batch` | `15 Cr` / hit *(0 Cr misses, up to 50 domains)* | 30d Vault | [AI Mentions API](./docs/ai-mentions-geo-api.md#post-apiv1ai-mentionsbatch) |
| `GET` | `/api/v1/domain` | `5 Cr` Vault · `20 Cr` Live Global | 30d Vault | [Domain Explorer API](./docs/domain-explorer-api.md#get-apiv1domain) |
| `POST` | `/api/v1/domain/batch` | `5 Cr` / hit *(0 Cr misses, up to 50 domains)* | 30d Vault | [Domain Explorer API](./docs/domain-explorer-api.md#post-apiv1domainbatch) |
| `GET` | `/api/v1/tai` | `10 Cr` Vault · `50 Cr` Live Deep Forensics | 90d Vault | [TAI™ Forensics API](./docs/tai-forensics-api.md#get-apiv1tai) |
| `POST` | `/api/v1/tai/batch` | `10 Cr` / hit *(0 Cr misses, up to 50 domains)* | 90d Vault | [TAI™ Forensics API](./docs/tai-forensics-api.md#post-apiv1taibatch) |

---

## Pricing, Rollover Credits & Rate Limits

Unused credits **never expire** and stack seamlessly across one-time PAYG packs and Monthly Developer API subscriptions. Estimate your exact stack cost with the [Interactive SERPSpur API Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/) or see [Credits & Vault Caching](./docs/credits-and-vault-caching.md).

| Plan / Pack | Type | Credits Included | Price (USD) | Effective RPM |
| :--- | :--- | ---: | ---: | ---: |
| **PAYG Starter Pack** | One-time (never expires) | 2,500 Cr | $10 | 30 req/min |
| **PAYG Freelancer Pack** | One-time (never expires) | 15,000 Cr | $40 | 30 req/min |
| **PAYG Agency Pack** | One-time (never expires) | 70,000 Cr | $120 | 30 req/min |
| **API Starter** | Monthly (stackable, rolls over) | 25,000 Cr / mo | $49 / mo | 60 req/min |
| **API Scale** | Monthly (stackable, rolls over) | 70,000 Cr / mo | $120 / mo | 120 req/min |
| **API Enterprise** | Monthly (stackable, rolls over) | 200,000 Cr / mo | $340 / mo | 300 req/min |

---

## Postman, OpenAPI 3.1 & Code Examples

- **OpenAPI 3.1 Specifications:**
  - [openapi.yaml](./openapi.yaml) — YAML 1.2 specification for Swagger UI, Redoc, Mintlify, or SDK generators
  - [openapi.json](./openapi.json) — JSON specification synced with `https://serpspur.com/api/v1/openapi.json`
- **Postman Collection (v2.1):**
  - [postman/SERPSpur_API_v3.postman_collection.json](./postman/SERPSpur_API_v3.postman_collection.json) — All 21 endpoints organized in 8 folders
  - [postman/SERPSpur_Environment.postman_environment.json](./postman/SERPSpur_Environment.postman_environment.json) — Pre-configured Sandbox & Production environment variables
- **Runnable Code Examples:**
  - **cURL:** [examples/curl/all-endpoints.sh](./examples/curl/all-endpoints.sh)
  - **Node.js (18+ native `fetch`):**
    - [examples/nodejs/quickstart.js](./examples/nodejs/quickstart.js) — Multi-API quickstart & billing header telemetry
    - [examples/nodejs/async-site-crawl.js](./examples/nodejs/async-site-crawl.js) — Dispatch 100-page crawl, poll status & save CSV
    - [examples/nodejs/backlinks-cursor-export.js](./examples/nodejs/backlinks-cursor-export.js) — Unlimited cursor pagination stream past 10K links
  - **Python (`requests`):**
    - [examples/python/quickstart.py](./examples/python/quickstart.py) — Multi-API quickstart across all core SEO & AI endpoints
    - [examples/python/async_site_crawl.py](./examples/python/async_site_crawl.py) — Async crawl dispatcher, `Retry-After` backoff & CSV export
  - **PHP (native `cURL`):**
    - [examples/php/quickstart.php](./examples/php/quickstart.php) — Lightweight zero-dependency `SERPSpurClient` wrapper & examples

---

## Support & Links

- **Developer Portal & API Keys:** https://serpspur.com/api-docs/
- **Full Documentation Hub:** https://serpspur.com/api-docs/reference/
- **Technical Support:** https://serpspur.com/contact-us/
- **Status & Telemetry:** https://serpspur.com/system-status/
