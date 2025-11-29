#!/bin/bash

echo "🚀 StockHaus Deployment Checklist"
echo "=================================="
echo ""

# Check if builds work
echo "1. Checking builds..."
if npm run build > /dev/null 2>&1; then
  echo "   ✓ Frontend builds successfully"
else
  echo "   ✗ Frontend build failed"
  exit 1
fi

if npm run build:server > /dev/null 2>&1; then
  echo "   ✓ Backend builds successfully"
else
  echo "   ✗ Backend build failed"
  exit 1
fi

# Check if env files exist
echo ""
echo "2. Checking environment files..."
if [ -f "server/.env" ]; then
  echo "   ✓ server/.env exists"
  
  # Check for required vars
  required_vars=("SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY" "AUTH_USERS" "JWT_SECRET")
  missing_vars=()
  
  for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" server/.env; then
      missing_vars+=("$var")
    fi
  done
  
  if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "   ✓ All required environment variables present"
  else
    echo "   ⚠ Missing variables: ${missing_vars[*]}"
  fi
else
  echo "   ✗ server/.env not found"
fi

# Check if deployment configs exist
echo ""
echo "3. Checking deployment configs..."
configs=("vercel.json" "render.yaml" "server/railway.json" "DEPLOYMENT.md")
for config in "${configs[@]}"; do
  if [ -f "$config" ]; then
    echo "   ✓ $config exists"
  else
    echo "   ✗ $config missing"
  fi
done

# Check git status
echo ""
echo "4. Checking git status..."
if git diff --quiet && git diff --cached --quiet; then
  echo "   ✓ All changes committed"
else
  echo "   ⚠ Uncommitted changes detected"
  echo "   Run: git add -A && git commit -m 'Your message' && git push"
fi

echo ""
echo "=================================="
echo "✅ Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway or Render (see DEPLOYMENT.md)"
echo "2. Deploy frontend to Vercel (see DEPLOYMENT.md)"
echo "3. Update CORS_ORIGIN with your Vercel URL"
echo ""

