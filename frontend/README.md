# Symbiont - An Open Source Self-hosted RAG App 🌐

Welcome to Symbiont, the premier RAG (Retrieval Argument Generation)-based application designed for secure, self-hosted deployment on personal or organizational servers. Built with privacy and user control in mind, Symbiont ensures that sensitive data is managed securely without requiring transmission to third-party servers, except when interacting with LLM (Large Language Model) providers such as OpenAI or Anthropic.

🔗 **Explore the Frontend**: For more about the frontend component of the Symbiont app, please visit: [Symbiont Frontend Repo](https://github.com/symbiont-me/symbiont-frontend)

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

- **`main`**: Stable branch, uses hosted services like Pinecone for vectors and Firebase for database and storage.
- **`dev`**: Includes the latest features, fully functional with a self-hosted MongoDB for enhanced privacy, still uses Pinecone for vectors.
- **`vector-db`**: Focuses on integrating various vector databases, both self-hosted and cloud-based, for ultimate privacy and control.

## Setup

To run the development server directly:

- .env.local or .env.development must be present

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To use Docker:

- .env.development must be present

```bash
ENV=development docker-compose up # for development
ENV=production docker-compose up # for production
```

See .env.example for required environment variables

---

## Fair Use and Licensing 📜

Symbiont is committed to providing powerful, free software tools that empower individuals, NGOs, and non-commercial entities to utilize advanced technology ethically and effectively. Our use of the Affero GPL license ensures that all derivatives of our work are also kept open and free, fostering a community of sharing and improvement.

### Commercial Use
While we encourage widespread use of Symbiont, commercial entities are expected to contribute back to the community either by participating in development or through a licensing fee. These contributions help maintain Symbiont's sustainability and ensure it remains free for non-commercial users. For more details on commercial licensing, please contact [contact info].


## Contributions 🤝

We welcome contributions from all, from code enhancements to documentation updates.

Join us in our mission to make AI applications available to common users while maintaining privacy and security. 🌍🚀👩‍💻👨‍💻


