# SerpSpur Developer API & SDK Kit

Official documentation, Postman collections, and code examples for the **SerpSpur Universal Developer API**.

## Overview
SerpSpur provides programmatic access to:
- **Keyword Research Pro:** Search volume, YoY trend, 3M QoQ momentum, seasonality peaks, search intent, and the exact **Referring Domains & Dofollow Backlinks needed to rank in Google's Top 10**.
- **TAI™ Traffic Authenticity Index:** Behavioral botnet detection, ad-fraud risk scoring, and verified human traffic valuation.
- **Batch Processing:** High-speed multi-keyword and multi-domain lookups with 0 credits charged on cache misses.

---

## Authentication

All requests require a valid SerpSpur API Key (`ss_live_...`), obtainable in your [SerpSpur Developer Portal](https://serpspur.com/api-docs/).

You can authenticate using any of three methods:

### 1. Custom Header (Recommended)
```bash
curl -X GET "[https://serpspur.com/api/v1/keywords?keyword=seo+tool](https://serpspur.com/api/v1/keywords?keyword=seo+tool)" \
  -H "X-API-Key: ss_live_YOUR_API_KEY"

2. Bearer Token
curl -X GET "[https://serpspur.com/api/v1/keywords?keyword=seo+tool](https://serpspur.com/api/v1/keywords?keyword=seo+tool)" \
  -H "Authorization: Bearer ss_live_YOUR_API_KEY"
3. HTTP Basic Auth
curl -X GET "[https://serpspur.com/api/v1/keywords?keyword=seo+tool](https://serpspur.com/api/v1/keywords?keyword=seo+tool)" \
  -u "developer@yourcompany.com:ss_live_YOUR_API_KEY"
