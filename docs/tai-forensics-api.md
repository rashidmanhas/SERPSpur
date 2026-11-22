# TAI™ Traffic Authenticity & Fake Traffic Detection API

> **Proprietary Fraud & Link-Vetting Intelligence** · `LIVE | Proprietary` · Live Interactive Docs: [serpspur.com/api-docs/tai-api/](https://serpspur.com/api-docs/tai-api/)

Protect link marketplaces, M&A buyers, and media agencies from domains with artificially inflated traffic charts. SERPSpur's proprietary 4-Pillar Traffic Authenticity Index (TAI™) evaluates Intent Authenticity, Referral Hygiene, Authority Equilibrium, and Routing Integrity to output a 0–100 trust score, verified human share %, valuation multiplier, boolean fraud signals, and a verifiable public certificate URL.

## Key Capabilities

- 4-Pillar Forensics: Intent Authenticity, Referral Hygiene, Authority Equilibrium & Routing Integrity
- Automated Valuation Multiplier: Instant 0.00–1.00 multiplier to discount inflated traffic claims
- 4 Boolean Risk Signals: Keyword manipulation, botnet referrers, payload cloaking & WAF challenge flags
- 90-Day Shared Vault (10 Cr) + 50-Domain Batch Vetting

> **Architecture & Billing Note:** Verified TAI™ certificates stay valid in the shared 90-day Vault (10 Cr per vault hit vs 50 Cr for a fresh deep behavioral scan).

## Endpoints Summary

| Method | Endpoint | Credit Cost | Caching |
| :--- | :--- | :--- | :--- |
| `GET` | [`/api/v1/tai`](#get-apiv1tai) | 90-Day Vault: 10 Cr · Live Deep Scan: 50 Cr | 90-Day TAI Vault |
| `POST` | [`/api/v1/tai/batch`](#post-apiv1taibatch) | 10 Cr / Vault Hit (0 Cr for Misses) | 90-Day TAI Vault |

---

## `GET` `/api/v1/tai`

### Single Domain TAI™ Traffic Authenticity Audit

- **Base URL:** `https://serpspur.com/api/v1/tai`
- **Credit Cost:** 90-Day Vault: 10 Cr | Live Deep Scan: 50 Cr
- **Cache Policy:** 90-Day TAI Vault

Computes or retrieves the 4-pillar TAI™ score (0–100), risk verdict, verified human vs phantom traffic percentages, fraud risk booleans, and verifiable certificate URL.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `domain` | **Yes** | `string` | `—` | Root domain to vet (e.g. ahrefs.com). |
| `mode` | No | `enum` | `"auto"` | "sandbox" (0 Cr), "vault" (90d cache; 404 = 0 Cr), "live", or "auto". |

#### Response Fields

**TAI™ Score, 4 Pillars, Multipliers & Risk Signals (21 Data Points)**

| Field | Type | Description |
| :--- | :--- | :--- |
| `tai_score / grade / verdict / risk_level` | `mixed` | 0–100 authenticity score, grade (A+ to F), human-readable verdict, and risk_level ("low", "medium", "critical"). |
| `pillars.{intent_authenticity, referral_hygiene, authority_equilibrium, routing_integrity}` | `object (0–100)` | Individual 0–100 scores across all 4 behavioral traffic forensic pillars. |
| `authenticity_multipliers.{verified_human_share_pct, phantom_inflation_pct, valuation_multiplier}` | `object` | Estimated genuine human traffic share %, fake inflation %, and 0.00–1.00 valuation multiplier. |
| `risk_signals.{intent_manipulation_detected, botnet_referrers_detected, payload_cloaking_detected, waf_challenge_active}` | `object<bool>` | Deterministic boolean fraud flags ideal for automated marketplace rejection rules. |
| `verification.{certificate_id, certificate_url, scan_mode, verified_at, cache_age_days}` | `object` | Signed public TAI™ certificate URL and audit timestamp. |

#### Code Examples

**cURL**
```bash
curl -X GET "https://serpspur.com/api/v1/tai?domain=serpspur.com&mode=auto" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/tai?domain=serpspur.com&mode=sandbox', { headers: { 'Authorization': 'Bearer ss_live_sandbox_demo' } });
```

**Python (requests)**
```python
requests.get("https://serpspur.com/api/v1/tai", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, params={"domain": "serpspur.com"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/tai?domain=serpspur.com&mode=auto');
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
    "tai_score": 94,
    "grade": "A+",
    "verdict": "Clean Network Signature",
    "risk_level": "low",
    "pillars": { "intent_authenticity": 95, "referral_hygiene": 92, "authority_equilibrium": 94, "routing_integrity": 96 },
    "authenticity_multipliers": { "verified_human_share_pct": 94, "phantom_inflation_pct": 6, "valuation_multiplier": 0.94 },
    "risk_signals": { "intent_manipulation_detected": false, "botnet_referrers_detected": false, "payload_cloaking_detected": false, "waf_challenge_active": false }
  },
  "billing": { "credits_deducted": 10 }
}
```

---

## `POST` `/api/v1/tai/batch`

### Batch TAI™ Vault Vetting (Up to 50 Domains)

- **Base URL:** `https://serpspur.com/api/v1/tai/batch`
- **Credit Cost:** 10 Cr / Vault Hit (0 Cr for Misses)
- **Cache Policy:** 90-Day TAI Vault

Vets up to 50 publisher domains in 1 request against the 90-day TAI™ Vault. Uncached domains return in misses[] at 0 credits.

#### Parameters

| Parameter | Required | Type | Default | Description |
| :--- | :---: | :--- | :--- | :--- |
| `domains` | **Yes** | `array<string>` | `—` | 1 to 50 domains to vet. |
| `mode` | No | `enum` | `"vault"` | "vault" or "sandbox" (0 Cr). |

#### Response Fields

**Batch Output Fields**

| Field | Type | Description |
| :--- | :--- | :--- |
| `data.hits[] / data.misses[]` | `array` | Verified TAI™ objects for cached hits and uncached domain list. |

#### Code Examples

**cURL**
```bash
curl -X POST "https://serpspur.com/api/v1/tai/batch" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domains":["serpspur.com","ahrefs.com"],"mode":"vault"}'
```

**Node.js (fetch)**
```javascript
fetch('https://serpspur.com/api/v1/tai/batch', { method: 'POST', headers: { 'Authorization': 'Bearer ss_live_YOUR_API_KEY', 'Content-Type': 'application/json' }, body: JSON.stringify({ domains: ['serpspur.com'], mode: 'vault' }) });
```

**Python (requests)**
```python
requests.post("https://serpspur.com/api/v1/tai/batch", headers={"Authorization": "Bearer ss_live_YOUR_API_KEY"}, json={"domains": ["serpspur.com"], "mode": "vault"})
```

**PHP (cURL)**
```php
<?php
$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_YOUR_API_KEY';
$ch = curl_init('https://serpspur.com/api/v1/tai/batch');
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
  "billing": { "credits_deducted": 10 }
}
```

---

← [Back to SERPSpur API Overview](../README.md) · [Interactive Cost Calculator](https://serpspur.com/api-docs/pricing-calculator/) · [OpenAPI 3.1 Spec](../openapi.yaml)
