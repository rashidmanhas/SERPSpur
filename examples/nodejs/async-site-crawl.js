/**
 * SERPSpur Async Multi-Page Site Crawl & CSV Exporter (Node.js 18+)
 *
 * Dispatches a non-blocking 5–100 page Headless Chrome site crawl, polls until
 * completion at 0 credits (respecting Retry-After on HTTP 429), logs automatic
 * unused-page credit refunds, and downloads the full RFC-4180 CSV report.
 *
 * Usage:
 *   SERPSPUR_API_KEY="ss_live_YOUR_KEY" node examples/nodejs/async-site-crawl.js https://example.com 50
 */

import fs from 'node:fs/promises';

const BASE_URL = 'https://serpspur.com/api/v1';
const API_KEY = process.env.SERPSPUR_API_KEY || 'ss_live_sandbox_demo';
const MODE = process.env.SERPSPUR_MODE || (API_KEY === 'ss_live_sandbox_demo' ? 'sandbox' : 'live');
const TARGET_URL = process.argv[2] || 'https://serpspur.com/';
const MAX_PAGES = Number(process.argv[3] || 25);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithBackoff(url, options = {}) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        ...(options.headers || {}),
      },
    });
    if (res.status === 429) {
      const retrySec = Number(res.headers.get('Retry-After') || 5);
      console.log(`Rate limited (429). Retrying in ${retrySec}s...`);
      await sleep(retrySec * 1000);
      continue;
    }
    return res;
  }
  throw new Error('Max retries reached after HTTP 429 rate limiting.');
}

async function runCrawl() {
  console.log(`1) Dispatching ${MAX_PAGES}-page crawl for ${TARGET_URL} (mode=${MODE})...`);
  const startRes = await fetchWithBackoff(`${BASE_URL}/audit/crawl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      url: TARGET_URL,
      max_pages: MAX_PAGES,
      device: 'desktop',
      mode: MODE,
    }),
  });

  const startPayload = await startRes.json();
  if (!startRes.ok) {
    throw new Error(`Crawl dispatch failed (${startRes.status}): ${JSON.stringify(startPayload)}`);
  }

  const { job_id: jobId, credits_reserved: reserved } = startPayload.data;
  console.log(`   Job queued: ${jobId} (credits reserved: ${reserved})`);

  // 2. Poll until completed or failed (0 credits per poll)
  let statusPayload;
  while (true) {
    const pollRes = await fetchWithBackoff(`${BASE_URL}/audit/crawl/${encodeURIComponent(jobId)}?page=1&per_page=25`, {
      headers: { Accept: 'application/json' },
    });
    statusPayload = await pollRes.json();
    const state = statusPayload.data?.status;
    const crawled = statusPayload.data?.summary?.pages_crawled ?? 0;
    console.log(`   Status: ${state} | Pages crawled: ${crawled}`);

    if (state === 'completed') break;
    if (state === 'failed') {
      throw new Error(`Crawl job failed: ${JSON.stringify(statusPayload)}`);
    }
    await sleep(5000);
  }

  const { summary } = statusPayload.data;
  const { billing } = statusPayload;
  console.log('\n2) Crawl Completed!');
  console.log(`   Site Health Score: ${summary.site_health_score} (${summary.grade})`);
  console.log(`   Pages Crawled:     ${summary.pages_crawled}`);
  console.log(`   Credits Refunded:  ${billing?.credits_refunded ?? 0}`);

  // 3. Stream full RFC-4180 CSV report (0 credits)
  const csvRes = await fetchWithBackoff(`${BASE_URL}/audit/crawl/${encodeURIComponent(jobId)}?format=csv`);
  if (!csvRes.ok) {
    throw new Error(`CSV download failed (${csvRes.status})`);
  }
  const csvText = await csvRes.text();
  const outFile = `serpspur-crawl-${jobId}.csv`;
  await fs.writeFile(outFile, csvText, 'utf8');
  console.log(`3) Saved CSV report -> ${outFile} (${csvText.length} bytes)`);
}

runCrawl().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
