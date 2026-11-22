# Bulk Backlink Intelligence, Cursor Export & Competitor Gap API

> **Link Intelligence & Agency Exports** · `LIVE | Agency Pro` · Live Interactive Docs: [serpspur.com/api-docs/backlinks-api/](https://serpspur.com/api-docs/backlinks-api/)

Built for link-building agencies, domain marketplaces, and SEO SaaS platforms working with sites carrying millions of backlinks. Pull full authority summaries, filter by 11 zero-surcharge criteria (CMS platform, backlink type, live/lost, min DR, max spam score, TLD, anchor, semantic HTML location), stream unlimited pages via cursor pagination, run competitor backlink gap intersections, or stream RFC-4180 CSV directly.

## Key Capabilities

- Agency Cursor Pagination: Stream millions of links (1,000/page) — Page 2+ skips summary at 80 Cr / 1,000 links
- 11 Zero-Surcharge Filters: CMS/platform, link type, live/lost, dofollow, min_rank, max_spam_score, TLD, anchor & more
- Fair Zero-Link Auto-Downgrade: If a domain has 0 matching backlinks, automatically bills Summary rate (30 Cr) instead of Links rate
- Direct CSV Streaming: Append ?format=csv to download filtered backlink rows cleanly

> **Architecture & Billing Note:** Page 1 with include_links=1 bills 60 Cr base + 5 Cr per 100 actually returned links (65 Cr for 100 links; 110 Cr for 1,000 links). Pass pagination.next_cursor into cursor= on Page 2+ to skip the authority summary automatically and pay only 30 Cr base + 5 Cr / 100 returned (80 Cr per 1,000 links) with zero 10,000-row cap!

## Endpoints Summary

| Method | Endpoint | Credit Cost | Caching |
| :--- | :--- | :--- | :--- |
| `GET` | [`/api/v1/backlinks`](#get-apiv1backlinks) | Vault: 8 Cr · Summary: 30 Cr · P1 1K: 110 Cr · P2+ Cursor 1K: 80 Cr | 30-Day Vault (Unfiltered) / Live Filtered |
| `POST` | [`/api/v1/backlinks/gap`](#post-apiv1backlinksgap) | 30 Credits / Analysis | Live Intersection |
| `POST` | [`/api/v1/backlinks/batch`](#post-apiv1backlinksbatch) | 8 Cr / Vault Hit (0 Cr for Misses) | 30-Day Vault Only |

---

## `GET` `/api/v1/backlinks`

### Domain Authority Summary & Agency-Filtered Backlink Stream

- **Base URL:** `https://serpspur.com/api/v1/backlinks`
- **Credit Cost:** Vault: 8 Cr | Summary: 30 Cr | P1 1K: 110 Cr | P2+ Cursor 1K: 80 Cr
- **Cache Policy:** 30-Day Vault (Unfiltered) / Live Filtered

Retrieves normalized 0–100 Domain Rank, referring domains, dofollow ratio, spam score, CMS/TLD/country/semantic distributions, and up to 1,000 granular backlink rows per request with unlimited cursor pagination and optional CSV streaming.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `domain` | **Yes** | `string` | `—` | Target root domain (e.g. ahrefs.com). |
| `include_links` | No | `0 \| 1` | `0` | 0 = Authority Summary & distributions only (30 Cr). 1 = Include granular top_backlinks[] rows. |
| `limit` | No | `integer` | `50` | Backlinks per page (10 to 1,000). Usage-billed per 100 actually returned rows. |
| `cursor` | No | `string` | `null` | Opaque pagination.next_cursor token from prior response for unlimited Page 2+ streaming (skips Summary automatically). |
| `offset / links_only` | No | `int / 0\|1` | `0 / 0` | Integer offset up to 10,000 (use cursor past 10K). links_only=1 skips Summary on Page 1. |
| `link_mode` | No | `enum` | `"as_is"` | "as_is" (all links), "one_per_domain" (1 best link per referring domain), or "one_per_anchor". |
| `dofollow_only` | No | `0 \| 1` | `0` | Set 1 to return only dofollow backlinks. |
| `platform_type / cms` | No | `string` | `null` | Filter by referring site CMS/platform: cms, blogs, ecommerce, news, wikis, forums, message-boards, organization, etc. |
| `backlink_type` | No | `enum` | `null` | Filter by HTML link element: anchor, image, link, redirect, canonical, meta, alternate. |
| `status` | No | `enum` | `"live"` | Link lifecycle filter: "live", "lost", or "all". |
| `min_rank / max_spam_score` | No | `int (0–100)` | `0 / null` | Minimum referring domain rank (0–100) and maximum allowed backlink spam score (0–100). |
| `tld / anchor / semantic_location` | No | `string / enum` | `null` | Filter by TLD (e.g. edu, gov, co.uk), anchor substring, or HTML placement (article, main, section, header, footer, aside, nav, details). |
| `broken_only / exclude_broken / new_only` | No | `0 \| 1` | `0` | Boolean quality filters for broken-link prospecting or freshly acquired links. |
| `sort_by` | No | `enum` | `"rank_desc"` | Sort order: "rank_desc", "page_rank_desc", "first_seen_desc", or "spam_asc". |
| `format / mode` | No | `enum` | `"json" / "auto"` | format="json"\|"csv" (RFC-4180 stream). mode="sandbox"\|"vault"\|"live"\|"auto". |

#### Response Fields

**authority_summary & distributions (17 Domain-Level Metrics)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `authority_summary.{domain_rank, spam_score}` | `integer (0–100)` | Normalized 0–100 Domain Rank and backlink profile spam score. |
| `authority_summary.{referring_domains, referring_main_domains, referring_pages}` | `integer` | Unique referring domains, root main domains, and unique linking pages. |
| `authority_summary.{total_backlinks, dofollow_backlinks, nofollow_backlinks, dofollow_ratio_pct, broken_backlinks}` | `number` | Full link counts, dofollow percentage, and broken backlink count. |
| `authority_summary.{referring_ips, referring_subnets}` | `integer` | IP & Class-C subnet diversity for PBN/footprint detection. |
| `distributions.{link_types, top_tlds, top_platforms, semantic_locations, top_countries}` | `object` | Frequency maps across link element types, TLDs, CMS platforms, HTML placement, and geo countries. |

**top_backlinks[] Row Dictionary (19 Data Points Per Link & CSV Column)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `referring_domain / referring_page_url / target_url` | `string` | Source domain, exact linking URL, and destination URL on target. |
| `anchor_text / page_title` | `string` | Anchor or image alt text and referring page HTML title. |
| `domain_rank / page_rank / spam_score` | `integer (0–100)` | Normalized referring domain rank, page rank, and spam score. |
| `is_dofollow / link_type / item_type` | `bool / string` | Dofollow flag, link attribute (dofollow/nofollow/ugc/sponsored), and HTML item_type (anchor/image/redirect). |
| `semantic_location / platform_type / tld / country` | `string\|null` | HTML placement (article/header/footer), CMS/platform list, TLD, and ISO-2 country. |
| `is_broken / is_lost / is_new / first_seen` | `bool / date` | Broken/lost/new flags and first_seen date (YYYY-MM-DD). |

**pagination, cross_intelligence & billing**

| Field | Type | Description |
| :--- | :--- | :--- |
| `pagination.{limit, offset, returned_count, total_available, has_more, next_cursor, filters}` | `object` | Cursor token for Page 2+, total matching links, and echoed active filters. |
| `cross_intelligence.{tai_score, organic_traffic, geo_visibility_score}` | `object` | Zero-cost cross-vault signals when available. |
| `billing.{credits_deducted, links_returned, summary_skipped, downgraded_zero_links, pricing_formula}` | `object` | Transparent per-100 credit calculation and zero-link downgrade indicator. |

#### Code Examples

**cURL**
```bash
# Page 1: High-Authority Editorial Blog Dofollow Links (Up to 1,000)
curl -X GET "https://serpspur.com/api/v1/backlinks?domain=serpspur.com&include_links=1&limit=1000&link_mode=one_per_domain&dofollow_only=1&platform_type=blogs&min_rank=40" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"

# Page 2+: Stream Millions Using next_cursor (Skips Summary -> 80 Cr / 1,000)
curl -X GET "https://serpspur.com/api/v1/backlinks?domain=serpspur.com&cursor=NEXT_CURSOR_TOKEN&limit=1000&format=csv" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" -o backlinks-page2.csv
```

**Node.js (fetch)**
```javascript
const res = await fetch('https://serpspur.com/api/v1/backlinks?domain=serpspur.com&include_links=1&limit=100&platform_type=cms&dofollow_only=1&mode=sandbox', {
  headers: { 'Authorization': 'Bearer ss_live_sandbox_demo' }
});
const { data } = await res.json();
console.log('DR:', data.authority_summary.domain_rank, 'Next Cursor:', data.pagination.next_cursor);
```

**Python (requests)**
```python
import requests
r = requests.get(
    "https://serpspur.com/api/v1/backlinks",
    headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"},
    params={"domain": "serpspur.com", "include_links": 1, "limit": 1000, "dofollow_only": 1, "platform_type": "blogs"}
)
print(r.json()["data"]["pagination"]["next_cursor"])
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/backlinks?domain=serpspur.com&include_links=1&limit=1000&link_mode=one_per_domain&dofollow_only=1&platform_type=blogs&min_rank=40');
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
    "authority_summary": { "domain_rank": 64, "referring_domains": 1820, "total_backlinks": 28400, "dofollow_ratio_pct": 74.2, "spam_score": 3 },
    "top_backlinks": [ { "referring_domain": "techcrunch.com", "domain_rank": 92, "is_dofollow": true, "platform_type": "cms,blogs", "first_seen": "2026-03-14" } ],
    "pagination": { "returned_count": 100, "total_available": 28400, "has_more": true, "next_cursor": "eyJzZWFyY2hfYWZ0ZXIiOi..." }
  },
  "billing": { "credits_deducted": 65, "links_returned": 100, "summary_skipped": false, "downgraded_zero_links": false }
}
```

**CSV / Spec Output**
```csv
referring_domain,referring_page_url,target_url,anchor_text,page_title,domain_rank,page_rank,is_dofollow,link_type,item_type,semantic_location,spam_score,platform_type,tld,country,is_broken,is_lost,is_new,first_seen
techcrunch.com,https://techcrunch.com/seo-analytics-platforms-2026/,https://serpspur.com/,"serpspur.com traffic & SEO intelligence",,92,68,true,dofollow,anchor,,2,"cms,blogs",,,false,false,false,2026-03-14
```

---

## `POST` `/api/v1/backlinks/gap`

### Competitor Backlink Gap Intersection (1–4 Competitors)

- **Base URL:** `https://serpspur.com/api/v1/backlinks/gap`
- **Credit Cost:** 30 Credits / Analysis
- **Cache Policy:** Live Intersection

Finds high-authority referring domains linking to your competitors that do NOT yet link to your target domain — ranked by authority for immediate outreach prospecting.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `target` | **Yes** | `string` | `—` | Your domain to exclude from results (e.g. serpspur.com). |
| `competitors` | **Yes** | `array<string>` | `—` | 1 to 4 competitor domains to intersect (e.g. ["ahrefs.com","semrush.com"]). |
| `intersection` | No | `enum` | `"all"` | "all" (sites linking to ALL listed competitors) or "partial" (linking to any competitor). |
| `limit` | No | `integer` | `50` | Max prospect domains returned (1–100). |
| `mode` | No | `enum` | `"live"` | "live" or "sandbox" (0 Cr). |

#### Response Fields

**gap_opportunities[] Fields**

| Field | Type | Description |
| :--- | :--- | :--- |
| `domain / domain_rank` | `string / int` | Prospect referring domain and 0–100 Domain Rank. |
| `competitors_linked_count / competitor_links` | `int / object` | How many competitors each prospect links to and exact link counts per competitor. |

#### Code Examples

**cURL**
```bash
curl -X POST "https://serpspur.com/api/v1/backlinks/gap" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"target":"serpspur.com","competitors":["ahrefs.com","semrush.com"],"intersection":"all","limit":50}'
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/backlinks/gap', { method: 'POST', headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY', 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'serpspur.com', competitors: ['ahrefs.com','semrush.com'] }) });
```

**Python (requests)**
```python
requests.post("https://serpspur.com/api/v1/backlinks/gap", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, json={"target": "serpspur.com", "competitors": ["ahrefs.com", "semrush.com"]})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/backlinks/gap');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS     => '{"target":"serpspur.com","competitors":["ahrefs.com","semrush.com"],"intersection":"all","limit":50}',
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
  "data": { "target": "serpspur.com", "competitors": ["ahrefs.com","semrush.com"], "total_opportunities": 42, "gap_opportunities": [ { "domain": "searchenginejournal.com", "domain_rank": 89, "competitors_linked_count": 2 } ] },
  "billing": { "credits_deducted": 30 }
}
```

---

## `POST` `/api/v1/backlinks/batch`

### Batch Backlinks Vault Lookup (Up to 50 Domains)

- **Base URL:** `https://serpspur.com/api/v1/backlinks/batch`
- **Credit Cost:** 8 Cr / Vault Hit (0 Cr for Misses)
- **Cache Policy:** 30-Day Vault Only

Screens up to 50 domains in one call against the 30-day Backlinks Vault for authority summaries. Only cache hits are billed (8 Cr/hit).

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `domains` | **Yes** | `array<string>` | `—` | 1 to 50 root domains. |
| `mode` | No | `enum` | `"vault"` | "vault" or "sandbox" (0 Cr). |

#### Response Fields

**Batch Vault Response Fields**

| Field | Type | Description |
| :--- | :--- | :--- |
| `data.hits[] / data.misses[]` | `array` | Matched authority payloads and list of uncached domains (0 Cr). |

#### Code Examples

**cURL**
```bash
curl -X POST "https://serpspur.com/api/v1/backlinks/batch" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domains":["serpspur.com","ahrefs.com"],"mode":"vault"}'
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/backlinks/batch', { method: 'POST', headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY', 'Content-Type': 'application/json' }, body: JSON.stringify({ domains: ['serpspur.com','ahrefs.com'], mode: 'vault' }) });
```

**Python (requests)**
```python
requests.post("https://serpspur.com/api/v1/backlinks/batch", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, json={"domains": ["serpspur.com", "ahrefs.com"], "mode": "vault"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/backlinks/batch');
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
  "billing": { "credits_deducted": 8 }
}
```

---

← [Back to SERPSpur API Overview](../README.md) · [Interactive Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/) · [OpenAPI 3.1 Spec](../openapi.yaml)
