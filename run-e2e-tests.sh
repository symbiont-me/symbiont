#!/bin/bash

# Symbiont E2E Test Runner
# This script helps run e2e tests with proper service management

set -e

echo "🚀 Starting Symbiont E2E Tests"

# Function to cleanup processes on exit
cleanup() {
    echo "🧹 Cleaning up background processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
}

# Trap cleanup on script exit
trap cleanup EXIT

# Check if we should start services manually
if [ "$1" = "--manual-services" ]; then
    echo "📋 Manual service mode - please ensure backend (port 8000) and frontend (port 4000) are running"
    echo "   Backend: cd backend && uvicorn symbiont.main:app --reload"
    echo "   Frontend: cd frontend && bun --bun run dev"
    read -p "Press Enter when services are ready..."
else
    echo "🔧 Starting backend containers..."
    cd backend && ./start_containers.sh && cd ..
    
    echo "⚡ Starting backend server..."
    cd backend

    uv run uvicorn symbiont.main:app --reload --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    echo "🌐 Starting frontend server..."
    cd frontend
    bun --bun run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo "⏳ Waiting for services to start..."
    sleep 10
fi

# Run the tests
echo "🧪 Running Playwright tests..."

case "$1" in
    "smoke")
        echo "Running smoke tests only..."
        npm run test:smoke
        ;;
    "ui")
        echo "Running tests in UI mode..."
        npm run test:ui
        ;;
    "headed")
        echo "Running tests in headed mode..."
        npm run test:headed
        ;;
    *)
        echo "Running all tests..."
        npm test
        ;;
esac

echo "✅ E2E tests completed!"
