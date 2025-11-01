# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Symbiont is a self-hosted RAG (Retrieval Augmented Generation) application built with a Python FastAPI backend and Next.js frontend. It provides secure document analysis, chat functionality, and multi-LLM support for researchers and journalists.

## Development Commands

### Quick Start (Recommended)
- **Start entire application**: `./start-app.sh` - Starts all services (backend + frontend)
- **Start backend only**: `./start-backend.sh` - Starts backend services and API server
- **Start frontend only**: `./start-frontend.sh` - Starts Next.js development server

### Backend (Python/FastAPI)
- **Run tests**: `cd backend && pytest`
- **Run specific tests**: `cd backend && pytest symbiont/tests/chat/`
- **Watch tests**: `cd backend && pytest-watch`
- **Manual server start**: `cd backend && uv run uvicorn symbiont.main:app --reload`
- **Environment**: Uses `uv` for dependency management; create `.env.development` file with required variables

### Frontend (Next.js 16 Beta)
- **Manual development server**: `cd frontend && bun --bun run dev` (runs on port 4000)
- **Build**: `cd frontend && bun run build`
- **Lint**: `cd frontend && bun run lint` (now uses ESLint directly with flat config)

## Architecture Overview

### Backend Architecture
- **Framework**: FastAPI with async/await patterns
- **Authentication**: SuperTokens integration with session middleware
- **Database**: MongoDB for document storage, Qdrant for vector storage
- **Vector Operations**: Abstract base classes with multiple vector DB implementations (Qdrant, Pinecone, Weaviate, Milvus)
- **LLM Integration**: Support for OpenAI, Anthropic, Google Gemini with unified interface
- **Document Processing**: PDF parsing, YouTube transcripts, web scraping via LangChain

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Authentication**: SuperTokens React integration
- **State Management**: React Context (AuthContext, StudyContext) + React Query
- **UI**: Material-UI + Tailwind CSS + custom components
- **Document Viewing**: Built-in PDF viewer, video player, and rich text editor

### Key Components

#### Backend Services
- **ChatContextService**: Handles RAG context retrieval and document embeddings
- **VectorStoreContext**: Abstract layer for vector database operations  
- **Routers**: Modular API endpoints (chat, study, resource, llm_settings, text)
- **LLM Services**: Unified interface for multiple LLM providers

#### Frontend Components
- **StudyPageMain**: Main workspace with chat, documents, and resources
- **ChatComponent**: Real-time chat with citation support
- **ResourceSwitcher**: Document upload and management
- **LLMSettings**: Provider and model configuration

## Testing Strategy

### Backend Testing
- **Framework**: pytest with extensive plugin ecosystem
- **Mocking**: Uses `mongomock` for database, mocks external APIs (OpenAI, Qdrant, etc.)
- **Coverage**: API endpoints, business logic, error handling, authentication
- **Structure**: Tests organized by feature in `symbiont/tests/`
- **Async Support**: Full async testing with pytest-asyncio

### Backend Test Execution
```bash
cd backend
pytest                           # All tests
pytest symbiont/tests/chat/      # Specific module
pytest-watch                     # Watch mode
```

### End-to-End Testing
- **Framework**: Playwright for browser automation and API testing
- **Configuration**: Tests both frontend (port 4000) and backend (port 8000)
- **Structure**: Tests organized from simple smoke tests to complex workflows
- **Browsers**: Chromium, Firefox, WebKit support
- **Services**: Use `./start-app.sh` to start services before running tests

### E2E Test Execution
```bash
# Start application first
./start-app.sh

# In another terminal, run tests
npm test                         # All e2e tests
npm run test:smoke              # Smoke tests only (@smoke tag)
npm run test:ui                 # Interactive UI mode
npm run test:headed             # Run with visible browser
./run-e2e-tests.sh smoke        # Using helper script
npx playwright test auth.spec.ts # Specific test file
npm run report                  # View HTML test report
```

## Environment Setup

### Automatic Setup
The startup scripts will automatically:
- Install `uv` (Python package manager) if not present
- Install `bun` (Node.js package manager) if not present
- Create environment files from examples
- Install all dependencies
- Start required services (MongoDB, Qdrant, SuperTokens)

### Required Environment Variables
**Backend (.env.development)**:
- Vector store config (VECTOR_STORE, VECTOR_STORE_URL, etc.)
- MongoDB connection (MONGO_URI, MONGO_PORT, MONGO_DB_NAME)
- LLM API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)
- Embeddings and reranker settings

**Frontend (.env)**:
- `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` (automatically configured)
- SuperTokens configuration variables

## Key Patterns and Conventions

### Backend Patterns
- Abstract base classes for vector repositories (`BaseVectorRepoABC`)
- Repository pattern for data access
- Dependency injection for LLM providers
- Background tasks for document processing
- Streaming responses for chat

### Frontend Patterns  
- Context providers for global state
- Custom hooks for API calls (`useAddResourceRequest`, `useAuthRedirect`)
- Component composition with reusable UI components
- Error boundaries and loading states

## Common Development Tasks

### Adding New Vector Database Support
1. Create new repository class extending `BaseVectorRepoABC`
2. Implement required methods (create_collection, add_vectors, search, etc.)
3. Add configuration in environment variables
4. Update vector store factory pattern

### Adding New LLM Provider
1. Add provider configuration in `llms/__init__.py`
2. Update `init_llm()` function with provider initialization
3. Add API key environment variable
4. Update LLM settings models and validation

### Running Single Test
```bash
cd backend
pytest symbiont/tests/chat/test_generate_llm_response.py::test_successful_response -v
```