# Headless Chrome Technical & AI-Crawler Audit + 100-Page Crawl API

> **Technical SEO & Headless Chrome** · `LIVE | v3.0` · Live Interactive Docs: [serpspur.com/api-docs/site-audit-api/](https://serpspur.com/api-docs/site-audit-api/)

Execute real Headless Chrome rendering on desktop or mobile viewports to measure Core Web Vitals (LCP, CLS, TTFB, FCP, TBT, INP), post-JS On-Page SEO, AI Crawler Readiness (robots.txt directives for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot + llms.txt), Security Headers, Broken Links, and async 5–100 page full-site crawls without HTTP timeouts.

## Key Capabilities

- Real JS Rendering: Full Chromium execution — audits React, Next.js, Vue, Shopify & WordPress accurately
- detail=full (0 Extra Cr): Returns complete H1–H6 outline, oversized images, OG/Twitter, JSON-LD & text preview
- Async 100-Page Crawl: Instant dispatch (<250ms), webhook push, 15-min auto-sync & automatic unused-page credit refund
- 0-Credit Streaming CSV Export: Download all crawled pages in RFC-4180 CSV via ?format=csv

> **Architecture & Billing Note:** Single-URL audits (GET /api/v1/audit) check the 24-hour Audit Vault first in mode=auto (3 Cr hit vs 10 Cr live). Multi-page crawls (POST /api/v1/audit/crawl) execute asynchronously in the background: credits are reserved for max_pages × 2 Cr, and any uncrawled pages are refunded automatically via atomic compare-and-swap on completion.

## Endpoints Summary

| Method | Endpoint | Credit Cost | Caching |
| :--- | :--- | :--- | :--- |
| `GET` | [`/api/v1/audit`](#get-apiv1audit) | Vault: 3 Cr · Live: 10 Cr · Deep (+30 Links): 20 Cr | 24-Hour Shared Vault |
| `POST` | [`/api/v1/audit/crawl`](#post-apiv1auditcrawl) | 2 Cr / crawled page (unused pages auto-refunded) | Async Queue + Permanent Archive |
| `GET` | [`/api/v1/audit/crawl/{job_id}`](#get-apiv1auditcrawljob_id) | 0 Credits (Free Polling & CSV Download) | Permanent DB Archive Once Completed |
| `GET` | [`/api/v1/audit/crawls`](#get-apiv1auditcrawls) | 0 Credits (Free Task History) | Direct DB History |
| `POST` | [`/api/v1/audit/batch`](#post-apiv1auditbatch) | 3 Cr / Vault Hit (0 Cr for Misses) | 24-Hour Vault Only |

---

## `GET` `/api/v1/audit`

### Single-URL Headless Chrome Technical, CWV & AI-Crawler Audit

- **Base URL:** `https://serpspur.com/api/v1/audit`
- **Credit Cost:** Vault: 3 Cr | Live: 10 Cr | Deep (+30 Links): 20 Cr
- **Cache Policy:** 24-Hour Shared Vault

Audits a single URL in Headless Chrome (desktop 1366x768 or mobile 390x844). Returns 60+ technical data points across HTTP, On-Page SEO, Core Web Vitals, Page Weight, Links/Media, Security Headers, AI Crawler Readiness, and prioritized issues. Add detail=full at 0 extra credits to include deep DOM arrays (headings outline, oversized/missing-alt image URLs, raw JSON-LD, links inventory, and extracted text).

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `url` | **Yes** | `string` | `—` | Full public HTTP/HTTPS URL or domain (e.g. https://serpspur.com/). Private/loopback/metadata IPs are blocked. |
| `device` | No | `enum` | `"desktop"` | Viewport emulation: "desktop" (1366×768) or "mobile" (390×844). |
| `detail` | No | `enum` | `"standard"` | "standard" (compact metrics) or "full" (adds deep_onpage object with full headings outline, images, OG/Twitter, JSON-LD, links inventory & 5,000-char text preview for 0 extra credits). |
| `check_links` | No | `0 \| 1` | `0` | Set 1 to live-verify HTTP status of up to 30 internal/external links on the page (20 Cr). |
| `mode` | No | `enum` | `"auto"` | "sandbox" (0 Cr), "vault" (24h cache only; 404 = 0 Cr), "live" (force fresh render), or "auto" (24h vault hit -> live fallback). |

#### Response Fields

**Top-Level & http Object (11 fields)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `url / final_url / domain / device / detail_level` | `string` | Requested URL, post-redirect final URL, normalized root domain, viewport, and detail tier. |
| `health_score / grade` | `int / string` | 0–100 weighted technical health score and letter grade (A+, A, B+, B, C, D, F). |
| `http.status_code / is_https` | `int / bool` | Final HTTP status code (200, 301, 404, etc.) and HTTPS enforcement flag. |
| `http.redirect_hops / redirect_chain[]` | `int / array` | Number of redirect hops and ordered array of intermediate URLs & status codes. |
| `http.server / content_type` | `string\|null` | Response Server header and MIME Content-Type. |

**on_page_seo (24 Post-JS DOM SEO Data Points)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `title / title_length` | `string / int` | Rendered <title> text and character length. |
| `meta_description / meta_description_length` | `string / int` | Rendered meta description text and character length. |
| `canonical_url / canonical_matches_url` | `string / bool` | Extracted rel="canonical" URL and whether it matches final_url. |
| `robots_directive / is_indexable / is_noindex / is_nofollow` | `string / bool` | Combined meta robots + X-Robots-Tag directive and computed indexability flags. |
| `h1_text / headings.{h1..h6}` | `string / object` | Primary H1 text and tag counts across H1 through H6. |
| `page_type / word_count / is_thin_content / thin_content_threshold` | `mixed` | Detected template type (homepage/article/product/utility), visible words, and adaptive thin-content flag. |
| `readability_score / text_html_ratio_pct` | `number` | Flesch readability score and visible text-to-HTML ratio percentage. |
| `html_lang / hreflang_tags[]` | `string / array` | Document lang attribute and extracted international hreflang entries. |
| `schema_types[] / has_og_tags / has_twitter_card / mobile_viewport_configured` | `mixed` | Detected JSON-LD @type names, OpenGraph/Twitter presence, and mobile viewport meta flag. |

**core_web_vitals & page_weight (15 Performance Metrics)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `core_web_vitals.ttfb_ms / fcp_ms / lcp_ms` | `number (ms)` | Time to First Byte, First Contentful Paint, and Largest Contentful Paint measured in Chrome. |
| `core_web_vitals.cls / tbt_ms / inp_ms` | `number` | Cumulative Layout Shift, Total Blocking Time (ms), and Interaction to Next Paint (ms). |
| `core_web_vitals.dom_content_loaded_ms / load_event_ms` | `number (ms)` | DOMContentLoaded and window load event completion timings. |
| `page_weight.total_requests / total_kb` | `int / number` | Total network sub-requests and transferred payload in kilobytes. |
| `page_weight.breakdown_kb.{document, script, stylesheet, image, font}` | `object` | Kilobyte breakdown by asset type to pinpoint heavy JS or unoptimized images. |

**links_and_media, security & ai_crawler_readiness (32 Fields)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `links_and_media.{internal_links, external_links, internal_nofollow_links}` | `integer` | Link graph totals and internal nofollow counts. |
| `links_and_media.{images_total, images_missing_alt, broken_images_count, broken_images[], oversized_images_count}` | `mixed` | Image accessibility, failed image loads, and oversized media counts. |
| `links_and_media.{deep_link_check_ran, links_verified, broken_links_count, broken_links[]}` | `mixed` | Populated when check_links=1: live HTTP status check of up to 30 links with broken URLs & status codes. |
| `security.{headers, has_mixed_content, insecure_password_forms, unsafe_target_blank_links, vulnerable_js[], cookies}` | `object` | HSTS/CSP/XFO/XCTO/Referrer-Policy audit, mixed content, insecure forms, vulnerable JS libs, and cookie flags. |
| `ai_crawler_readiness.{has_robots_txt, has_llms_txt, ai_readiness_score, crawlers}` | `object` | Detects /llms.txt and parses robots.txt access ("allowed"\|"blocked") for googlebot, bingbot, gptbot, oai_searchbot, claudebot, and perplexitybot. |
| `issues_summary & issues[]` | `object / array` | Prioritized issue counts (critical/warnings/info) and detailed remediation items with severity, code, message, and score impact. |

**deep_onpage (Returned When detail=full — 0 Extra Credits)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `deep_onpage.headings_outline[]` | `array` | Ordered H1–H6 tag tree with exact text content. |
| `deep_onpage.oversized_images[] / missing_alt_images[]` | `array` | Image URLs with natural vs rendered dimensions and missing alt attributes. |
| `deep_onpage.social_meta` | `object` | Full og:* and twitter:* key-value metadata. |
| `deep_onpage.structured_data_raw[]` | `array` | Parsed JSON-LD structured data blocks. |
| `deep_onpage.links_inventory[]` | `array` | Discovered links with url, anchor text, scope (internal/external), and rel attributes. |
| `deep_onpage.extracted_text_preview` | `string` | First 5,000 characters of clean rendered body text for LLM/NLP pipelines. |

**cross_intelligence, verification & billing**

| Field | Type | Description |
| :--- | :--- | :--- |
| `cross_intelligence.{tai_score, organic_traffic, geo_visibility_score, domain_rank}` | `object` | Zero-cost cross-vault enrichment peek if the domain exists in TAI, Domain, AI Mentions, or Backlinks vaults. |
| `verification.{scan_mode, verified_at, cache_age_minutes}` | `object` | Audit freshness metadata and ISO-8601 timestamp. |
| `billing.{credits_deducted, remaining_balance, billing_tier}` | `object` | Exact credit charge and updated wallet balance. |

#### Code Examples

**cURL**
```bash
curl -X GET "https://serpspur.com/api/v1/audit?url=https%3A%2F%2Fserpspur.com%2F&device=desktop&detail=full&mode=auto" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"
```

**Node.js (fetch)**
```javascript
const res = await fetch('https://serpspur.com/api/v1/audit?url=https%3A%2F%2Fserpspur.com%2F&detail=full&mode=auto', {
  headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY' }
});
const { data } = await res.json();
console.log(data.health_score, data.core_web_vitals.lcp_ms, data.ai_crawler_readiness);
```

**Python (requests)**
```python
import requests
r = requests.get(
    "https://serpspur.com/api/v1/audit",
    headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"},
    params={"url": "https://serpspur.com/", "device": "desktop", "detail": "full", "mode": "auto"}
)
print(r.json()["data"]["health_score"])
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/audit?url=https%3A%2F%2Fserpspur.com%2F&device=desktop&detail=full&mode=auto');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Accept: application/json',
    ],
]);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
print_r($data);
```

#### Example Responses

**JSON Response**
```json
{
  "success": true,
  "data": {
    "url": "https://serpspur.com/",
    "device": "desktop",
    "detail_level": "full",
    "health_score": 92,
    "grade": "A",
    "http": { "status_code": 200, "is_https": true, "redirect_hops": 0 },
    "on_page_seo": { "title": "SERPSpur", "is_indexable": true, "word_count": 1240, "schema_types": ["Organization","WebSite"] },
    "core_web_vitals": { "ttfb_ms": 185, "fcp_ms": 740, "lcp_ms": 1620, "cls": 0.012, "tbt_ms": 45, "inp_ms": 68 },
    "ai_crawler_readiness": { "has_robots_txt": true, "has_llms_txt": true, "ai_readiness_score": 100, "crawlers": { "gptbot": "allowed", "claudebot": "allowed", "perplexitybot": "allowed" } },
    "deep_onpage": { "headings_outline": [], "oversized_images": [], "links_inventory": [] }
  },
  "billing": { "credits_deducted": 10, "remaining_balance": 69990, "billing_tier": "live_full" }
}
```

---

## `POST` `/api/v1/audit/crawl`

### Start Async Multi-Page Full-Site Crawl (5–100 Pages)

- **Base URL:** `https://serpspur.com/api/v1/audit/crawl`
- **Credit Cost:** 2 Cr / crawled page (unused pages auto-refunded)
- **Cache Policy:** Async Queue + Permanent Archive

Dispatches a non-blocking 5–100 page Headless Chrome site crawl via sitemap discovery + internal link BFS. Returns immediately (<250ms) with a job_id and poll_url so your app never times out. Credits are reserved upfront (max_pages × 2 Cr); if the site has fewer pages than requested, unused credits are auto-refunded atomically upon completion (both when polled and via our 15-minute background reconciler cron).

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `url` | **Yes** | `string` | `—` | Starting root URL or domain (also accepts "domain" alias). |
| `max_pages` | No | `integer` | `25` | Max unique pages to crawl (clamped 5–100). Upfront reserve = max_pages × 2 Cr. |
| `device` | No | `enum` | `"desktop"` | "desktop" or "mobile" Chrome viewport. |
| `webhook_url` | No | `string (HTTPS)` | `null` | Optional public HTTPS callback URL notified via JSON POST when crawl finishes (SSRF-validated). |
| `mode` | No | `enum` | `"live"` | "live" (real background crawl) or "sandbox" (0 Cr instant test job). |

#### Response Fields

**Dispatch Response Fields (Returned Immediately in <250ms)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `data.job_id` | `string` | Unique crawl job identifier (e.g. crawl_9a7c21f0e3). |
| `data.status` | `enum` | Initial lifecycle state: "queued". Transitions to "running" -> "completed" or "failed". |
| `data.poll_url` | `string (URL)` | Ready-to-call 0-credit status & paginated results endpoint. |
| `data.credits_reserved / cost_per_page / auto_refund_unused_pages` | `mixed` | Upfront credit reserve and confirmation that uncrawled pages auto-refund. |

#### Code Examples

**cURL**
```bash
curl -X POST "https://serpspur.com/api/v1/audit/crawl" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://serpspur.com/","max_pages":100,"device":"desktop","webhook_url":"https://yourapp.com/hooks/crawl"}'
```

**Node.js (fetch)**
```javascript
const res = await fetch('https://serpspur.com/api/v1/audit/crawl', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://serpspur.com/', max_pages: 100, device: 'desktop' })
});
const { data } = await res.json();
console.log('Job ID:', data.job_id, 'Poll:', data.poll_url);
```

**Python (requests)**
```python
import requests
r = requests.post(
    "https://serpspur.com/api/v1/audit/crawl",
    headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"},
    json={"url": "https://serpspur.com/", "max_pages": 100, "device": "desktop"}
)
print(r.json()["data"]["poll_url"])
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/audit/crawl');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS     => '{"url":"https://serpspur.com/","max_pages":100,"device":"desktop","webhook_url":"https://yourapp.com/hooks/crawl"}',
]);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
print_r($data);
```

#### Example Responses

**JSON Response**
```json
{
  "success": true,
  "data": {
    "job_id": "crawl_9a7c21f0e3",
    "domain": "serpspur.com",
    "max_pages": 100,
    "status": "queued",
    "poll_url": "https://serpspur.com/api/v1/audit/crawl/crawl_9a7c21f0e3",
    "credits_reserved": 200,
    "cost_per_page": 2,
    "auto_refund_unused_pages": true
  },
  "billing": { "credits_deducted": 200, "billing_tier": "live_crawl_reserved" }
}
```

**Webhook Callback Payload**
```json
// Asynchronous JSON POST sent to your webhook_url on completion:
{
  "event": "audit.crawl.completed",
  "job_id": "crawl_9a7c21f0e3",
  "domain": "serpspur.com",
  "status": "completed",
  "pages_crawled": 42,
  "site_health_score": 91,
  "grade": "A"
}
```

---

## `GET` `/api/v1/audit/crawl/{job_id}`

### Poll Crawl Progress, Paginated JSON Report & Streaming CSV Export

- **Base URL:** `https://serpspur.com/api/v1/audit/crawl/{job_id}`
- **Credit Cost:** 0 Credits (Free Polling & CSV Download)
- **Cache Policy:** Permanent DB Archive Once Completed

Polls a running crawl or retrieves a permanently archived completed crawl for 0 credits. Returns site-wide health rollup, cross-page duplicate title/meta clusters, AI crawler readiness, paginated per-page audits, and exact auto-refund accounting. Append ?format=csv to stream ALL crawled pages directly as an RFC-4180 CSV file.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `job_id` | **Yes** | `path` | `—` | Job ID returned by POST /api/v1/audit/crawl (or "crawl_sandbox_demo" for free sandbox). |
| `page / per_page` | No | `integer` | `1 / 25` | Pagination controls for pages[] in JSON mode (per_page 1–100). |
| `format` | No | `enum` | `"json"` | "json" (paginated) or "csv" (streams ALL crawled pages as text/csv with Content-Disposition attachment; returns HTTP 409 if crawl is still running). |

#### Response Fields

**summary (Site-Wide Rollup — 14 Data Points)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `summary.site_health_score / grade` | `int / string` | Site-wide average technical health score (0–100) and grade. |
| `summary.pages_requested / pages_crawled` | `integer` | Requested cap vs actual crawled page count. |
| `summary.pages_healthy_2xx / pages_redirect_3xx / pages_broken_4xx_5xx` | `integer` | HTTP status code counts across the full crawl. |
| `summary.missing_h1_pages / noindex_pages / thin_content_pages` | `integer` | Site-wide content & indexability defect counts. |
| `summary.duplicate_titles_groups / duplicate_meta_desc_groups` | `integer` | Number of cross-page duplicate title and meta description groups. |
| `summary.avg_lcp_ms / avg_cls / avg_page_weight_kb` | `number` | Site-wide average Core Web Vitals & payload weight. |

**site_issues, pages[] & CSV Columns (17 Fields Per Page)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `site_issues.duplicate_titles[] / duplicate_meta_descriptions[]` | `array` | Exact duplicate text strings paired with arrays of all conflicting URLs. |
| `pages[] (also CSV columns)` | `array` | url, status_code, health_score, grade, title, title_length, meta_description, h1, word_count, lcp_ms, cls, page_weight_kb, internal_links, external_links, broken_links_count, is_indexable, canonical_url. |
| `data.csv_url / billing.credits_refunded` | `string / int` | Direct CSV download link and credits automatically refunded for uncrawled pages. |

#### Code Examples

**cURL**
```bash
# Poll JSON (0 Cr)
curl -X GET "https://serpspur.com/api/v1/audit/crawl/crawl_sandbox_demo?page=1&per_page=25" \
  -H "Authorization: Bearer ss_live_sandbox_demo"

# Stream All Pages as CSV (0 Cr)
curl -X GET "https://serpspur.com/api/v1/audit/crawl/crawl_sandbox_demo?format=csv" \
  -H "Authorization: Bearer ss_live_sandbox_demo" -o site-audit.csv
```

**Node.js (fetch)**
```javascript
const csv = await fetch('https://serpspur.com/api/v1/audit/crawl/crawl_sandbox_demo?format=csv', {
  headers: { 'Authorization': 'Bearer ss_live_sandbox_demo' }
}).then(r => r.text());
```

**Python (requests)**
```python
import requests
csv_bytes = requests.get("https://serpspur.com/api/v1/audit/crawl/crawl_sandbox_demo", headers={"Authorization": "Bearer ss_live_sandbox_demo"}, params={"format": "csv"}).content
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/audit/crawl/crawl_sandbox_demo?page=1&per_page=25');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Accept: application/json',
    ],
]);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
print_r($data);
```

#### Example Responses

**JSON Response**
```json
{
  "success": true,
  "data": {
    "job_id": "crawl_sandbox_demo",
    "status": "completed",
    "csv_url": "https://serpspur.com/api/v1/audit/crawl/crawl_sandbox_demo?format=csv",
    "summary": { "site_health_score": 91, "grade": "A", "pages_crawled": 18, "duplicate_meta_desc_groups": 1, "avg_lcp_ms": 1720 },
    "pagination": { "page": 1, "per_page": 25, "total_pages_crawled": 18 },
    "pages": [ { "url": "https://serpspur.com/", "status_code": 200, "health_score": 94, "lcp_ms": 1620 } ]
  },
  "billing": { "credits_reserved": 50, "credits_final": 36, "credits_refunded": 14, "poll_cost": 0 }
}
```

**CSV / Spec Output**
```csv
url,status_code,health_score,grade,title,title_length,meta_description,h1,word_count,lcp_ms,cls,page_weight_kb,internal_links,external_links,broken_links_count,is_indexable,canonical_url
https://serpspur.com/,200,94,A,"SERPSpur — 7-Engine SEO & AI Platform",37,,,1240,1620,0.012,845.2,38,6,0,true,https://serpspur.com/
```

---

## `GET` `/api/v1/audit/crawls`

### List Past Async Site Crawl Jobs

- **Base URL:** `https://serpspur.com/api/v1/audit/crawls`
- **Credit Cost:** 0 Credits (Free Task History)
- **Cache Policy:** Direct DB History

Returns a paginated history of all multi-page site crawl tasks created by your account, filterable by status, with ready-to-use poll_url and csv_url links.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `page / per_page` | No | `integer` | `1 / 20` | Pagination controls (per_page 1–50). |
| `status` | No | `enum` | `"all"` | Filter by "all", "queued", "running", "completed", or "failed". |
| `mode` | No | `enum` | `live` | Pass "sandbox" to test response shape for 0 credits. |

#### Response Fields

**crawls[] Task History Fields (15 fields)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `job_id / domain / start_url / device / status` | `string` | Job identifier, target domain, viewport, and status. |
| `pages_requested / pages_crawled / site_health_score / grade` | `mixed` | Crawl completion progress and final site score. |
| `credits_reserved / credits_final / credits_refunded` | `integer` | Complete credit settlement summary. |
| `poll_url / csv_url / created_at / updated_at` | `string` | Direct JSON poll URL, 0-Cr CSV URL, and ISO-8601 timestamps. |

#### Code Examples

**cURL**
```bash
curl -X GET "https://serpspur.com/api/v1/audit/crawls?status=completed&per_page=20" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"
```

**Node.js (fetch)**
```javascript
const { data } = await fetch('https://serpspur.com/api/v1/audit/crawls?status=completed', { headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY' } }).then(r => r.json());
```

**Python (requests)**
```python
import requests
print(requests.get("https://serpspur.com/api/v1/audit/crawls", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}).json())
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/audit/crawls?status=completed&per_page=20');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Accept: application/json',
    ],
]);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
print_r($data);
```

#### Example Responses

**JSON Response**
```json
{
  "success": true,
  "data": {
    "pagination": { "page": 1, "per_page": 20, "total": 1, "total_pages": 1 },
    "crawls": [ { "job_id": "crawl_sandbox_demo", "domain": "serpspur.com", "status": "completed", "pages_crawled": 18, "credits_refunded": 14, "csv_url": "https://serpspur.com/api/v1/audit/crawl/crawl_sandbox_demo?format=csv" } ]
  }
}
```

---

## `POST` `/api/v1/audit/batch`

### Batch Technical Audit Vault Lookup (Up to 50 URLs)

- **Base URL:** `https://serpspur.com/api/v1/audit/batch`
- **Credit Cost:** 3 Cr / Vault Hit (0 Cr for Misses)
- **Cache Policy:** 24-Hour Vault Only

Checks up to 50 URLs against the 24-hour Technical Audit Vault in a single ultra-fast request. You are charged only for cache hits; misses cost 0 credits.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `urls` | **Yes** | `array<string>` | `—` | Array of 1–50 public URLs to look up. |
| `device` | No | `enum` | `"desktop"` | "desktop" or "mobile". |
| `mode` | No | `enum` | `"vault"` | "vault" or "sandbox" (0 Cr). |

#### Response Fields

**Batch Response Structure**

| Field | Type | Description |
| :--- | :--- | :--- |
| `data.hits[]` | `array` | Full audit objects for every URL found in the 24h vault. |
| `data.misses[]` | `array<string>` | URLs not cached within 24h (0 credits billed). |
| `billing.credits_deducted` | `integer` | hits_count × 3 Cr. |

#### Code Examples

**cURL**
```bash
curl -X POST "https://serpspur.com/api/v1/audit/batch" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://serpspur.com/","https://serpspur.com/pricing/"],"device":"desktop","mode":"vault"}'
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/audit/batch', { method: 'POST', headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY', 'Content-Type': 'application/json' }, body: JSON.stringify({ urls: ['https://serpspur.com/'], mode: 'vault' }) });
```

**Python (requests)**
```python
requests.post("https://serpspur.com/api/v1/audit/batch", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, json={"urls": ["https://serpspur.com/"], "mode": "vault"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/audit/batch');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS     => '{"urls":["https://serpspur.com/","https://serpspur.com/pricing/"],"device":"desktop","mode":"vault"}',
]);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
print_r($data);
```

#### Example Responses

**JSON Response**
```json
{
  "success": true,
  "data": { "requested_count": 2, "hits_count": 1, "misses_count": 1, "hits": [], "misses": ["https://serpspur.com/pricing/"] },
  "billing": { "credits_deducted": 3 }
}
```

---

← [Back to SERPSpur API Overview](../README.md) · [Interactive Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/) · [OpenAPI 3.1 Spec](../openapi.yaml)
