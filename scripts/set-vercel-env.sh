#!/usr/bin/env bash
# set-vercel-env.sh
# Usage: ./set-vercel-env.sh <projectId> <VERCEL_TOKEN> <KEY> <VALUE>
# Requires: curl, jq
set -euo pipefail
PROJECT_ID="$1"
VC_TOKEN="$2"
KEY="$3"
VALUE="$4"

if [ -z "$PROJECT_ID" ] || [ -z "$VC_TOKEN" ] || [ -z "$KEY" ] || [ -z "$VALUE" ]; then
  echo "Usage: $0 <projectId> <VERCEL_TOKEN> <KEY> <VALUE>"
  exit 1
fi

curl -s -X POST "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VC_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg k "$KEY" --arg v "$VALUE" '{"key":$k,"value":$v,"target":["development","preview","production"],"type":"encrypted"}')" \
  | jq .

echo "Done: set $KEY for project $PROJECT_ID (targets: development, preview, production)"