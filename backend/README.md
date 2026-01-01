# Family Trees Backend API

Lightweight backend API for the Family Trees application, built with Hono and deployed on Cloudflare Workers.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (lightweight edge framework)
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Clerk

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Clerk

1. Create a Clerk account at https://clerk.com/
2. Create a new application
3. Get your API keys from the dashboard
4. Copy `.dev.vars.example` to `.dev.vars`
5. Fill in your Clerk keys in `.dev.vars`

```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your actual keys
```

### 3. Create D1 Database

```bash
# Create the database
npx wrangler d1 create family-trees-db

# Copy the database_id from the output and update wrangler.toml
```

### 4. Run Database Migrations

```bash
# Execute initial schema (once you create migration files)
npx wrangler d1 execute family-trees-db --local --file=./migrations/0001_initial.sql
```

### 5. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8787`

## API Endpoints

### Public Routes

- `GET /` - API info and health check
- `GET /health` - Health check endpoint

### Protected Routes (require authentication)

- `GET /api/me` - Get current user info
- `GET /api/families` - Get user's family trees

## Authentication

All protected routes require a Clerk session token in the Authorization header:

```
Authorization: Bearer <clerk_session_token>
```

Get the session token from your frontend using Clerk's `getToken()` method.

## Deployment

### Manual Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Set production secrets
npx wrangler secret put CLERK_SECRET_KEY
```

### Automated Deployment (GitHub Actions)

The backend automatically deploys to Cloudflare Workers when changes are pushed to the `main` branch in the `backend/` folder.

**Setup GitHub Secrets:**

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

   - `CLOUDFLARE_API_TOKEN`: Create at https://dash.cloudflare.com/profile/api-tokens
     - Use the "Edit Cloudflare Workers" template
     - Or create custom token with permissions: `Account.Workers Scripts:Edit`

   - `CLOUDFLARE_ACCOUNT_ID`: Find at https://dash.cloudflare.com/
     - Click on "Workers & Pages" in sidebar
     - Your Account ID is shown in the right sidebar

**Get Cloudflare Account ID:**
```bash
npx wrangler whoami
```

**Set Clerk Secret in Cloudflare:**

The `CLERK_SECRET_KEY` must be set separately in Cloudflare (not in GitHub):

```bash
npx wrangler secret put CLERK_SECRET_KEY
# Enter your Clerk secret key when prompted
```

Or set via Cloudflare Dashboard:
1. Go to Workers & Pages → family-trees-api → Settings → Variables
2. Add `CLERK_SECRET_KEY` as an environment variable (encrypted)

## Environment Variables

### Local Development (.dev.vars)
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

### Production (Cloudflare Dashboard or wrangler secret)
- `CLERK_SECRET_KEY` - Set via `wrangler secret put CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY` - Set in wrangler.toml or dashboard

## Database

D1 database binding is available as `c.env.DB` in route handlers.

Example query:
```typescript
const result = await c.env.DB.prepare('SELECT * FROM families WHERE user_id = ?')
  .bind(userId)
  .all();
```
