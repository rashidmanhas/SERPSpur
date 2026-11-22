# Credits, Pricing & Shared Vault Caching

> **SERPSpur Billing Architecture** · Interactive Estimator: [serpspur.com/api-docs/pricing-calculator/](https://serpspur.com/api-docs/pricing-calculator/) · Pricing Page: [serpspur.com/pricing/?tab=api](https://serpspur.com/pricing/?tab=api)

SERPSpur uses a single **unified, never-expiring rollover credit wallet** across all 7 Developer REST APIs and all SaaS web tools. Credits never vanish at month-end, and every response returns exact billing telemetry in HTTP headers and JSON.

---

## Zero-Charge Fairness Guarantees

You are **strictly billed `0 credits`** in all of the following scenarios:

1. **Free Sandbox Mode:** Any call with `mode=sandbox` (using either your own key or `Bearer ss_live_sandbox_demo`).
2. **All HTTP Errors (`4xx` & `5xx`):** Invalid parameters (`400`), auth failures (`401`/`403`), rate limits (`429`), unreachable target websites (`422`), or upstream timeouts (`503`/`504`).
3. **Vault Misses (`404` or Batch `misses[]`):** Querying `mode=vault` or any `/batch` endpoint when a target is not yet cached charges `0 Cr` for every miss.
4. **Account & History Calls:** `GET /api/v1/account`, `GET /api/v1/openapi.json`, `GET /api/v1/audit/crawls`, and polling/downloading CSV from `GET /api/v1/audit/crawl/{job_id}`.
5. **Async Crawl Unused-Page Auto-Refund:** `POST /api/v1/audit/crawl` reserves `max_pages × 2 Cr` upfront, then **automatically refunds** every uncrawled page upon completion (e.g., requesting `100` pages on a 42-page site refunds `116 Cr` automatically).
6. **Zero-Link Backlinks Auto-Downgrade:** Requesting `GET /api/v1/backlinks?include_links=1` on a domain with `0` matching backlinks automatically downgrades the charge to the Summary rate (`30 Cr`) instead of the Links rate.

---

## Shared Vault Caching (Up to 80% Lower Cost)

Every intelligence module maintains a shared, freshness-scoped Vault. Passing `mode=auto` automatically serves cached hits at a fraction of the live cost and seamlessly falls back to a live crawl only on cache misses:

| API Module | Vault TTL | Vault Hit Cost | Live Cost | Max Savings |
| :--- | :---: | ---: | ---: | :---: |
| **Site Audit (`GET /audit`)** | 24 hours | `3 Cr` | `10 Cr` (Std) / `20 Cr` (Deep) | **70–85%** |
| **7-Engine SERP (`GET /serp`)** | 24 hours | `3 Cr` | `15 Cr` (Single) / `10 Cr` (Multi) | **70–80%** |
| **Backlinks (`GET /backlinks`)** | 30 days | `8 Cr` | `30 Cr` Summary / `60+ Cr` Links | **73%+** |
| **Keyword Research (`GET /keywords`)** | 30 days | `5 Cr` | `15–50 Cr` (Depth `0–4`) | **67–90%** |
| **Domain Explorer (`GET /domain`)** | 30 days | `5 Cr` | `20 Cr` Global | **75%** |
| **AI Mentions GEO (`GET /ai-mentions`)** | 30 days | `15 Cr` | `125 Cr` Single / `245 Cr` Dual | **88–94%** |
| **TAI™ Forensics (`GET /tai`)** | 90 days | `10 Cr` | `50 Cr` Live Deep Scan | **80%** |

> **Tip for High-Volume Pipelines:** Run a `POST /*/batch` call in `mode=vault` first (up to **50 domains/URLs/keywords per request**). You pay only for cached hits and receive uncached targets in `misses[]` at `0 Cr`, letting you selectively run live calls only for targets that matter.

---

## Complete Endpoint Credit Cost Schedule

| API Module | Endpoint | Pricing Breakdown |
| :--- | :--- | :--- |
| **Core** | `GET /api/v1/account`, `GET /api/v1/openapi.json` | `0 Cr` (Free) |
| **Site Audit** | `GET /api/v1/audit` | `3 Cr` (Vault) · `10 Cr` (Live Standard & `detail=full`) · `20 Cr` (Live + `check_links=1`) |
| **Site Audit** | `POST /api/v1/audit/crawl` | `2 Cr` / crawled page (`5–100` pages; unused pages auto-refunded) |
| **Site Audit** | `GET /api/v1/audit/crawl/{job_id}`, `GET /api/v1/audit/crawls` | `0 Cr` (Polling, JSON pagination & RFC-4180 CSV export) |
| **Site Audit** | `POST /api/v1/audit/batch` | `3 Cr` / Vault hit (`0 Cr` misses; up to 50 URLs) |
| **Backlinks** | `GET /api/v1/backlinks` | `8 Cr` (Vault) · `30 Cr` (Summary only) · **Page 1 Links:** `60 Cr + 5 Cr / 100 links` (`65 Cr` for 100; `110 Cr` for 1,000) · **Page 2+ Cursor (`cursor=`):** `30 Cr + 5 Cr / 100 links` (`80 Cr` per 1,000 links, skips Summary) |
| **Backlinks** | `POST /api/v1/backlinks/gap` | `30 Cr` / intersection (1–4 competitors) |
| **Backlinks** | `POST /api/v1/backlinks/batch` | `8 Cr` / Vault hit (`0 Cr` misses; up to 50 domains) |
| **Keywords** | `GET /api/v1/keywords` | `5 Cr` (Vault) · `15 Cr` (Depth 0 Seed) · `18 Cr` (Depth 1 Lite / 8 KWs) · `22 Cr` (Depth 2 / 30 KWs) · `30 Cr` (Depth 3 Full / 100 KWs) · `50 Cr` (Depth 4 Mega / 200 KWs) |
| **Keywords** | `POST /api/v1/keywords/batch` | `18 Cr` / hit (`0 Cr` Vault misses; up to 50 Vault / 10 Live) |
| **Keywords** | `GET /api/v1/keywords/golden` | `5 Cr` / call |
| **7-Engine SERP** | `GET /api/v1/serp` | `3 Cr` (Vault) · `15 Cr` (Live) |
| **7-Engine SERP** | `POST /api/v1/serp/multi` | `10 Cr` / live engine + `3 Cr` / cached engine (1–7 engines in parallel) |
| **AI Mentions** | `GET /api/v1/ai-mentions` | `15 Cr` (Vault) · `125 Cr` (Single LLM: ChatGPT or Google AI) · `245 Cr` (Both LLMs) |
| **AI Mentions** | `POST /api/v1/ai-mentions/batch` | `15 Cr` / Vault hit (`0 Cr` misses; up to 50 domains) |
| **Domain Explorer** | `GET /api/v1/domain` | `5 Cr` (Vault) · `20 Cr` (Live Global) |
| **Domain Explorer** | `POST /api/v1/domain/batch` | `5 Cr` / Vault hit (`0 Cr` misses; up to 50 domains) |
| **TAI™ Forensics** | `GET /api/v1/tai` | `10 Cr` (Vault) · `50 Cr` (Live 4-Pillar Deep Scan) |
| **TAI™ Forensics** | `POST /api/v1/tai/batch` | `10 Cr` / Vault hit (`0 Cr` misses; up to 50 domains) |

---

## PAYG Packs vs Stackable Monthly API Subscriptions

| Tier | Billing | Credits | Price (USD) | Cost / 1,000 Cr | RPM Ceiling | Burst / Sec | Concurrent Live |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| **PAYG Starter** | One-time | 2,500 Cr | $10 | $4.00 | 30 | 5 / s | 6 |
| **PAYG Freelancer** | One-time | 15,000 Cr | $40 | $2.67 | 30 | 5 / s | 6 |
| **PAYG Agency** | One-time | 70,000 Cr | $120 | $1.71 | 30 | 5 / s | 6 |
| **API Starter** | Monthly (stackable) | 25,000 Cr | $49 / mo | $1.96 | 60 | 8 / s | 8 |
| **API Scale** | Monthly (stackable) | 70,000 Cr | $120 / mo | $1.71 | 120 | 10 / s | 10 |
| **API Enterprise** | Monthly (stackable) | 200,000 Cr | $340 / mo | $1.70 | 300 | 15 / s | 12 |

---

## Real-Time Billing Telemetry Headers

Every API response includes exact accounting headers so your application can track unit economics in real time without polling `/account`:

```http
X-SerpSpur-Credits-Deducted: 15
X-SerpSpur-Credits-Remaining: 69985
X-SerpSpur-Cache: MISS
X-SerpSpur-Low-Balance: true
X-SerpSpur-Low-Balance-Threshold: 1000
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1795345260
```

← [Back to SERPSpur API Overview](../README.md) · [Authentication & Quotas](./authentication-and-quotas.md) · [Interactive Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/)
