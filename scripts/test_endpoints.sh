#!/usr/bin/env bash
# test_endpoints.sh
# Usage: ./test_endpoints.sh <API_BASE_URL> (e.g. https://api.yourdomain.com/api)
set -euo pipefail
API_BASE="${1:-http://localhost:4000/api}"

echo "Testing health endpoint: $API_BASE/health"
curl -fsS "$API_BASE/health" | jq . || { echo "Health check failed"; exit 1; }

echo "Testing login (internal user 'admin')"
RESP=$(curl -fsS -X POST "$API_BASE/auth/login" -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}' || true)
if [ -z "$RESP" ]; then
  echo "Login request failed or returned empty response"; exit 1
fi

echo "$RESP" | jq . || echo "$RESP"

echo "Done"