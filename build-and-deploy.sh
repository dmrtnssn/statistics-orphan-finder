#!/bin/bash

# Build and Deploy Script for Statistics Orphan Finder
# This script builds the frontend and uploads to Home Assistant

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
COMPONENT_DIR="$SCRIPT_DIR/custom_components/statistics_orphan_finder"

echo "========================================"
echo "Statistics Orphan Finder - Build & Deploy"
echo "========================================"
echo ""

# Step 1: Run tests
echo "Step 1: Running tests..."
cd "$SCRIPT_DIR"

if ./run-tests.sh -s; then
    echo "✓ All tests passed."
else
    echo "✗ Tests failed. Deployment aborted."
    exit 1
fi

echo ""

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

# Step 2: Build frontend
echo "Step 2: Building frontend..."
cd "$FRONTEND_DIR"

if npm run build; then
    echo "Build completed successfully."
else
    echo "Error: Build failed. Deployment aborted."
    exit 1
fi

echo ""

# Step 3: Upload to Home Assistant
echo "Step 3: Uploading to Home Assistant..."
cd "$SCRIPT_DIR"

if scp -P 23 -r "$COMPONENT_DIR/" root@hassio.internal:~/homeassistant/custom_components/; then
    echo "Upload completed successfully."
    echo ""
    echo "========================================"
    echo "Deployment complete!"
    echo "Remember to restart Home Assistant to load the changes."
    echo "========================================"
    exit 0
else
    echo "Error: Upload failed."
    exit 2
fi
