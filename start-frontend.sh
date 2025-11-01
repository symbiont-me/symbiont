#!/bin/bash

set -e  # Exit on any error

echo "🎨 Starting Symbiont Frontend..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d 'v' -f 2)
        echo "✅ Node.js is installed: v$NODE_VERSION"
        
        # Check if Node.js version is >= 18 (required for Next.js 14)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            echo "✅ Node.js version is compatible"
            return 0
        else
            echo "❌ Node.js version $NODE_VERSION is too old. Next.js 14 requires Node.js 18+"
            echo "Please update Node.js to version 18 or higher"
            exit 1
        fi
    else
        echo "❌ Node.js not found. Please install Node.js 18+ first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
}

# Function to check and install pnpm
check_and_install_pnpm() {
    if command_exists pnpm; then
        echo "✅ pnpm is already installed"
        pnpm --version
        return 0
    else
        echo "📦 Installing pnpm..."
        if command_exists npm; then
            npm install -g pnpm
        else
            echo "Installing pnpm via curl..."
            curl -fsSL https://get.pnpm.io/install.sh | sh
            
            # Add pnpm to PATH for this session
            export PNPM_HOME="$HOME/.local/share/pnpm"
            export PATH="$PNPM_HOME:$PATH"
        fi
        
        if command_exists pnpm; then
            echo "✅ pnpm installed successfully"
            pnpm --version
        else
            echo "❌ pnpm installation failed"
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
    
    echo "Running pnpm install..."
    pnpm install
    
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
    
    pnpm run dev
}

# Main execution
main() {
    echo "🎯 Symbiont Frontend Startup Script"
    echo "===================================="
    
    # Check Node.js
    check_node
    
    # Check and install pnpm
    check_and_install_pnpm
    
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