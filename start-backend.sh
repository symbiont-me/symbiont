#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting Symbiont Backend Services..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if uv is installed
check_uv_installation() {
    if command_exists uv; then
        echo "✅ uv is already installed"
        uv --version
        return 0
    else
        echo "❌ uv not found, installing..."
        return 1
    fi
}

# Function to install uv
install_uv() {
    echo "📦 Installing uv..."
    if command_exists curl; then
        curl -LsSf https://astral.sh/uv/install.sh | sh
    elif command_exists wget; then
        wget -qO- https://astral.sh/uv/install.sh | sh
    else
        echo "❌ Neither curl nor wget found. Please install one of them first."
        exit 1
    fi
    
    # Add uv to PATH for this session
    export PATH="$HOME/.local/bin:$PATH"
    
    if command_exists uv; then
        echo "✅ uv installed successfully"
        uv --version
    else
        echo "❌ uv installation failed"
        exit 1
    fi
}

# Function to start Docker services
start_docker_services() {
    echo "🐳 Starting backend services (MongoDB, Qdrant, SuperTokens)..."
    cd backend
    
    # Check if podman or docker is available
    if command_exists podman; then
        DOCKER_CMD="podman"
    elif command_exists docker; then
        DOCKER_CMD="docker"
    else
        echo "❌ Neither Docker nor Podman found. Please install one of them."
        exit 1
    fi
    
    echo "Using $DOCKER_CMD..."
    $DOCKER_CMD compose up -d mongodb qdrant supertokens
    
    echo "✅ Backend services started"
    cd ..
}

# Function to install Python dependencies
install_dependencies() {
    echo "📚 Installing Python dependencies..."
    cd backend
    
    # Sync dependencies using uv
    uv sync
    
    echo "✅ Dependencies installed"
    cd ..
}

# Function to start FastAPI server
start_fastapi_server() {
    echo "🌐 Starting FastAPI server..."
    cd backend
    
    # Check if .env.development exists
    if [ ! -f ".env.development" ]; then
        echo "⚠️  Warning: .env.development not found. Please create it from env.example"
        echo "   You can copy env.example to .env.development and fill in the values:"
        echo "   cp env.example .env.development"
        echo ""
        echo "   The server may not work properly without proper environment variables."
        echo ""
    fi
    
    echo "🔥 Starting uvicorn server with hot reload..."
    uv run uvicorn symbiont.main:app --host 0.0.0.0 --port 8000 --reload
}

# Main execution
main() {
    echo "🎯 Symbiont Backend Startup Script"
    echo "=================================="
    
    # Check and install uv if needed
    if ! check_uv_installation; then
        install_uv
    fi
    
    # Start Docker services
    start_docker_services
    
    # Install dependencies
    install_dependencies
    
    # Wait a moment for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 3
    
    # Start FastAPI server (this will block)
    start_fastapi_server
}

# Cleanup function for graceful shutdown
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    echo "Backend services will continue running in Docker."
    echo "To stop them, run: cd backend && docker compose down"
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

# Run main function
main