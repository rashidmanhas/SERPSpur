# Keyword Research, Difficulty & Topical Cluster API

> **Search Demand & Topical Clusters** · `LIVE | Depth 0–4` · Live Interactive Docs: [serpspur.com/api-docs/keywords-api/](https://serpspur.com/api-docs/keywords-api/)

Pull real-time search demand, 12-month seasonality trends, YoY/QoQ growth velocity, Keyword Difficulty (0–100), Top-10 referring domains & dofollow links needed to rank, commercial intent, SERP features, forum-weakness signals, and multi-depth related keyword clusters (from Seed-Only Depth 0 up to Mega 200-Keyword Depth 4).

## Key Capabilities

- 6 Flexible Pricing Depths: Vault (5 Cr), Seed Depth 0 (15 Cr), Lite Depth 1 (18 Cr), Standard Depth 2 (22 Cr), Full 100-KW Depth 3 (30 Cr), Mega Depth 4 (50 Cr)
- Backlinks-to-Rank Benchmark: Average referring domains, dofollow links & DR of current Top-10 SERP winners
- Forum Weakness & Golden Gem Flags: Automatically spots easy-to-outrank Reddit/Quora/forum SERPs
- 50-Keyword Batch Vault + Community Golden Gems Feed

> **Architecture & Billing Note:** Control output size and cost cleanly with depth=0..4 or mode=vault|lite|standard|full|mega. Vault cache persists for 30 days per (keyword, country, language).

## Endpoints Summary

| Method | Endpoint | Credit Cost | Caching |
| :--- | :--- | :--- | :--- |
| `GET` | [`/api/v1/keywords`](#get-apiv1keywords) | Vault: 5 Cr · D0: 15 · Lite: 18 · D2: 22 · Full 100: 30 · Mega: 50 Cr | 30-Day Keyword Vault |
| `POST` | [`/api/v1/keywords/batch`](#post-apiv1keywordsbatch) | 18 Cr / Hit (0 Cr for Vault Misses) | 30-Day Vault (50 KWs) / Live (10 KWs) |
| `GET` | [`/api/v1/keywords/golden`](#get-apiv1keywordsgolden) | 5 Credits / Call | Daily / Weekly Curated Feed |

---

## `GET` `/api/v1/keywords`

### Single Keyword Intelligence & Related Cluster Scan (Depth 0–4)

- **Base URL:** `https://serpspur.com/api/v1/keywords`
- **Credit Cost:** Vault: 5 Cr | D0: 15 | Lite: 18 | D2: 22 | Full 100: 30 | Mega: 50 Cr
- **Cache Policy:** 30-Day Keyword Vault

Returns full seed keyword telemetry plus related keyword cluster sized by your chosen depth (0 = seed only, 1 = lite/top 8, 2 = standard/top 30, 3 = full/100 KWs, 4 = mega/200 KWs).

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `keyword` | **Yes** | `string` | `—` | Seed keyword query (1 to 120 characters). |
| `country` | No | `ISO-2` | `"us"` | 2-letter ISO country code (us, gb, ca, au, de, in, etc.). |
| `language` | No | `ISO-2` | `"en"` | 2-letter ISO language code (en, es, de, fr, etc.). |
| `depth` | No | `integer (0–4)` | `3` | 0=Seed only (15 Cr), 1=Lite/8 KWs (18 Cr), 2=Standard/30 KWs (22 Cr), 3=Full/100 KWs (30 Cr), 4=Mega/200 KWs (50 Cr). |
| `mode` | No | `enum` | `"full"` | "sandbox" (0 Cr), "vault" (5 Cr; 404 = 0 Cr), "seed", "lite", "standard", "full", or "mega". |

#### Response Fields

**Seed Keyword Metrics & Momentum (15 Data Points)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `search_volume / cpc / difficulty / opportunity_score` | `number` | Monthly search volume, estimated CPC (USD), Keyword Difficulty (0–100), and composite Opportunity Score (0–100). |
| `volume_trend_yoy / qoq_momentum_3m / peak_month / monthly_searches[]` | `mixed` | Year-over-year % trend, 3-month quarter-over-quarter momentum, peak seasonality month, and 12-month sparkline array. |
| `parent_topic / main_intent` | `string` | Canonical parent topic cluster and search intent (informational, commercial, transactional, navigational). |
| `serp_features[] / has_forum_weakness` | `array / bool` | Active SERP features (ai_overview, people_also_ask, discussions_and_forums) and easy-win forum weakness flag. |

**backlinks_to_rank & related_keywords[] Cluster Schema**

| Field | Type | Description |
| :--- | :--- | :--- |
| `backlinks_to_rank.{avg_ref_domains, avg_backlinks, avg_dofollow, avg_domain_rank}` | `object` | Average link authority held by current Top-10 Google organic results. |
| `related_keywords[].{keyword, volume, trend, difficulty, cpc, intent, ref_domains, dofollow_links, is_golden}` | `array` | Full metrics for every related keyword in the cluster plus is_golden low-KD / high-volume flag. |

#### Code Examples

**cURL**
```bash
curl -X GET "https://serpspur.com/api/v1/keywords?keyword=seo+audit+tool&country=us&language=en&mode=full" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"
```

**Node.js (fetch)**
```javascript
const res = await fetch('https://serpspur.com/api/v1/keywords?keyword=seo+audit+tool&country=us&mode=sandbox', { headers: { 'Authorization': 'Bearer ss_live_sandbox_demo' } });
```

**Python (requests)**
```python
requests.get("https://serpspur.com/api/v1/keywords", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, params={"keyword": "seo audit tool", "country": "us", "depth": 3})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/keywords?keyword=seo+audit+tool&country=us&language=en&mode=full');
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
    "search_volume": 5400,
    "volume_trend_yoy": 38,
    "difficulty": 24,
    "opportunity_score": 86,
    "main_intent": "commercial",
    "cpc": 8.4,
    "backlinks_to_rank": { "avg_ref_domains": 18, "avg_dofollow": 118, "avg_domain_rank": 46 },
    "has_forum_weakness": true,
    "related_keywords": [ { "keyword": "seo audit tool free", "volume": 2900, "difficulty": 19, "is_golden": true } ]
  }
}
```

---

## `POST` `/api/v1/keywords/batch`

### Batch Keyword Intelligence (Up to 50 Vault / 10 Live)

- **Base URL:** `https://serpspur.com/api/v1/keywords/batch`
- **Credit Cost:** 18 Cr / Hit (0 Cr for Vault Misses)
- **Cache Policy:** 30-Day Vault (50 KWs) / Live (10 KWs)

Enriches up to 50 keywords in 1 call against the 30-day Keyword Vault (0 credits for misses) or up to 10 keywords live.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `keywords` | **Yes** | `array<string>` | `—` | Array or comma-separated list (max 50 in vault/sandbox, max 10 in live). |
| `country / language` | No | `ISO-2` | `"us" / "en"` | 2-letter ISO market & language. |
| `mode` | No | `enum` | `"vault"` | "vault", "live", or "sandbox" (0 Cr). |

#### Response Fields

**Batch Output Fields**

| Field | Type | Description |
| :--- | :--- | :--- |
| `requested_count / hits_count / misses_count / credits_deducted` | `integer` | Batch match totals and exact credits billed. |
| `results[keyword]` | `map<object>` | Keyed map containing search_volume, trend, difficulty, opportunity_score, cpc, main_intent, and backlinks_to_rank. |

#### Code Examples

**cURL**
```bash
curl -X POST "https://serpspur.com/api/v1/keywords/batch" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"keywords":["seo audit tool","broken link checker"],"country":"us","mode":"vault"}'
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/keywords/batch', { method: 'POST', headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY', 'Content-Type': 'application/json' }, body: JSON.stringify({ keywords: ['seo audit tool'], mode: 'vault' }) });
```

**Python (requests)**
```python
requests.post("https://serpspur.com/api/v1/keywords/batch", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, json={"keywords": ["seo audit tool"], "mode": "vault"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/keywords/batch');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS     => '{"keywords":["seo audit tool","broken link checker"],"country":"us","mode":"vault"}',
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
  "data": { "requested_count": 2, "hits_count": 2, "misses_count": 0, "credits_deducted": 36, "results": {} }
}
```

---

## `GET` `/api/v1/keywords/golden`

### Community Golden Gems Feed (Low-KD High-Volume Keywords)

- **Base URL:** `https://serpspur.com/api/v1/keywords/golden`
- **Credit Cost:** 5 Credits / Call
- **Cache Policy:** Daily / Weekly Curated Feed

Returns trending high-opportunity, low-difficulty Golden Keywords discovered across the SERPSpur ecosystem over the last day or week.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `period` | No | `enum` | `"weekly"` | "daily" or "weekly". |
| `limit` | No | `integer` | `25` | Max gems returned (up to 50). |

#### Response Fields

**Golden Gem Row Fields**

| Field | Type | Description |
| :--- | :--- | :--- |
| `keyword / country / volume / difficulty / cpc / trend / badge_label` | `mixed` | Pre-filtered low-competition keywords ready for content ideation pipelines. |

#### Code Examples

**cURL**
```bash
curl -X GET "https://serpspur.com/api/v1/keywords/golden?period=weekly&limit=25" -H "Authorization: Bearer ss_live_YOUR_API_KEY"
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/keywords/golden?period=weekly', { headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY' } });
```

**Python (requests)**
```python
requests.get("https://serpspur.com/api/v1/keywords/golden", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, params={"period": "weekly"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/keywords/golden?period=weekly&limit=25');
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
  "data": { "period": "weekly", "gems": [ { "keyword": "ai search rank tracker", "volume": 3600, "difficulty": 19, "cpc": 6.4 } ] }
}
```

---

← [Back to SERPSpur API Overview](../README.md) · [Interactive Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/) · [OpenAPI 3.1 Spec](../openapi.yaml)
