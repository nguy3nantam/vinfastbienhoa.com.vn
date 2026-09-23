#!/bin/sh
set -eu

BASE_URL="${SMOKE_BASE_URL:-https://vinfastbienhoa.com.vn}"
FAILED=0

check() {
    path="$1"
    expected_type="$2"
    headers="$(curl -fsSIL --max-time 15 "$BASE_URL$path")" || {
        echo "FAIL $path"
        FAILED=1
        return
    }
    echo "$headers" | grep -qi "content-type: $expected_type" || {
        echo "FAIL $path (unexpected content type)"
        FAILED=1
        return
    }
    echo "PASS $path"
}

check / text/html
check /gioi-thieu text/html
check /lien-he text/html
check /tin-tuc text/html
check /xe/vf3 text/html
check /sitemap.xml application/xml
check /robots.txt text/plain
check /hcgi/platform/api/health application/json

internal_status="$(curl -sS -o /dev/null --max-time 15 -w '%{http_code}' -X POST "$BASE_URL/hcgi/platform/api/internal/news-ingest")"
if [ "$internal_status" = "404" ]; then
    echo "PASS internal endpoint is private"
else
    echo "FAIL internal endpoint returned $internal_status"
    FAILED=1
fi

if [ "$FAILED" -ne 0 ]; then
    exit 1
fi

echo "Smoke tests passed."
