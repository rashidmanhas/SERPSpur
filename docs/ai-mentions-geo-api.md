# AI Mentions & GEO Visibility API (ChatGPT + Google AI Overviews)

> **Generative Engine Optimization (GEO)** · `LIVE | ChatGPT + Google AI` · Live Interactive Docs: [serpspur.com/api-docs/ai-mentions-api/](https://serpspur.com/api-docs/ai-mentions-api/)

Quantify how often ChatGPT and Google AI Overviews cite and recommend a brand or domain. Returns a normalized 0–100 GEO Visibility Score, per-engine mention & impression splits, self-citation status, top third-party citing domains (e.g. G2, Forbes, Reddit), and recognized brand entities/categories.

## Key Capabilities

- Dual LLM Engine Coverage: Query ChatGPT, Google AI Overviews, or both in one request
- Top Citing Domains Leaderboard: Identify exact third-party publishers influencing LLM answers
- Brand Entities & Categories: See how LLMs classify your brand and adjacent product entities
- 30-Day GEO Vault + 50-Domain Batch Screening (15 Cr/hit)

> **Architecture & Billing Note:** Results are cached for 30 days per (domain, location, engine_scope). Vault hits cost 15 Cr vs 125 Cr (single engine) or 245 Cr (both ChatGPT + Google AI live).

## Endpoints Summary

| Method | Endpoint | Credit Cost | Caching |
| :--- | :--- | :--- | :--- |
| `GET` | [`/api/v1/ai-mentions`](#get-apiv1ai-mentions) | Vault (30d): 15 Cr · Single Engine: 125 Cr · Dual Engine: 245 Cr | 30-Day GEO Vault |
| `POST` | [`/api/v1/ai-mentions/batch`](#post-apiv1ai-mentionsbatch) | 15 Cr / Vault Hit (0 Cr for Misses) | 30-Day GEO Vault |

---

## `GET` `/api/v1/ai-mentions`

### Brand AI Mentions, Citations & GEO Visibility Score

- **Base URL:** `https://serpspur.com/api/v1/ai-mentions`
- **Credit Cost:** Vault (30d): 15 Cr | Single Engine: 125 Cr | Dual Engine: 245 Cr
- **Cache Policy:** 30-Day GEO Vault

Measures brand/domain citations across ChatGPT and Google AI Overviews, returning composite GEO score, per-engine metrics, top citing domains, and recognized entity categories.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `domain` | **Yes** | `string` | `—` | Target brand domain (e.g. serpspur.com). |
| `brand` | No | `string` | `auto from domain` | Optional explicit brand name keyword to pair with the domain. |
| `engine` | No | `enum` | `"both"` | "both" (ChatGPT + Google AI), "chat_gpt", or "google". |
| `location` | No | `string` | `"United States"` | Target country market. |
| `mode` | No | `enum` | `"auto"` | "sandbox" (0 Cr), "vault" (30d cache), "live", or "auto". |

#### Response Fields

**GEO Scores, Per-Engine Breakdown & Citations (20+ Data Points)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `geo_visibility_score / grade` | `int / string` | Composite 0–100 Generative Engine Optimization score and letter grade. |
| `total_mentions / ai_search_impressions / self_cited` | `int / bool` | Total combined LLM mentions, estimated AI search impressions, and whether the brand domain itself is cited. |
| `engines.chat_gpt.{geo_score, mentions, impressions, citing_domains_count}` | `object\|null` | ChatGPT-specific mention volume, impressions, and unique citing sources. |
| `engines.google_ai_overview.{geo_score, mentions, impressions, citing_domains_count}` | `object\|null` | Google AI Overview mention volume, impressions, and citing sources. |
| `top_citing_domains[].{domain, mentions, impressions}` | `array (top 15)` | Top third-party authority domains that LLMs cite when discussing this brand. |
| `brand_entities[].{title, mentions, impressions} / entity_categories[].{category, mentions, impressions}` | `array` | Top 15 entity titles and Top 10 industry categories associated with the brand inside AI responses. |

#### Code Examples

**cURL**
```bash
curl -X GET "https://serpspur.com/api/v1/ai-mentions?domain=serpspur.com&engine=both&location=United+States&mode=auto" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/ai-mentions?domain=serpspur.com&engine=both&mode=sandbox', { headers: { 'Authorization': 'Bearer ss_live_sandbox_demo' } });
```

**Python (requests)**
```python
requests.get("https://serpspur.com/api/v1/ai-mentions", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, params={"domain": "serpspur.com", "engine": "both"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/ai-mentions?domain=serpspur.com&engine=both&location=United+States&mode=auto');
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
    "domain": "serpspur.com",
    "geo_visibility_score": 78,
    "grade": "B+",
    "total_mentions": 412,
    "ai_search_impressions": 128400,
    "self_cited": true,
    "engines": { "chat_gpt": { "geo_score": 74, "mentions": 186 }, "google_ai_overview": { "geo_score": 81, "mentions": 226 } },
    "top_citing_domains": [ { "domain": "g2.com", "mentions": 42, "impressions": 18200 } ]
  },
  "billing": { "credits_deducted": 245 }
}
```

---

## `POST` `/api/v1/ai-mentions/batch`

### Batch AI Mentions Vault Lookup (Up to 50 Domains)

- **Base URL:** `https://serpspur.com/api/v1/ai-mentions/batch`
- **Credit Cost:** 15 Cr / Vault Hit (0 Cr for Misses)
- **Cache Policy:** 30-Day GEO Vault

Checks up to 50 domains in 1 request against the 30-day GEO Vault. Only cache hits consume credits.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `domains` | **Yes** | `array<string>` | `—` | 1 to 50 domains to screen. |
| `mode` | No | `enum` | `"vault"` | "vault" or "sandbox" (0 Cr). |

#### Response Fields

**Batch Output Fields**

| Field | Type | Description |
| :--- | :--- | :--- |
| `data.hits[] / data.misses[]` | `array` | Matched GEO payloads and list of uncached domains (0 Cr). |

#### Code Examples

**cURL**
```bash
curl -X POST "https://serpspur.com/api/v1/ai-mentions/batch" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domains":["serpspur.com","ahrefs.com"],"mode":"vault"}'
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/ai-mentions/batch', { method: 'POST', headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY', 'Content-Type': 'application/json' }, body: JSON.stringify({ domains: ['serpspur.com'], mode: 'vault' }) });
```

**Python (requests)**
```python
requests.post("https://serpspur.com/api/v1/ai-mentions/batch", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, json={"domains": ["serpspur.com"], "mode": "vault"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/ai-mentions/batch');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS     => '{"domains":["serpspur.com","ahrefs.com"],"mode":"vault"}',
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
  "data": { "requested_count": 2, "hits_count": 1, "misses_count": 1, "hits": [], "misses": ["ahrefs.com"] },
  "billing": { "credits_deducted": 15 }
}
```

---

← [Back to SERPSpur API Overview](../README.md) · [Interactive Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/) · [OpenAPI 3.1 Spec](../openapi.yaml)
