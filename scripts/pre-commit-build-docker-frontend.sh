#!/bin/bash
set -e

echo ""
echo "=========================================="
echo "Step 3/4: Building frontend Docker image..."
echo "=========================================="

if [ ! -f "frontend/Dockerfile" ]; then
  echo "❌ Frontend Dockerfile not found!"
  exit 1
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed or not in PATH"
  exit 1
fi

echo "ℹ️  Building frontend Docker image..."
docker build -t frontend-precommit:test -f frontend/Dockerfile frontend/

if [ $? -ne 0 ]; then
  echo "❌ Frontend Docker image build failed!"
  exit 1
fi

echo "✅ Frontend Docker image built successfully"

# Clean up the test image
docker rmi frontend-precommit:test 2>/dev/null || true


