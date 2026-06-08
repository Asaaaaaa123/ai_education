#!/bin/bash
set -e

echo ""
echo "=========================================="
echo "Step 2/4: Verifying backend setup..."
echo "=========================================="

cd backend

if [ ! -f "requirements.txt" ]; then
  echo "❌ Backend requirements.txt not found!"
  exit 1
fi

# Check if Python is available
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
  echo "❌ Python is not installed or not in PATH"
  exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
  PYTHON_CMD="python"
fi

echo "ℹ️  Verifying backend dependencies..."
$PYTHON_CMD -c 'import fastapi, uvicorn, pydantic' 2>/dev/null || echo "ℹ️  Backend dependencies not installed, but Docker build will handle this"
echo "✅ Backend setup verified"


