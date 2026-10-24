import os
import requests

API_KEY = os.getenv("SERPSPUR_API_KEY", "ss_live_YOUR_KEY_HERE")
BASE_URL = "https://serpspur.com/api/v1"

headers = {
    "X-API-Key": API_KEY,
    "Accept": "application/json"
}

# 1. Query Keyword Intelligence (Seed + Top 100 Cluster + Backlinks Needed)
kw_res = requests.get(
    f"{BASE_URL}/keywords",
    headers=headers,
    params={"keyword": "seo audit tool", "country": "us", "depth": 3, "mode": "full"}
)
print("Keyword Data:", kw_res.json())

# 2. Query TAI Traffic Authenticity
tai_res = requests.get(
    f"{BASE_URL}/tai",
    headers=headers,
    params={"domain": "serpspur.com", "mode": "auto"}
)
print("TAI Report:", tai_res.json())
