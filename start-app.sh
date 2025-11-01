#!/bin/bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Process IDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""

echo -e "${BLUE}🚀 Starting Symbiont Full Stack Application${NC}"
echo -e "${BLUE}=============================================${NC}"

# Function to print colored output
log_backend() {
    echo -e "${GREEN}[BACKEND]${NC} $1"
}

log_frontend() {
    echo -e "${PURPLE}[FRONTEND]${NC} $1"
}

log_app() {
    echo -e "${BLUE}[APP]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if scripts exist
check_scripts() {
    log_app "Checking startup scripts..."
    
    if [ ! -f "./start-backend.sh" ]; then
        log_error "start-backend.sh not found in current directory"
        exit 1
    fi
    
    if [ ! -f "./start-frontend.sh" ]; then
        log_error "start-frontend.sh not found in current directory"
        exit 1
    fi
    
    if [ ! -x "./start-backend.sh" ]; then
        log_app "Making start-backend.sh executable..."
        chmod +x ./start-backend.sh
    fi
    
    if [ ! -x "./start-frontend.sh" ]; then
        log_app "Making start-frontend.sh executable..."
        chmod +x ./start-frontend.sh
    fi
    
    log_app "✅ All scripts found and executable"
}

# Function to start backend
start_backend() {
    log_backend "Starting backend services..."
    
    # Start backend in background and capture its PID
    ./start-backend.sh > >(while read line; do log_backend "$line"; done) 2>&1 &
    BACKEND_PID=$!
    
    log_backend "Started with PID: $BACKEND_PID"
    
    # Wait a bit for backend to initialize
    log_backend "Initializing backend services..."
    sleep 10
    
    # Check if backend process is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        log_error "Backend failed to start!"
        exit 1
    fi
    
    # Check if backend is responding
    local attempts=0
    local max_attempts=30
    
    log_backend "Waiting for backend to be ready..."
    while [ $attempts -lt $max_attempts ]; do
        if curl -s --connect-timeout 2 http://127.0.0.1:8000 >/dev/null 2>&1 || \
           curl -s --connect-timeout 2 http://127.0.0.1:8000/health >/dev/null 2>&1; then
            log_backend "✅ Backend is responding at http://127.0.0.1:8000"
            break
        fi
        
        attempts=$((attempts + 1))
        if [ $attempts -eq $max_attempts ]; then
            log_warning "Backend may not be fully ready yet, but continuing with frontend startup..."
            break
        fi
        
        echo -n "."
        sleep 2
    done
    echo ""
}

# Function to start frontend
start_frontend() {
    log_frontend "Starting frontend..."
    
    # Start frontend in background and capture its PID
    ./start-frontend.sh > >(while read line; do log_frontend "$line"; done) 2>&1 &
    FRONTEND_PID=$!
    
    log_frontend "Started with PID: $FRONTEND_PID"
    
    # Wait a bit for frontend to initialize
    sleep 5
    
    # Check if frontend process is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        log_error "Frontend failed to start!"
        return 1
    fi
    
    # Check if frontend is responding
    local attempts=0
    local max_attempts=15
    
    log_frontend "Waiting for frontend to be ready..."
    while [ $attempts -lt $max_attempts ]; do
        if curl -s --connect-timeout 2 http://127.0.0.1:4000 >/dev/null 2>&1; then
            log_frontend "✅ Frontend is responding at http://127.0.0.1:4000"
            break
        fi
        
        attempts=$((attempts + 1))
        if [ $attempts -eq $max_attempts ]; then
            log_warning "Frontend may not be fully ready yet..."
            break
        fi
        
        echo -n "."
        sleep 2
    done
    echo ""
}

# Function to display application status
show_status() {
    echo ""
    log_app "🎉 Symbiont Application Status"
    log_app "=============================="
    
    if [ -n "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        log_backend "✅ Backend running (PID: $BACKEND_PID)"
        log_backend "   📡 API: http://127.0.0.1:8000"
    else
        log_error "❌ Backend not running"
    fi
    
    if [ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        log_frontend "✅ Frontend running (PID: $FRONTEND_PID)"
        log_frontend "   🌐 Web App: http://127.0.0.1:4000"
    else
        log_error "❌ Frontend not running"
    fi
    
    echo ""
    log_app "🔗 Open http://localhost:4000 in your browser to use the application"
    log_app "📊 Backend API documentation: http://localhost:8000/docs"
    echo ""
    log_app "Press Ctrl+C to stop both services"
    echo ""
}

# Function to monitor processes
monitor_processes() {
    while true; do
        # Check backend
        if [ -n "$BACKEND_PID" ] && ! kill -0 $BACKEND_PID 2>/dev/null; then
            log_error "Backend process died unexpectedly!"
            BACKEND_PID=""
        fi
        
        # Check frontend
        if [ -n "$FRONTEND_PID" ] && ! kill -0 $FRONTEND_PID 2>/dev/null; then
            log_error "Frontend process died unexpectedly!"
            FRONTEND_PID=""
        fi
        
        # If both processes are dead, exit
        if [ -z "$BACKEND_PID" ] && [ -z "$FRONTEND_PID" ]; then
            log_error "Both processes have stopped. Exiting..."
            exit 1
        fi
        
        sleep 5
    done
}

# Cleanup function for graceful shutdown
cleanup() {
    echo ""
    log_app "🛑 Shutting down Symbiont application..."
    
    # Kill frontend process
    if [ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        log_frontend "Stopping frontend..."
        kill -TERM $FRONTEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill backend process
    if [ -n "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        log_backend "Stopping backend..."
        kill -TERM $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
    
    log_app "✅ Application stopped successfully"
    echo ""
    log_app "💡 To stop Docker services, run: cd backend && docker compose down"
    
    exit 0
}

# Main execution
main() {
    # Check if scripts exist
    check_scripts
    
    # Start backend
    start_backend
    
    # Start frontend
    start_frontend
    
    # Show status
    show_status
    
    # Monitor processes
    monitor_processes
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "start-backend.sh" ] || [ ! -f "start-frontend.sh" ]; then
    log_error "Please run this script from the root directory where start-backend.sh and start-frontend.sh are located"
    exit 1
fi

# Run main function
main