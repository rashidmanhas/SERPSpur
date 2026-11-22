# Domain Organic Traffic, Value & Country Distribution API

> **Traffic & Market Share Intelligence** · `LIVE | Global` · Live Interactive Docs: [serpspur.com/api-docs/domain-api/](https://serpspur.com/api-docs/domain-api/)

Get an instant worldwide organic and paid traffic profile for any domain: total monthly organic visits, equivalent paid traffic value in USD, ranking position distribution (Pos 1, 2–3, 4–10, 11–20, 21–50, 51–100), keyword momentum (new/improved/declined/lost), top ranking countries with traffic share %, and zero-cost cross-intelligence across TAI, Backlinks, AI Mentions, and Tech Audit vaults.

## Key Capabilities

- Global Deduplicated Country Rollup: Accurate worldwide traffic across all ranking markets
- SERP Position Buckets & Keyword Momentum: Track Top-3, Top-10, new, improved, declined & lost keywords
- Zero-Cost Cross-Intelligence Peek: Automatically enriches with cached TAI Score, DR, GEO Score & Tech Health
- 30-Day Vault (5 Cr) + 50-Domain Batch Screening

> **Architecture & Billing Note:** Domain profiles are cached in the shared 30-day Domain Explorer Vault (5 Cr hit vs 20 Cr live global scan).

## Endpoints Summary

| Method | Endpoint | Credit Cost | Caching |
| :--- | :--- | :--- | :--- |
| `GET` | [`/api/v1/domain`](#get-apiv1domain) | Vault (30d): 5 Cr · Live Global Scan: 20 Cr | 30-Day Domain Vault |
| `POST` | [`/api/v1/domain/batch`](#post-apiv1domainbatch) | 5 Cr / Vault Hit (0 Cr for Misses) | 30-Day Domain Vault |

---

## `GET` `/api/v1/domain`

### Global Domain Traffic, Position Distribution & Top Countries

- **Base URL:** `https://serpspur.com/api/v1/domain`
- **Credit Cost:** Vault (30d): 5 Cr | Live Global Scan: 20 Cr
- **Cache Policy:** 30-Day Domain Vault

Returns deduplicated worldwide organic & paid traffic metrics, USD valuation, position buckets, keyword velocity, top countries, and cross-intelligence signals.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `domain` | **Yes** | `string` | `—` | Target root domain (e.g. ahrefs.com). |
| `top_countries` | No | `integer (1–50)` | `10` | Number of top ranking countries to return in top_countries[]. |
| `mode` | No | `enum` | `"auto"` | "sandbox" (0 Cr), "vault" (30d cache), "live", or "auto". |

#### Response Fields

**global_summary, position_distribution & keyword_momentum (18 Fields)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `global_summary.{organic_traffic, organic_traffic_value_usd, organic_keywords, paid_traffic, paid_keywords, countries_ranking}` | `number` | Global monthly traffic estimates, equivalent PPC value in USD, total organic/paid keywords, and market footprint. |
| `position_distribution.{pos_1, pos_2_3, pos_4_10, top_3_total, top_10_total, pos_11_20, pos_21_50, pos_51_100}` | `integer` | Exact keyword count across every organic SERP ranking tier. |
| `keyword_momentum.{new_keywords, improved_keywords, declined_keywords, lost_keywords}` | `integer` | Recent directional ranking velocity signals. |

**top_countries[] & cross_intelligence (17 Fields)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `top_countries[].{location_code, country, iso, organic_traffic, traffic_value_usd, organic_keywords, top_10_keywords, traffic_share_pct}` | `array` | Country-level traffic breakdown sorted by organic traffic descending. |
| `cross_intelligence.{tai_score, geo_visibility_score, domain_rank, referring_domains, tech_health_score}` | `object` | Zero-cost vault enrichment across all other SERPSpur intelligence modules. |

#### Code Examples

**cURL**
```bash
curl -X GET "https://serpspur.com/api/v1/domain?domain=ahrefs.com&top_countries=10&mode=auto" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/domain?domain=ahrefs.com&mode=sandbox', { headers: { 'Authorization': 'Bearer ss_live_sandbox_demo' } });
```

**Python (requests)**
```python
requests.get("https://serpspur.com/api/v1/domain", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, params={"domain": "ahrefs.com"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/domain?domain=ahrefs.com&top_countries=10&mode=auto');
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
    "domain": "ahrefs.com",
    "global_summary": { "organic_traffic": 4210000, "organic_traffic_value_usd": 8950000.0, "organic_keywords": 612000, "countries_ranking": 118 },
    "position_distribution": { "pos_1": 18400, "pos_2_3": 22200, "top_10_total": 94100 },
    "top_countries": [ { "country": "United States", "iso": "US", "organic_traffic": 1890000, "traffic_share_pct": 44.9 } ]
  },
  "billing": { "credits_deducted": 20 }
}
```

---

## `POST` `/api/v1/domain/batch`

### Batch Domain Explorer Vault Lookup (Up to 50 Domains)

- **Base URL:** `https://serpspur.com/api/v1/domain/batch`
- **Credit Cost:** 5 Cr / Vault Hit (0 Cr for Misses)
- **Cache Policy:** 30-Day Domain Vault

Screens up to 50 domains in one call against the 30-day Domain Explorer Vault. Misses cost 0 credits.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `domains` | **Yes** | `array<string>` | `—` | 1 to 50 domains. |
| `mode` | No | `enum` | `"vault"` | "vault" or "sandbox" (0 Cr). |

#### Response Fields

**Batch Output Fields**

| Field | Type | Description |
| :--- | :--- | :--- |
| `data.hits[] / data.misses[]` | `array` | Matched global traffic payloads and uncached domain list. |

#### Code Examples

**cURL**
```bash
curl -X POST "https://serpspur.com/api/v1/domain/batch" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domains":["serpspur.com","ahrefs.com"],"mode":"vault"}'
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/domain/batch', { method: 'POST', headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY', 'Content-Type': 'application/json' }, body: JSON.stringify({ domains: ['serpspur.com'], mode: 'vault' }) });
```

**Python (requests)**
```python
requests.post("https://serpspur.com/api/v1/domain/batch", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, json={"domains": ["serpspur.com"], "mode": "vault"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/domain/batch');
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
  "billing": { "credits_deducted": 5 }
}
```

---

← [Back to SERPSpur API Overview](../README.md) · [Interactive Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/) · [OpenAPI 3.1 Spec](../openapi.yaml)
