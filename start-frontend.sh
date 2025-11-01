#!/bin/bash

set -e  # Exit on any error

echo "🎨 Starting Symbiont Frontend..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function removed - using bun instead of Node.js

# Function to check and install bun
check_and_install_bun() {
    if command_exists bun; then
        echo "✅ bun is already installed"
        bun --version
        return 0
    else
        echo "📦 Installing bun..."
        echo "Installing bun via curl..."
        curl -fsSL https://bun.com/install | bash
        
        # Add bun to PATH for this session
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
        
        # Source the shell profile to pick up bun
        if [ -f "$HOME/.bashrc" ]; then
            source "$HOME/.bashrc"
        elif [ -f "$HOME/.zshrc" ]; then
            source "$HOME/.zshrc"
        fi
        
        if command_exists bun; then
            echo "✅ bun installed successfully"
            bun --version
        else
            echo "❌ bun installation failed"
            exit 1
        fi
    fi
}

# Function to setup environment variables
setup_environment() {
    echo "🔧 Setting up environment variables..."
    cd frontend
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            echo "📄 Creating .env from .env.example..."
            cp .env.example .env
            
            # Set default backend URL if not already set
            if ! grep -q "NEXT_PUBLIC_API_URL" .env; then
                echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" >> .env
            fi
            
            echo "✅ Environment file created"
            echo "💡 You may need to edit .env with your specific configuration"
        else
            echo "⚠️  No .env.example found, creating basic .env..."
            echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env
        fi
    else
        echo "✅ .env file already exists"
    fi
    
    cd ..
}

# Function to install dependencies
install_dependencies() {
    echo "📚 Installing frontend dependencies..."
    cd frontend
    
    echo "Running bun install..."
    bun install
    
    echo "✅ Dependencies installed successfully"
    cd ..
}

# Function to check if backend is running
check_backend() {
    echo "🔍 Checking if backend is available..."
    
    # Try to connect to backend
    if curl -s --connect-timeout 3 http://127.0.0.1:8000/health >/dev/null 2>&1; then
        echo "✅ Backend is running at http://127.0.0.1:8000"
    elif curl -s --connect-timeout 3 http://127.0.0.1:8000 >/dev/null 2>&1; then
        echo "✅ Backend is running at http://127.0.0.1:8000"
    else
        echo "⚠️  Backend is not running at http://127.0.0.1:8000"
        echo "💡 Make sure to start the backend first with: ./start-backend.sh"
        echo "   The frontend will still start, but API calls will fail until backend is running."
        echo ""
    fi
}

# Function to start Next.js development server
start_nextjs_server() {
    echo "🌐 Starting Next.js development server..."
    cd frontend
    
    echo "🔥 Starting development server on port 4000..."
    echo "📱 Frontend will be available at: http://localhost:4000"
    echo "🔗 Backend should be running at: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    bun --bun run dev
}

# Main execution
main() {
    echo "🎯 Symbiont Frontend Startup Script"
    echo "===================================="
    
    # Check and install bun
    check_and_install_bun
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Check backend availability
    check_backend
    
    echo "⏳ Starting frontend server..."
    sleep 1
    
    # Start Next.js server (this will block)
    start_nextjs_server
}

# Cleanup function for graceful shutdown
cleanup() {
    echo ""
    echo "🛑 Shutting down frontend server..."
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

# Run main function
main