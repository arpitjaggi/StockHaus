#!/bin/bash

echo "🧪 Testing StockHaus Deployment"
echo "================================"
echo ""

# Get URLs from user or use defaults
read -p "Enter your Railway backend URL (e.g., https://xxx.up.railway.app): " RAILWAY_URL
read -p "Enter your Vercel frontend URL (e.g., https://xxx.vercel.app): " VERCEL_URL

if [ -z "$RAILWAY_URL" ]; then
  echo "❌ Railway URL is required"
  exit 1
fi

# Remove trailing slashes
RAILWAY_URL=$(echo "$RAILWAY_URL" | sed 's:/*$::')
VERCEL_URL=$(echo "$VERCEL_URL" | sed 's:/*$::')

echo ""
echo "Testing Backend (Railway)..."
echo "----------------------------"

# Test 0: Basic connectivity
echo -n "0. Connectivity check: "
if curl -s --max-time 5 "${RAILWAY_URL}" > /dev/null 2>&1; then
  echo "✅ Server is reachable"
else
  echo "❌ Server is NOT reachable"
  echo "   URL: $RAILWAY_URL"
  echo "   This usually means:"
  echo "   - Railway service is not deployed"
  echo "   - Service is still building"
  echo "   - URL is incorrect"
  echo "   - Service crashed on startup"
  echo ""
  echo "   Check Railway dashboard:"
  echo "   1. Go to Railway → Your Service"
  echo "   2. Check Deployments tab - is latest deployment successful?"
  echo "   3. Check Logs - are there any errors?"
  echo "   4. Verify the URL in Settings → Networking"
  exit 1
fi

# Test 1: Health endpoint
echo -n "1. Health endpoint: "
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" "${RAILWAY_URL}/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$HEALTH_RESPONSE" | grep -v "HTTP_CODE:" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ OK"
  echo "   Response: $BODY"
elif [ -z "$HTTP_CODE" ] || [ "$HTTP_CODE" = "000" ]; then
  echo "❌ CONNECTION FAILED"
  echo "   Could not reach: ${RAILWAY_URL}/health"
  echo "   Check:"
  echo "   - Is Railway service deployed and running?"
  echo "   - Is the URL correct? (should be https://xxx.up.railway.app)"
  echo "   - Check Railway deployment logs for errors"
else
  echo "❌ FAILED (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
fi

# Test 2: Login endpoint
echo -n "2. Login endpoint: "
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" -X POST "${RAILWAY_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' 2>&1)
LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | grep -v "HTTP_CODE:" | head -n-1)

if [ "$LOGIN_HTTP_CODE" = "200" ]; then
  echo "✅ OK"
  TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$TOKEN" ]; then
    echo "   Token received: ${TOKEN:0:20}..."
    export TEST_TOKEN="$TOKEN"
  else
    echo "   ⚠️  No token in response"
  fi
elif [ -z "$LOGIN_HTTP_CODE" ] || [ "$LOGIN_HTTP_CODE" = "000" ]; then
  echo "❌ CONNECTION FAILED"
  echo "   Could not reach: ${RAILWAY_URL}/api/auth/login"
else
  echo "❌ FAILED (HTTP $LOGIN_HTTP_CODE)"
  echo "   Response: $LOGIN_BODY"
fi

# Test 3: Authenticated endpoint (if we got a token)
if [ -n "$TEST_TOKEN" ]; then
  echo -n "3. Authenticated endpoint (projects): "
  AUTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" "${RAILWAY_URL}/api/projects" \
    -H "Authorization: Bearer $TEST_TOKEN" 2>&1)
  AUTH_HTTP_CODE=$(echo "$AUTH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
  AUTH_BODY=$(echo "$AUTH_RESPONSE" | grep -v "HTTP_CODE:")
  
  if [ "$AUTH_HTTP_CODE" = "200" ]; then
    echo "✅ OK"
    echo "   Response: $AUTH_BODY"
  else
    echo "❌ FAILED (HTTP $AUTH_HTTP_CODE)"
    echo "   Response: $AUTH_BODY"
  fi
fi

# Test 4: CORS check
if [ -n "$VERCEL_URL" ]; then
  echo ""
  echo "Testing CORS..."
  echo "----------------"
  echo -n "4. CORS headers: "
  CORS_RESPONSE=$(curl -s -I -X OPTIONS "${RAILWAY_URL}/api/auth/login" \
    -H "Origin: ${VERCEL_URL}" \
    -H "Access-Control-Request-Method: POST" 2>/dev/null)
  
  if echo "$CORS_RESPONSE" | grep -q "access-control-allow-origin"; then
    echo "✅ OK"
    echo "$CORS_RESPONSE" | grep -i "access-control"
  else
    echo "❌ FAILED - CORS headers missing"
    echo "   Make sure CORS_ORIGIN in Railway includes: $VERCEL_URL"
  fi
fi

echo ""
echo "================================"
echo "Test Summary"
echo "================================"
echo "Backend URL: $RAILWAY_URL"
if [ -n "$VERCEL_URL" ]; then
  echo "Frontend URL: $VERCEL_URL"
fi
echo ""
echo "Next steps:"
echo "1. If all tests pass ✅, try logging in at: $VERCEL_URL"
echo "2. If tests fail ❌, check Railway deployment logs"
echo "3. Make sure all environment variables are set in Railway"
echo ""

