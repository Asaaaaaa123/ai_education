#!/bin/bash
set -e

echo ""
echo "=========================================="
echo "Step 4/4: Building backend Docker image..."
echo "=========================================="

if [ ! -f "backend/Dockerfile" ]; then
  echo "❌ Backend Dockerfile not found!"
  exit 1
fi

echo "ℹ️  Building backend Docker image..."
docker build -t backend-precommit:test -f backend/Dockerfile backend/

if [ $? -ne 0 ]; then
  echo "❌ Backend Docker image build failed!"
  exit 1
fi

echo "✅ Backend Docker image built successfully"

# Clean up the test image
docker rmi backend-precommit:test 2>/dev/null || true

echo ""
echo "=========================================="
echo "✅ All pre-commit checks passed!"
echo "=========================================="


