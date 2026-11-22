/**
 * SERPSpur Universal SEO & AI Intelligence API (v3.0) — Node.js 18+ Quickstart
 *
 * Zero external dependencies (uses native global fetch).
 * Defaults to free 0-credit sandbox mode so you can run it immediately:
 *   node examples/nodejs/quickstart.js
 *
 * For live production calls:
 *   SERPSPUR_API_KEY="ss_live_YOUR_KEY" SERPSPUR_MODE="auto" node examples/nodejs/quickstart.js
 */

const BASE_URL = 'https://serpspur.com/api/v1';
const API_KEY = process.env.SERPSPUR_API_KEY || 'ss_live_sandbox_demo';
const MODE = process.env.SERPSPUR_MODE || 'sandbox';

async function apiRequest(path, { method = 'GET', params = null, body = null } = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    Accept: 'application/json',
  };
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const telemetry = {
    status: res.status,
    cache: res.headers.get('X-SerpSpur-Cache'),
    creditsDeducted: res.headers.get('X-SerpSpur-Credits-Deducted'),
    creditsRemaining: res.headers.get('X-SerpSpur-Credits-Remaining'),
    rateLimitRemaining: res.headers.get('X-RateLimit-Remaining'),
  };

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(payload)}`);
  }
  return { payload, telemetry };
}

async function main() {
  console.log(`Running SERPSpur API v3.0 Quickstart (mode=${MODE})\n`);

  // 1. Keyword Research (Volume, KD, Momentum & Top-10 Backlinks Needed)
  const kw = await apiRequest('/keywords', {
    params: { keyword: 'seo audit tool', country: 'us', language: 'en', depth: 3, mode: MODE },
  });
  console.log('1) Keyword Intelligence:', {
    keyword: kw.payload.data?.keyword,
    searchVolume: kw.payload.data?.search_volume,
    difficulty: kw.payload.data?.difficulty,
    telemetry: kw.telemetry,
  });

  // 2. 7-Engine Parallel SERP & Rank Tracking
  const serp = await apiRequest('/serp/multi', {
    method: 'POST',
    body: {
      keyword: 'seo audit tool',
      domain: 'serpspur.com',
      engines: ['google', 'bing', 'youtube'],
      mode: MODE,
    },
  });
  console.log('2) 7-Engine SERP:', {
    enginesReturned: Object.keys(serp.payload.data?.engines || {}),
    telemetry: serp.telemetry,
  });

  // 3. Headless Chrome Site Audit + Core Web Vitals + AI Crawler Readiness
  const audit = await apiRequest('/audit', {
    params: { url: 'https://serpspur.com/', device: 'desktop', detail: 'full', mode: MODE },
  });
  console.log('3) Site Audit:', {
    healthScore: audit.payload.data?.health_score,
    grade: audit.payload.data?.grade,
    aiReadiness: audit.payload.data?.ai_crawler_readiness?.ai_readiness_score,
    telemetry: audit.telemetry,
  });

  // 4. AI Mentions (GEO) — ChatGPT + Google AI Overviews
  const geo = await apiRequest('/ai-mentions', {
    params: { domain: 'serpspur.com', engine: 'both', location: 'United States', mode: MODE },
  });
  console.log('4) AI Mentions (GEO):', {
    geoScore: geo.payload.data?.geo_visibility_score,
    totalMentions: geo.payload.data?.total_mentions,
    telemetry: geo.telemetry,
  });

  // 5. Domain Explorer — Global Traffic & Top Countries
  const dom = await apiRequest('/domain', {
    params: { domain: 'ahrefs.com', top_countries: 5, mode: MODE },
  });
  console.log('5) Domain Explorer:', {
    organicTraffic: dom.payload.data?.global_summary?.organic_traffic,
    countriesRanking: dom.payload.data?.global_summary?.countries_ranking,
    telemetry: dom.telemetry,
  });

  // 6. TAI™ Traffic Authenticity Forensics
  const tai = await apiRequest('/tai', {
    params: { domain: 'serpspur.com', mode: MODE },
  });
  console.log('6) TAI™ Forensics:', {
    taiScore: tai.payload.data?.tai_score,
    grade: tai.payload.data?.grade,
    verdict: tai.payload.data?.verdict,
    telemetry: tai.telemetry,
  });
}

main().catch((err) => {
  console.error('SERPSpur API Error:', err.message);
  process.exit(1);
});
