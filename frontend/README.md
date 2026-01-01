# Family Trees - Frontend

Interactive family tree visualization built with Preact and ReactFlow.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Clerk publishable key:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:8787
```

Get your Clerk key from https://dashboard.clerk.com/

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:8001

## Tech Stack

- **Framework**: Preact (React alternative, 3KB)
- **Visualization**: ReactFlow
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Authentication**: Clerk
- **Language**: TypeScript

## Project Structure

```
src/
├── components/
│   ├── FamilyTree/        # Tree visualization components
│   ├── Auth/              # Authentication components
│   ├── Settings/          # Settings dialog
│   └── ui/                # Reusable UI components
├── data/
│   ├── types.ts           # TypeScript types
│   └── mockFamilyData.ts  # Sample family tree data
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API client
└── utils/                 # Layout engine and helpers
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Key Components

**FamilyTreeViewer** - Main tree visualization container

**PersonNode** - Individual person card in the tree

**PersonDetailsDialog** - Shows detailed person information and relationships

**AuthButton** - Sign in/out and user menu

## Authentication

The app uses Clerk for authentication. See [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md) for detailed integration guide.

Quick usage:

```tsx
import { useUser } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from './hooks/useAuthenticatedFetch';

function MyComponent() {
  const { user } = useUser();
  const fetch = useAuthenticatedFetch();

  const loadData = async () => {
    const data = await fetch('/api/families');
  };
}
```

## Customizing Family Data

Edit `src/data/mockFamilyData.ts` to customize the family tree with your own data.

## Deployment

This app is designed to be deployed to Cloudflare Pages or any static hosting:

```bash
npm run build
# Deploy the dist/ folder
```

## Learn More

- [Preact Documentation](https://preactjs.com/)
- [ReactFlow Documentation](https://reactflow.dev/)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
