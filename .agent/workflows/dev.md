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

// turbo
2. Start the development server:
```bash
npm run dev
```

3. Open the app in browser at http://localhost:5173

## Database Operations

// turbo
4. Generate a new migration after schema changes:
```bash
npx drizzle-kit generate
```

// turbo
5. Apply migrations to local D1:
```bash
npx drizzle-kit push
```

6. Apply migrations to production D1:
```bash
npx wrangler d1 migrations apply pabili-db --remote
```

## Deployment

7. Build and deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Type Checking

// turbo
8. Run TypeScript type check:
```bash
npx tsc --noEmit
```

## Linting

// turbo
9. Run ESLint:
```bash
npm run lint
```
