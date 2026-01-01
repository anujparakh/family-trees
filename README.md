# Family Trees

A modern web application for visualizing and managing family tree genealogy data.

## Overview

Family Trees is a proof-of-concept application that allows users to:

- View interactive family tree visualizations
- Navigate multi-generational family relationships
- Switch between vertical and horizontal layouts
- Explore family connections (spouses, parents, children, siblings, cousins)

Built with Preact, ReactFlow, and Cloudflare Workers for a fast, serverless architecture.

## Project Structure

```
family-trees/
├── frontend/        # Preact web application
└── backend/         # Hono API on Cloudflare Workers
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
cp .env.example .env  # Add your Clerk key
npm run dev
```

Visit http://localhost:8001

### Backend

```bash
cd backend
npm install
cp .dev.vars.example .dev.vars  # Add your Clerk keys
npm run dev
```

API runs at http://localhost:8787

## Tech Stack

**Frontend:**

- Preact + TypeScript
- ReactFlow for graph visualization
- Tailwind CSS
- Clerk authentication

**Backend:**

- Hono framework
- Cloudflare Workers (edge runtime)
- Cloudflare D1 (SQLite database)
- Clerk JWT verification

## Documentation

- [Frontend README](./frontend/README.md) - Frontend setup and development
- [Backend README](./backend/README.md) - Backend API documentation
- [Auth Integration](./frontend/AUTH_INTEGRATION.md) - Clerk authentication guide
- [Deployment Setup](./.github/DEPLOYMENT_SETUP.md) - GitHub Actions deployment

## Development

Both frontend and backend run independently. Start both for full-stack development:

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm run dev
```

## License

MIT
