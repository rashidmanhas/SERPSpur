const API_KEY = process.env.SERPSPUR_API_KEY || 'ss_live_YOUR_KEY_HERE';
const BASE_URL = 'https://serpspur.com/api/v1';

async function runSerpSpurApi() {
  // 1. Keyword Research Query
  const kwParams = new URLSearchParams({
    keyword: 'seo audit tool',
    country: 'us',
    language: 'en',
    depth: '3',
    mode: 'full'
  });

  const kwRes = await fetch(`${BASE_URL}/keywords?${kwParams}`, {
    headers: {
      'X-API-Key': API_KEY,
      'Accept': 'application/json'
    }
  });

  const kwData = await kwRes.json();
  console.log('Credits Charged:', kwRes.headers.get('X-SerpSpur-Credits-Deducted'));
  console.log('Keyword Response:', kwData);

  // 2. Batch Keyword Query (POST)
  const batchRes = await fetch(`${BASE_URL}/keywords/batch`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      keywords: ['seo audit tool', 'broken link checker', 'ai rank tracker'],
      country: 'us',
      language: 'en',
      mode: 'vault'
    })
  });

  const batchData = await batchRes.json();
  console.log('Batch Results:', batchData);
}

runSerpSpurApi();
