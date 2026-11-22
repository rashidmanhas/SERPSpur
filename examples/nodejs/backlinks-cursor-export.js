/**
 * SERPSpur Bulk Backlinks Unlimited Cursor Streamer (Node.js 18+)
 *
 * Demonstrates agency-grade cursor pagination using GET /api/v1/backlinks:
 * - Page 1 returns authority_summary + first batch of filtered links
 * - Page 2+ passes pagination.next_cursor so the gateway automatically skips
 *   authority_summary and bills the lower cursor rate with no 10,000-row cap.
 *
 * Usage:
 *   SERPSPUR_API_KEY="ss_live_YOUR_KEY" node examples/nodejs/backlinks-cursor-export.js serpspur.com 3
 */

const BASE_URL = 'https://serpspur.com/api/v1';
const API_KEY = process.env.SERPSPUR_API_KEY || 'ss_live_sandbox_demo';
const MODE = process.env.SERPSPUR_MODE || (API_KEY === 'ss_live_sandbox_demo' ? 'sandbox' : 'auto');
const DOMAIN = process.argv[2] || 'serpspur.com';
const MAX_PAGES = Number(process.argv[3] || 3);

async function streamBacklinks() {
  let cursor = null;
  let totalLinks = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(`${BASE_URL}/backlinks`);
    url.searchParams.set('domain', DOMAIN);
    url.searchParams.set('include_links', '1');
    url.searchParams.set('limit', '100');
    url.searchParams.set('link_mode', 'one_per_domain');
    url.searchParams.set('dofollow_only', '1');
    url.searchParams.set('min_rank', '30');
    url.searchParams.set('mode', MODE);
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
      },
    });
    const payload = await res.json();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(payload)}`);
    }

    const rows = payload.data?.top_backlinks || [];
    totalLinks += rows.length;

    console.log(
      `Page ${page}: returned=${rows.length}, total=${totalLinks}, ` +
      `credits=${res.headers.get('X-SerpSpur-Credits-Deducted')}, ` +
      `cache=${res.headers.get('X-SerpSpur-Cache')}`
    );

    cursor = payload.data?.pagination?.next_cursor || null;
    if (!payload.data?.pagination?.has_more || !cursor) {
      console.log('Reached end of filtered backlink stream.');
      break;
    }
  }
}

streamBacklinks().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
