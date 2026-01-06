---
description: How to run the development server and common development tasks
---

# Development Workflow

## Starting Development

// turbo
1. Install dependencies:
```bash
npm install
```

2. Create local environment variables:
```bash
cp .dev.vars.example .dev.vars
```
> **Note**: Edit `.dev.vars` with your own secrets. You can generate a `BETTER_AUTH_SECRET` using `openssl rand -base64 32`.

3. Start the development server:
```bash
npm run dev
```

4. Open the app in browser at http://localhost:5173

## Database Operations

// turbo
5. Generate a new migration after schema changes:
```bash
npx drizzle-kit generate
```

// turbo
6. Apply migrations to local D1:
```bash
npx wrangler d1 migrations apply pabili-db --local
```

// turbo
7. Seed local database (optional):
```bash
npx wrangler d1 execute pabili-db --local --file=scripts/seed.sql && npx wrangler d1 execute pabili-db --local --file=scripts/seed-orders.sql
```
> **Important**: Before seeding, you must sign in to the app and create an organization. You then need to manually update the `organization_id` in the `.sql` files with your actual organization ID.

8. Apply migrations to production D1:
```bash
npx wrangler d1 migrations apply pabili-db --remote
```

## Resetting Local Data

// turbo
9. Reset local D1 database (deletes all local data and re-applies migrations):
```bash
rm -rf .wrangler/state/v3/d1 && npx wrangler d1 migrations apply pabili-db --local
```

> **Note**: This only affects local development data. Production data is unaffected.

## Deployment

10. Build and deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Type Checking

// turbo
11. Run TypeScript type check:
```bash
npx tsc --noEmit
```

## Linting

// turbo
12. Run ESLint:
```bash
npm run lint
```
