#!/bin/bash

echo "Creating environment files..."

# Create backend .env.development if it doesn't exist
if [ ! -f "backend/.env.development" ]; then
    echo "Creating backend/.env.development..."
    cat > backend/.env.development << 'EOF'
FASTAPI_ENV=development
VECTOR_STORE=qdrant
VECTOR_STORE_URL=http://localhost
VECTOR_STORE_PORT=6333
VECTOR_STORE_DIMENSION=768
VECTOR_STORE_DISTANCE=DOT
VECTOR_STORE_TOKEN=
MONGO_URI=mongodb://localhost
MONGO_PORT=27017
MONGO_DB_NAME=symbiont-local-mongodb
RERANKER=huggingface
RERANKER_API_KEY=
EMBEDDINGS_MODEL=BAAI/bge-base-en
EMBEDDINGS_MODEL_API_KEY=
EOF
    echo "✓ Created backend/.env.development"
else
    echo "✓ backend/.env.development already exists"
fi

# Create frontend .env if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env..."
    cat > frontend/.env << 'EOF'
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
EOF
    echo "✓ Created frontend/.env"
else
    echo "✓ frontend/.env already exists"
fi

echo "Environment files setup complete!"