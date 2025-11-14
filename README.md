# Symbiont - An Open Source Self-hosted RAG App 🌐

Welcome to Symbiont, a free and open-source tool designed for researchers and journalists to efficiently search and analyse large volumes of text. Utilising advanced vector-based search and retrieval argument generation, Symbiont enables users to uncover relevant information, draw connections between disparate data, and synthesize coherent narratives from extensive text sources.

Symbiont aims to enhance research quality by minimising errors, and increasing efficiency, thereby saving time. Symbiont can be fully self-hosted, addressing privacy concerns by giving users complete control over their data.

Built with privacy and user control in mind, Symbiont ensures that sensitive data is managed securely without requiring transmission to third-party servers, except when interacting with LLM (Large Language Model) providers such as OpenAI or Anthropic.

## Use Cases 🛠️

- **Academic Research**: Secure analysis of sensitive data
- **Journalism**: Confidential information handling for reporting  
- **Creative Writing**: Private brainstorming and draft creation

## Features 🌟

### 🛡️ Enhanced Privacy and Security
Your data remains under your control, securely stored on your own infrastructure.

### 🔑 Multi-user Authentication
Enables secure, personalized access for teams and organizations.

### 📄 Comprehensive Content Management
- **PDF Viewer**: Directly interact with PDFs
- **Video Viewer**: Stream and analyze video content efficiently
- **Multimedia Uploads**: Support for various formats including YouTube videos, web pages, and plain text

### 📝 Integrated Writing and Note-Taking Tool
Facilitates seamless note-taking and document drafting alongside AI interactions.

### 🤖 Support for Multiple LLMs
Works with various Large Language Models from industry leaders such as Anthropic, OpenAI, and Google. More integrations planned.

## Tech Stack

**Backend:**
- Python 3.11+ with FastAPI
- MongoDB for document storage
- Vector databases (Qdrant, Pinecone, Weaviate, Milvus)
- SuperTokens for authentication
- LangChain for document processing

**Frontend:**
- Next.js 14 with App Router
- React with TypeScript
- Material-UI + Tailwind CSS
- React Query for state management

## Quick Start 🚀

### Prerequisites
- Docker or Podman

### One-Command Setup

```bash
# Clone the repository
git clone <repository-url>

# Start the entire application
./start-app.sh
```

That's it! The script will automatically:
- Install `uv` (Python package manager) if needed
- Install `bun` if needed
- Start backend services (MongoDB, Qdrant, SuperTokens)
- Install all dependencies
- Start the FastAPI backend server
- Start the Next.js frontend server

### Access the Application

- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Individual Services

If you prefer to start services separately:

```bash
# Start backend only (API + services)
./start-backend.sh

# Start frontend only (in another terminal)
./start-frontend.sh
```

## Manual Setup (Advanced)

If you prefer to set up components manually:

### Environment Configuration

The startup scripts automatically create environment files, but you can customize them:

**Backend** (`backend/.env.development`):
```env
# Vector Store Configuration
VECTOR_STORE=qdrant
VECTOR_STORE_URL=http://localhost:6333
VECTOR_STORE_PORT=6333

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=symbiont

# LLM API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Embeddings and Reranking
EMBEDDINGS_MODEL=voyage-large-2
EMBEDDINGS_MODEL_API_KEY=your_voyage_key
RERANKER=cohere
RERANKER_API_KEY=your_cohere_key
```

**Frontend** (`frontend/.env`):
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Manual Component Setup

**Backend Services**:
```bash
cd backend
# Start Docker services
docker compose up -d mongodb qdrant supertokens

# Install Python dependencies
curl -LsSf https://astral.sh/uv/install.sh | sh  # Install uv
uv sync

# Start FastAPI server
uv run uvicorn symbiont.main:app --reload
```

**Frontend**:
```bash
cd frontend
# Install Node.js dependencies
# Install bun if needed
curl -fsSL https://bun.com/install | bash

bun install

# Start development server
bun --bun run dev
```

## Development

### Running Tests

**Backend Tests**:
```bash
cd backend
pytest
pytest symbiont/tests/chat/  # Specific module
pytest-watch  # Watch mode
```

**End-to-End Tests**:
```bash
# Start the application first
./start-app.sh

# In another terminal, run tests
npm test  # All e2e tests
npm run test:smoke  # Smoke tests only
npm run test:ui  # Interactive mode
```

### Stopping Services

```bash
# Stop the application (Ctrl+C in the terminal running start-app.sh)
# Then stop Docker services:
cd backend
docker compose down
```

### Project Structure

```
symbiont/
├── start-app.sh                 # 🚀 Main startup script
├── start-backend.sh             # Backend services only
├── start-frontend.sh            # Frontend only
├── backend/
│   ├── symbiont/
│   │   ├── main.py              # FastAPI application
│   │   ├── routers/             # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── models/              # Data models
│   │   └── tests/               # Test files
│   ├── docker-compose.yml       # Backend services
│   └── pyproject.toml           # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   ├── components/          # React components
│   │   ├── contexts/            # React contexts
│   │   └── hooks/               # Custom hooks
│   ├── public/                  # Static assets
│   └── package.json             # Node.js dependencies
└── README.md
```

## Branches 🌿

- **`main`**: Stable branch, uses Qdrant and MongoDB. Both can be self-hosted for maximum privacy

## Planned Features 

- [ ] AI Writer: a Notion like text editor with AI copilot for writing. We want to "contextualise" the copilot as well to provide more accurate suggestions
- [x] Symbiont CLI for similarity search and chat: these are various cli-based scripts that can help with going through large amounts of text data

## Fair Use and Licensing 📜

Symbiont is committed to providing powerful, free software tools that empower individuals, NGOs, and non-commercial entities to utilize advanced technology ethically and effectively. Our use of the Affero GPL license ensures that all derivatives of our work are also kept open and free, fostering a community of sharing and improvement.

### Commercial Use
While we encourage widespread use of Symbiont, commercial entities are expected to contribute back to the community either by participating in development or through a licensing fee. These contributions help maintain Symbiont's sustainability and ensure it remains free for non-commercial users. For more details on commercial licensing, please contact [contact info].

## Contributions 🤝

We welcome contributions from all, from code enhancements to documentation updates.

Join us in our mission to make AI applications available to common users while maintaining privacy and security. 🌍🚀👩‍💻👨‍💻
