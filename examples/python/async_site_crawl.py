"""
SERPSpur Async Multi-Page Site Crawl & CSV Exporter (Python)

Dispatches a non-blocking 5–100 page Headless Chrome site crawl, polls until
completion at 0 credits (respecting Retry-After on HTTP 429), and streams the
RFC-4180 CSV report to disk.

Usage:
    SERPSPUR_API_KEY="ss_live_YOUR_KEY" python examples/python/async_site_crawl.py https://example.com 50
"""

import os
import sys
import time
import requests

BASE_URL = "https://serpspur.com/api/v1"
API_KEY = os.getenv("SERPSPUR_API_KEY", "ss_live_sandbox_demo")
MODE = os.getenv("SERPSPUR_MODE", "sandbox" if API_KEY == "ss_live_sandbox_demo" else "live")
TARGET_URL = sys.argv[1] if len(sys.argv) > 1 else "https://serpspur.com/"
MAX_PAGES = int(sys.argv[2]) if len(sys.argv) > 2 else 25

session = requests.Session()
session.headers.update({"Authorization": f"Bearer {API_KEY}"})


def request_with_backoff(method: str, url: str, **kwargs) -> requests.Response:
    for _ in range(5):
        resp = session.request(method, url, timeout=45, **kwargs)
        if resp.status_code == 429:
            wait_sec = int(resp.headers.get("Retry-After", "5"))
            print(f"Rate limited (429). Sleeping {wait_sec}s...")
            time.sleep(wait_sec)
            continue
        resp.raise_for_status()
        return resp
    raise RuntimeError("Exceeded max retries after HTTP 429.")


def main() -> None:
    print(f"1) Dispatching {MAX_PAGES}-page crawl for {TARGET_URL} (mode={MODE})...")
    start = request_with_backoff(
        "POST",
        f"{BASE_URL}/audit/crawl",
        json={"url": TARGET_URL, "max_pages": MAX_PAGES, "device": "desktop", "mode": MODE},
    ).json()

    job_id = start["data"]["job_id"]
    print(f"   Queued job_id={job_id}, credits_reserved={start['data'].get('credits_reserved')}")

    while True:
        poll = request_with_backoff(
            "GET",
            f"{BASE_URL}/audit/crawl/{job_id}",
            params={"page": 1, "per_page": 25},
        ).json()
        status = poll["data"]["status"]
        crawled = poll["data"].get("summary", {}).get("pages_crawled", 0)
        print(f"   Status: {status} | Pages crawled: {crawled}")
        if status == "completed":
            break
        if status == "failed":
            raise RuntimeError(f"Crawl failed: {poll}")
        time.sleep(5)

    summary = poll["data"]["summary"]
    billing = poll.get("billing", {})
    print(
        f"2) Completed! Health={summary.get('site_health_score')} ({summary.get('grade')}), "
        f"Pages={summary.get('pages_crawled')}, Refunded={billing.get('credits_refunded', 0)} Cr"
    )

    csv_resp = request_with_backoff("GET", f"{BASE_URL}/audit/crawl/{job_id}", params={"format": "csv"})
    out_file = f"serpspur-crawl-{job_id}.csv"
    with open(out_file, "wb") as f:
        f.write(csv_resp.content)
    print(f"3) Saved CSV -> {out_file} ({len(csv_resp.content)} bytes)")


if __name__ == "__main__":
    main()
