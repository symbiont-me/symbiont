## Getting Started

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
