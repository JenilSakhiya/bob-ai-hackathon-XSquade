#!/usr/bin/env bash
# Render Build Script — builds both frontend and backend
# This script is executed by Render during deployment

set -o errexit  # Exit on error

echo "=== CyberSentinel Build Script ==="

# 1. Install backend Python dependencies
echo ">>> Installing backend Python dependencies..."
cd src/backend
pip install --upgrade pip
pip install -r requirements.txt

# 2. Build the frontend
echo ">>> Installing frontend Node dependencies..."
cd ../frontend
npm install

echo ">>> Building frontend production bundle..."
npm run build

# 3. Move built frontend into backend's static directory
echo ">>> Moving frontend build to backend static directory..."
mkdir -p ../backend/static
cp -r dist/* ../backend/static/

echo "=== Build complete ==="
