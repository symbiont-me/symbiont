# Symbiont - An Open Source Self-hosted RAG App 🌐

Welcome to Symbiont, a free and open-source tool designed for researchers and journalists to efficiently search and analyse large volumes of text. Utilitising advanced vector-based search and retrieval argument generation, Symbiont enables users to uncover relevant information, draw connections between disparate data, and synthesize coherent narratives from extensive text sources.
Symbiont aims to enhance research quality by minimising errors, and increasing efficiency, thereby saving time.
Symbiont can be fully sel-hosted, addressing privacy conccerns by giving users complete control over their data.
Built with privacy and user control in mind, Symbiont ensures that sensitive data is managed securely without requiring transmission to third-party servers, except when interacting with LLM (Large Language Model) providers such as OpenAI or Anthropic.


## Use Cases 🛠️

- **Academic Research**: Secure analysis of sensitive data.
- **Journalism**: Confidential information handling for reporting.
- **Creative Writing**: Private brainstorming and draft creation.

## Features 🌟

### 🛡️ Enhanced Privacy and Security
Your data remains under your control, securely stored on your own infrastructure.

### 🔑 Multi-user Authentication
Enables secure, personalized access for teams and organizations.

### 📄 Comprehensive Content Management
- **PDF Viewer**: Directly interact with PDFs.
- **Video Viewer**: Stream and analyze video content efficiently.
- **Multimedia Uploads**: Support for various formats including YouTube videos, web pages, and plain text.

### 📝 Integrated Writing and Note-Taking Tool
Facilitates seamless note-taking and document drafting alongside AI interactions.

### 🤖 Support for Multiple LLMs
Works with various Large Language Models from industry leaders such as Anthropic, OpenAI, and Google. More integrations planned.

## Branches 🌿

- **`main`**: Stable branch, uses Qdrant and MongoDB. Both can be self-hosted for maximum privacy

## Planned Features 
- [ ]  AI Writer: a Notion like text editor with AI copilot for writing. We want to "contexualise" the copilot as well to provide more accurate suggestions
- [x]  Symbiont CLI for similarity search and chat: these are various cli-based scripts that can help with going through large amound of text data.


## Setup

Follow the steps below to set up and run the Symbiont app.

## Step 1: Clone the repo and Navigate to the Backend Folder

Open your terminal and navigate to the folder where the backend of the application is located:

```bash
cd backend
```

## Step 2: Set Environment Variables

Create a file named `.env.development` in the backend folder and set the following environment variables:

```bash
echo "FASTAPI_ENV=development" >> .env.development
echo "VECTOR_STORE=qdrant" >> .env.development
echo "VECTOR_STORE_URL=http://localhost" >> .env.development
echo "VECTOR_STORE_PORT=6333" >> .env.development
echo "VECTOR_STORE_DIMENSION=768" >> .env.development # should correspond to the model's output dimension
echo "VECTOR_STORE_DISTANCE=DOT" >> .env.development # search metric
echo "VECTOR_STORE_TOKEN=" >> .env.development # <only required for cloud instance>

echo "MONGO_URI=mongodb://localhost" >> .env.development
echo "MONGO_PORT=27017" >> .env.development
echo "MONGO_DB_NAME=symbiont-local-mongodb" >> .env.development

echo "RERANKER=huggingface" >> .env.development
echo "RERANKER_API_KEY=" >> .env.development # only if cohere model
echo "EMBEDDINGS_MODEL=BAAI/bge-base-en" >> .env.development
echo "EMBEDDINGS_MODEL_API_KEY=" >> .env.development # only if voyage or openai model
```

## Step 3: Start Containers

Run the following script to start the necessary containers (supertokens, MongoDB, and Qdrant):

```bash
./start_containers.sh
```

## Step 4: Start the Backend Server

Use the following command to start the backend server:

```bash
poetry run uvicorn symbiont.main:app --reload
```

## Step 5: Navigate to the Frontend Folder

Open another terminal window and navigate to the frontend folder:

```bash
cd frontend
```

## Step 6: Set the Frontend Environment Variable

Set the required environment variable for the frontend:

```bash
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" >> .env
```

## Step 7: Run the Docker Compose

Run the following command to start the frontend application using Docker:

```bash
docker-compose up
```

## Step 8: Access the Application

You can now access the application in your web browser at:

```
http://localhost:4000
```

Enjoy using the Symbiont application!

---

## Fair Use and Licensing 📜

Symbiont is committed to providing powerful, free software tools that empower individuals, NGOs, and non-commercial entities to utilize advanced technology ethically and effectively. Our use of the Affero GPL license ensures that all derivatives of our work are also kept open and free, fostering a community of sharing and improvement.

### Commercial Use
While we encourage widespread use of Symbiont, commercial entities are expected to contribute back to the community either by participating in development or through a licensing fee. These contributions help maintain Symbiont's sustainability and ensure it remains free for non-commercial users. For more details on commercial licensing, please contact [contact info].


## Contributions 🤝

We welcome contributions from all, from code enhancements to documentation updates.

Join us in our mission to make AI applications available to common users while maintaining privacy and security. 🌍🚀👩‍💻👨‍💻



