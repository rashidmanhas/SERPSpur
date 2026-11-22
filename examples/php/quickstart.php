<?php
/**
 * SERPSpur Universal SEO & AI Intelligence API (v3.0) — Framework-Agnostic PHP Client
 *
 * Uses native PHP cURL (no Composer packages or CMS frameworks required).
 * Defaults to the free 0-credit sandbox token so you can test safely:
 *   php examples/php/quickstart.php
 *
 * For live production calls:
 *   SERPSPUR_API_KEY="ss_live_YOUR_KEY" SERPSPUR_MODE="auto" php examples/php/quickstart.php
 */

declare(strict_types=1);

class SERPSpurClient
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct(string $apiKey, string $baseUrl = 'https://serpspur.com/api/v1')
    {
        $this->apiKey  = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    /**
     * Executes a GET or POST request and returns decoded JSON + billing telemetry headers.
     */
    public function request(string $method, string $path, array $query = [], ?array $body = null): array
    {
        $url = $this->baseUrl . '/' . ltrim($path, '/');
        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }

        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Accept: application/json',
        ];

        $responseHeaders = [];
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 45,
            CURLOPT_CUSTOMREQUEST  => strtoupper($method),
            CURLOPT_HEADERFUNCTION => function ($curl, $headerLine) use (&$responseHeaders) {
                $len = strlen($headerLine);
                $parts = explode(':', $headerLine, 2);
                if (count($parts) === 2) {
                    $responseHeaders[strtolower(trim($parts[0]))] = trim($parts[1]);
                }
                return $len;
            },
        ]);

        if ($body !== null) {
            $headers[] = 'Content-Type: application/json';
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $raw  = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err  = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            throw new RuntimeException('cURL error: ' . $err);
        }

        $decoded = json_decode($raw, true);
        if ($code >= 400) {
            throw new RuntimeException("SERPSpur API HTTP {$code}: {$raw}");
        }

        return [
            'status'    => $code,
            'telemetry' => [
                'cache'             => $responseHeaders['x-serpspur-cache'] ?? null,
                'credits_deducted'  => $responseHeaders['x-serpspur-credits-deducted'] ?? null,
                'credits_remaining' => $responseHeaders['x-serpspur-credits-remaining'] ?? null,
                'rate_remaining'    => $responseHeaders['x-ratelimit-remaining'] ?? null,
            ],
            'body'      => $decoded,
        ];
    }
}

$apiKey = getenv('SERPSPUR_API_KEY') ?: 'ss_live_sandbox_demo';
$mode   = getenv('SERPSPUR_MODE') ?: 'sandbox';
$client = new SERPSpurClient($apiKey);

// 1. Keyword Research
$kw = $client->request('GET', '/keywords', [
    'keyword'  => 'seo audit tool',
    'country'  => 'us',
    'language' => 'en',
    'depth'    => 3,
    'mode'     => $mode,
]);
echo "Keyword: " . ($kw['body']['data']['keyword'] ?? 'n/a')
    . " | Vol: " . ($kw['body']['data']['search_volume'] ?? 0)
    . " | Credits: " . ($kw['telemetry']['credits_deducted'] ?? '0') . PHP_EOL;

// 2. 7-Engine SERP Multi-Engine Lookup
$serp = $client->request('POST', '/serp/multi', [], [
    'keyword' => 'seo audit tool',
    'domain'  => 'serpspur.com',
    'engines' => ['google', 'bing', 'youtube'],
    'mode'    => $mode,
]);
echo "SERP Engines: " . implode(', ', array_keys($serp['body']['data']['engines'] ?? [])) . PHP_EOL;

// 3. Headless Chrome Site Audit
$audit = $client->request('GET', '/audit', [
    'url'    => 'https://serpspur.com/',
    'device' => 'desktop',
    'detail' => 'full',
    'mode'   => $mode,
]);
echo "Audit Health: " . ($audit['body']['data']['health_score'] ?? 0)
    . " (" . ($audit['body']['data']['grade'] ?? '-') . ")" . PHP_EOL;

// 4. TAI™ Forensics
$tai = $client->request('GET', '/tai', [
    'domain' => 'serpspur.com',
    'mode'   => $mode,
]);
echo "TAI Score: " . ($tai['body']['data']['tai_score'] ?? 0)
    . " — " . ($tai['body']['data']['verdict'] ?? '-') . PHP_EOL;
