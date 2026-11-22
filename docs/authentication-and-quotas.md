# Authentication, Rate Limits, Headers & Error Taxonomy

> **Core Gateway Standards** · `v3.0 Reference` · Live Interactive Docs: [serpspur.com/api-docs/reference/](https://serpspur.com/api-docs/reference/)

All 7 SERPSpur REST APIs share one unified gateway at https://serpspur.com/api/v1. Authenticate using Bearer Token, X-API-Key, or HTTP Basic Auth (your account email + ss_live_ API key). Every error response (4xx/5xx) and every sandbox call charges strictly 0 credits.

## Key Capabilities

- Dual Auth: Bearer Token, X-API-Key header, or HTTP Basic Auth (Email + ss_live_ Key)
- 0-Credit Sandbox: Pass mode=sandbox with Bearer ss_live_sandbox_demo to test integrations free
- Tier-Scaled Quotas: Up to 300 req/min, 15 req/sec burst, and 12 simultaneous live upstream scans
- Proactive Outage Protection: X-SerpSpur-Low-Balance headers + 24h email & HTTPS webhook alerts

> **Architecture & Billing Note:** Rate limits scale automatically with your highest active tier — whether from a SaaS plan (Free/Pro/Agency) or a stackable Monthly Developer API Credit Subscription (Starter 60 RPM, Scale 120 RPM, Enterprise 300 RPM). Cached Vault lookups, Batch Vault calls, Sandbox requests, and Crawl polling never consume your concurrent live-scan slots.

## Endpoints Summary

| Method | Endpoint | Credit Cost | Caching |
| :--- | :--- | :--- | :--- |
| `GET` | [`/api/v1/account`](#get-apiv1account) | 0 Credits (Free) | Live account state |
| `GET` | [`/api/v1/openapi.json`](#get-apiv1openapijson) | 0 Credits (Public Spec) | 1-Hour HTTP Cache |

---

## `GET` `/api/v1/account`

### Inspect Wallet Balance, Active API Subscription & Effective Quotas

- **Base URL:** `https://serpspur.com/api/v1/account`
- **Credit Cost:** 0 Credits (Free)
- **Cache Policy:** Live account state

Returns your real-time rollover credit balance, SaaS plan tier, stackable Monthly Developer API Subscription status, effective RPM/burst/live-concurrency ceilings, low-balance alert configuration, and active API key telemetry. Call this before launching large batch or 100-page crawl jobs.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `Authorization` | **Yes** | `header` | `—` | Bearer ss_live_YOUR_KEY — OR HTTP Basic Auth base64(email:ss_live_YOUR_KEY). Alternatively pass X-API-Key: ss_live_YOUR_KEY. |

#### Response Fields

**account (Wallet, Subscription & Live Rate Quotas — 9 fields)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `account.user_id` | `integer` | Internal SERPSpur account identifier. |
| `account.api_login` | `string` | Registered account email used as the username in HTTP Basic Auth. |
| `account.plan_tier` | `enum` | Underlying SaaS workspace tier: "free", "pro", or "agency". |
| `account.credit_balance` | `integer` | Current unified wallet balance in credits. Unused credits roll over forever. |
| `account.rate_limit_rpm` | `integer` | Effective requests per minute: max(SaaS RPM, active API Subscription RPM). Ranges from 30 up to 300 req/min. |
| `account.rate_limit_burst` | `integer` | Tier-scaled per-second burst ceiling: 5/s (Free), 8/s (Starter/Pro), 10/s (Scale/Agency), 15/s (Enterprise). |
| `account.concurrent_live_limit` | `integer` | Max simultaneous blocking live upstream calls per user (6 Free, 8 Pro/Starter, 10 Agency/Scale, 12 Enterprise). Vault, Batch & Polling are unaffected. |
| `account.api_subscription.{active, tier, name, monthly_credits, rate_limit_rpm, quantity}` | `object` | Active stackable Monthly Developer API Subscription details (Starter 25K, Scale 70K, Enterprise 200K × quantity). |
| `account.low_balance_alert.{enabled, threshold, webhook_configured}` | `object` | Current pipeline outage alert state configured in your Developer Portal. |

**account.key_info (Per-Key Scopes & Daily Cap Telemetry — 5 fields)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `key_info.name` | `string` | Human-readable label assigned when creating this ss_live_ key. |
| `key_info.scopes[]` | `array<string>` | Permitted API scopes: ["all"] or subset of ["tai","keywords","ai_mentions","domain","backlinks","rank_tracker","site_audit"]. |
| `key_info.daily_credit_limit` | `integer` | Per-key daily credit spend guardrail (0 = unlimited). |
| `key_info.credits_used_today` | `integer` | Credits spent by this specific key since 00:00 server time. |
| `key_info.requests_today` | `integer` | Total API requests executed by this key today. |

**Standard Response Headers (Returned on Every /api/v1/* Call)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `X-RateLimit-Limit / Remaining / Reset` | `header` | Minute-window RPM ceiling, remaining calls in current minute, and UTC epoch reset timestamp. |
| `X-RateLimit-Burst-Limit` | `header` | Effective per-second burst limit (5–15 req/sec depending on tier). |
| `X-RateLimit-Concurrent-Live-Limit` | `header` | Effective simultaneous live upstream call limit for your tier (6–12). |
| `X-SerpSpur-Credits-Deducted / Credits-Remaining` | `header` | Exact credits charged for this request and updated remaining wallet balance. |
| `X-SerpSpur-Cache` | `header` | Cache state: "HIT" (Vault), "MISS" (Live), "CURSOR" (Page 2+ stream), "ASYNC" (Crawl queued), "POLL", or "SANDBOX". |
| `X-SerpSpur-Low-Balance / Low-Balance-Threshold` | `header` | Present ("true") whenever remaining balance drops at or below your alert threshold. |
| `Retry-After` | `header` | Seconds to wait before retrying on HTTP 429 rate, burst, or live-concurrency limits. |

**HTTP Error Codes Taxonomy (Strictly 0 Credits Charged on All Errors)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `invalid_*` | Missing/malformed domain, keyword, URL, filter value, or SSRF-blocked private/loopback host. |
| `401 Unauthorized` | `missing_credentials / invalid_api_key` | Missing auth header, invalid ss_live_ prefix, revoked key, or Basic Auth email mismatch. |
| `402 Payment Required` | `insufficient_credits` | Wallet balance is lower than required cost. Top up via /pricing/?tab=api. |
| `403 Forbidden` | `insufficient_scope / ip_not_whitelisted / key_paused` | Key lacks required API scope, caller IP is outside CIDR whitelist, or key is paused. |
| `404 Not Found` | `not_in_vault / crawl_not_found` | Target absent from cache during mode=vault (0 Cr charged) or unknown crawl job_id. |
| `409 Conflict` | `crawl_not_completed` | Requested ?format=csv on an async crawl that is still queued or running. |
| `422 Unprocessable Entity` | `analysis_failed / crawl_start_failed` | Target site unreachable or blocked during live scan (0 Cr charged). |
| `429 Too Many Requests` | `rate_limit_exceeded / burst_limit_exceeded / too_many_concurrent_live_requests / key_daily_cap_reached` | Minute RPM, per-second burst, simultaneous live-scan semaphore, or per-key daily spend cap hit. |
| `503 / 504 Service Busy / Timeout` | `api_maintenance / crawl_queue_busy / upstream_timeout` | Temporary maintenance, crawl queue busy, or upstream timeout (always 0 Cr charged). |

#### Code Examples

**cURL**
```bash
# Option 1: Bearer Token (Recommended)
curl -X GET "https://serpspur.com/api/v1/account" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Accept: application/json"

# Option 2: X-API-Key Header
curl -X GET "https://serpspur.com/api/v1/account" \
  -H "X-API-Key: ss_live_YOUR_API_KEY"

# Option 3: HTTP Basic Auth (Email + Key)
curl -u "developer@company.com:ss_live_YOUR_API_KEY" \
  "https://serpspur.com/api/v1/account"
```

**Node.js (fetch)**
```javascript
const res = await fetch('https://serpspur.com/api/v1/account', {
  headers: {
    'Authorization': 'Bearer ss_live_YOUR_API_KEY',
    'Accept': 'application/json'
  }
});
const data = await res.json();
console.log('Balance:', data.account.credit_balance, 'RPM:', data.account.rate_limit_rpm);
```

**Python (requests)**
```python
import requests

res = requests.get(
    "https://serpspur.com/api/v1/account",
    headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}
)
print(res.json())
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/account');
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
  "account": {
    "user_id": 1042,
    "api_login": "dev@agency.com",
    "plan_tier": "agency",
    "credit_balance": 148200,
    "rate_limit_rpm": 300,
    "rate_limit_burst": 15,
    "concurrent_live_limit": 12,
    "api_subscription": {
      "active": true,
      "tier": "api_enterprise",
      "name": "API Enterprise",
      "monthly_credits": 200000,
      "rate_limit_rpm": 300,
      "quantity": 1
    },
    "low_balance_alert": {
      "enabled": true,
      "threshold": 5000,
      "webhook_configured": true
    },
    "key_info": {
      "name": "Production Pipeline",
      "scopes": ["all"],
      "daily_credit_limit": 0,
      "credits_used_today": 1420,
      "requests_today": 86
    }
  }
}
```

**Webhook Callback Payload**
```json
// Low-Balance Alert Webhook POST (throttled once per 24h)
{
  "event": "wallet.low_balance",
  "timestamp": "2026-11-22T07:15:00+00:00",
  "account_email": "dev@agency.com",
  "credit_balance": 840,
  "threshold": 1000,
  "top_up_url": "https://serpspur.com/pricing/?tab=api",
  "portal_url": "https://serpspur.com/api-docs/"
}
```

**CSV / Spec Output**
```csv
# Machine-Readable OpenAPI 3.1 Spec (Import directly into Postman, Insomnia, or AI IDEs)
curl -s "https://serpspur.com/api/v1/openapi.json" | jq .info
```

---

## `GET` `/api/v1/openapi.json`

### Download Auto-Generated OpenAPI 3.1 Specification

- **Base URL:** `https://serpspur.com/api/v1/openapi.json`
- **Credit Cost:** 0 Credits (Public Spec)
- **Cache Policy:** 1-Hour HTTP Cache

Public, unauthenticated OpenAPI 3.1 JSON document describing every SERPSpur REST API endpoint, parameter schema, authentication scheme, and server URL. Import directly into Postman, Insomnia, Swagger UI, or LLM coding assistants.

#### Response Fields

**OpenAPI 3.1 Top-Level Sections**

| Field | Type | Description |
| :--- | :--- | :--- |
| `openapi / info / servers` | `object` | OpenAPI 3.1.0 header, version metadata, and production gateway base URL. |
| `components.securitySchemes` | `object` | BearerAuth, ApiKeyAuth (X-API-Key), and BasicAuth definitions. |
| `paths` | `object` | Complete path & operation definitions synchronized automatically with this documentation hub. |

#### Code Examples

**cURL**
```bash
curl -X GET "https://serpspur.com/api/v1/openapi.json" -H "Accept: application/json"
```

**Node.js (fetch)**
```javascript
const spec = await fetch('https://serpspur.com/api/v1/openapi.json').then(r => r.json());
console.log(Object.keys(spec.paths));
```

**Python (requests)**
```python
import requests
spec = requests.get("https://serpspur.com/api/v1/openapi.json").json()
print(list(spec["paths"].keys()))
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/openapi.json');
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
  "openapi": "3.1.0",
  "info": {
    "title": "SERPSpur Universal SEO & AI Intelligence API",
    "version": "3.0.0"
  },
  "servers": [ { "url": "https://serpspur.com/api/v1" } ],
  "paths": { "/audit": {}, "/audit/crawl": {}, "/backlinks": {}, "/keywords": {}, "/serp": {}, "/ai-mentions": {}, "/domain": {}, "/tai": {}, "/account": {} }
}
```

---

← [Back to SERPSpur API Overview](../README.md) · [Interactive Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/) · [OpenAPI 3.1 Spec](../openapi.yaml)
