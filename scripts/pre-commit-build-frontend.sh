#!/bin/bash
set -e

echo "=========================================="
echo "Step 1/4: Building frontend..."
echo "=========================================="

cd frontend

if [ ! -f "package.json" ]; then
  echo "❌ Frontend package.json not found!"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "ℹ️  Installing frontend dependencies..."
  npm install
fi

echo "ℹ️  Running npm build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed!"
  exit 1
fi

echo "✅ Frontend build completed successfully"


