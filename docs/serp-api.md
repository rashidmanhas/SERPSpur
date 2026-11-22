# 7-Engine Live SERP & Parallel Rank Tracking API

> **Omnichannel Rank Tracking** · `LIVE | 7 Engines` · Live Interactive Docs: [serpspur.com/api-docs/serp-api/](https://serpspur.com/api-docs/serp-api/)

Fetch live organic search results, SERP features (AI Overviews, Featured Snippets, People Also Ask), and instant target-domain rank matching across 7 global search engines — individually or all in parallel with one POST /api/v1/serp/multi request.

## Key Capabilities

- 7 Search Engines in 1 API: Google, Bing (+ChatGPT search index), Yahoo!, YouTube, Seznam.cz, Naver (KR), Baidu (CN)
- Built-In Domain Rank Matching: Pass domain= to get exact position, ranking URL, is_top_3 & is_top_10 automatically
- Smart 24h SERP Vault: mode=auto costs only 3 Cr on cached SERPs vs 15 Cr live (10 Cr/eng in multi)
- YouTube Video Telemetry: Extracts channel_name, views_count & brand mentions in video titles/descriptions

> **Architecture & Billing Note:** POST /api/v1/serp/multi executes all uncached requested engines in parallel in a single HTTP request, blending 24-hour Vault hits (3 Cr each) with fresh Live crawls (10 Cr each) to cut rank-tracking costs dramatically.

## Endpoints Summary

| Method | Endpoint | Credit Cost | Caching |
| :--- | :--- | :--- | :--- |
| `GET` | [`/api/v1/serp`](#get-apiv1serp) | Vault (24h): 3 Cr · Live: 15 Cr | 24-Hour SERP Vault |
| `POST` | [`/api/v1/serp/multi`](#post-apiv1serpmulti) | 10 Cr / Live Engine (3 Cr if 24h Cached) | Per-Engine 24h Hybrid |

---

## `GET` `/api/v1/serp`

### Single-Engine Live SERP & Dynamic Rank Match

- **Base URL:** `https://serpspur.com/api/v1/serp`
- **Credit Cost:** Vault (24h): 3 Cr | Live: 15 Cr
- **Cache Policy:** 24-Hour SERP Vault

Fetches organic results, AI Overview detection, and SERP features for a keyword on any of the 7 supported engines. Supplying domain= automatically computes target_domain_rank without extra credits.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `keyword` | **Yes** | `string` | `—` | Search query to check. |
| `engine` | No | `enum` | `"google"` | "google", "bing", "yahoo", "youtube", "seznam", "naver", or "baidu". |
| `location` | No | `string` | `"United States"` | Country / market name (e.g. United States, United Kingdom, Germany, India). |
| `language` | No | `string` | `"English"` | Search interface language. |
| `domain` | No | `string` | `null` | Optional root domain for automatic organic rank & URL matching. |
| `depth` | No | `integer` | `20` | SERP result depth (10–100). |
| `mode` | No | `enum` | `"auto"` | "sandbox" (0 Cr), "vault" (24h cache), "live", or "auto". |

#### Response Fields

**SERP Overview, Features & Domain Rank Match (14 Data Points)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `total_results_estimate / organic_results_count` | `integer` | Estimated total indexed results and parsed organic rows returned. |
| `serp_features[] / has_ai_overview` | `array / bool` | Detected SERP modules (ai_overview, featured_snippet, people_also_ask, video, local_pack) and AI Overview boolean. |
| `target_domain_rank.{domain, found, position, url, title, is_top_3, is_top_10}` | `object\|null` | Instant rank match for your domain (includes brand/channel matching on YouTube). |
| `organic_results[].{position, domain, url, title, description, type, channel_name?, views_count?}` | `array` | Ordered organic results (with YouTube channel_name and views_count when engine=youtube). |
| `public_serp_url / verification.{scan_mode, verified_at, cache_age_minutes}` | `string / object` | Direct public verification search URL and freshness telemetry. |

#### Code Examples

**cURL**
```bash
curl -X GET "https://serpspur.com/api/v1/serp?keyword=seo+audit+tool&engine=google&location=United+States&domain=serpspur.com&mode=auto" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/serp?keyword=seo+audit+tool&engine=bing&domain=serpspur.com&mode=auto', { headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY' } });
```

**Python (requests)**
```python
requests.get("https://serpspur.com/api/v1/serp", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, params={"keyword": "seo audit tool", "engine": "google", "domain": "serpspur.com"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/serp?keyword=seo+audit+tool&engine=google&location=United+States&domain=serpspur.com&mode=auto');
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
    "keyword": "seo audit tool",
    "engine": "google",
    "has_ai_overview": true,
    "serp_features": ["ai_overview","people_also_ask"],
    "target_domain_rank": { "domain": "serpspur.com", "found": true, "position": 4, "is_top_3": false, "is_top_10": true },
    "organic_results": [ { "position": 1, "domain": "ahrefs.com", "url": "https://ahrefs.com/site-audit", "title": "Free Site Audit" } ]
  },
  "billing": { "credits_deducted": 15 }
}
```

---

## `POST` `/api/v1/serp/multi`

### Parallel Multi-Engine SERP & Rank Comparison (1–7 Engines)

- **Base URL:** `https://serpspur.com/api/v1/serp/multi`
- **Credit Cost:** 10 Cr / Live Engine (3 Cr if 24h Cached)
- **Cache Policy:** Per-Engine 24h Hybrid

Dispatches up to 7 search engines concurrently in one request and returns side-by-side positions, AI Overview presence, and organic results for every engine.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `keyword` | **Yes** | `string` | `—` | Target keyword. |
| `engines` | No | `array<enum>` | `["google","bing","yahoo","youtube"]` | 1 to 7 engines: google, bing, yahoo, youtube, seznam, naver, baidu. |
| `domain` | No | `string` | `null` | Optional target domain for side-by-side rank comparison. |
| `location / mode` | No | `string / enum` | `"United States" / "auto"` | Geo market and "sandbox"\|"auto"\|"live". |

#### Response Fields

**Multi-Engine Response Map**

| Field | Type | Description |
| :--- | :--- | :--- |
| `data.engines[engine_name]` | `map<object>` | Full SERP payload (identical to GET /api/v1/serp) keyed by each requested engine. |
| `billing.{cached_engines, live_engines, credits_deducted}` | `object` | Exact count of 24h vault hits vs fresh live engines billed. |

#### Code Examples

**cURL**
```bash
curl -X POST "https://serpspur.com/api/v1/serp/multi" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"seo audit tool","domain":"serpspur.com","engines":["google","bing","yahoo","youtube"],"mode":"auto"}'
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/serp/multi', { method: 'POST', headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY', 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword: 'seo audit tool', engines: ['google','bing','youtube'] }) });
```

**Python (requests)**
```python
requests.post("https://serpspur.com/api/v1/serp/multi", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, json={"keyword": "seo audit tool", "engines": ["google", "bing", "youtube"]})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/serp/multi');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS     => '{"keyword":"seo audit tool","domain":"serpspur.com","engines":["google","bing","yahoo","youtube"],"mode":"auto"}',
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
  "data": { "keyword": "seo audit tool", "engines": { "google": { "target_domain_rank": { "position": 4 } }, "bing": { "target_domain_rank": { "position": 2 } } } },
  "billing": { "credits_deducted": 20 }
}
```

---

← [Back to SERPSpur API Overview](../README.md) · [Interactive Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/) · [OpenAPI 3.1 Spec](../openapi.yaml)
