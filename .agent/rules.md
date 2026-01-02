# Agent Rules - Pabili Project

## Project Overview

Pabili is a PWA-based order management system for pasabuy (buy-on-behalf) businesses in the Philippines. The system manages orders, tracks payments, and generates invoices for resellers.

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | React + Vite |
| **Backend** | Hono (Cloudflare Workers) |
| **Database** | Cloudflare D1 (SQLite) |
| **ORM** | Drizzle ORM |
| **Hosting** | Cloudflare Workers |
| **File Storage** | Cloudflare R2 |
| **Testing** | Vitest + React Testing Library |
| **Package Manager** | npm |

## Project Structure

```
/home/henry/pabili/
├── src/
│   ├── client/           # React frontend
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── styles/       # CSS files
│   ├── server/           # Hono backend
│   │   ├── routes/       # API route handlers
│   │   ├── db/           # Drizzle schema and migrations
│   │   └── lib/          # Server utilities
│   └── index.ts          # Main entry point
├── public/               # Static assets
├── drizzle/              # Drizzle migrations
├── wrangler.toml         # Cloudflare Workers config
└── package.json
```

## Coding Conventions

### General
- Use TypeScript for all code
- Use ES modules (`import`/`export`)
- Prefer `const` over `let`; avoid `var`
- Use async/await over raw Promises
- Handle errors explicitly with try/catch

### React/Frontend
- Use functional components with hooks
- Use React Query or SWR for data fetching
- Follow mobile-first responsive design
- Use CSS variables for theming
- Keep components focused and reusable

### Hono/Backend
- Use Zod for request validation
- Return consistent JSON response format:
  ```typescript
  { success: boolean, data?: T, error?: string }
  ```
- Use soft deletes (set `deleted_at` instead of DELETE)
- Log errors but return user-friendly messages

### Database (Drizzle)
- Define schemas in `src/server/db/schema.ts`
- Use migrations via `drizzle-kit`
- Always include `created_at`, `updated_at`, `deleted_at` timestamps
- Use prepared statements to prevent SQL injection

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Testing
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run with coverage report

# Database
npx drizzle-kit generate    # Generate migrations
npx drizzle-kit push        # Apply migrations locally
npx wrangler d1 migrations apply pabili-db --remote  # Apply to production

# Deployment
npm run deploy       # Deploy to Cloudflare Workers
```

## File Upload Guidelines

- Max file size: 10MB
- Allowed types: JPEG, PNG, WebP, GIF
- Store in R2 with organized paths:
  - `orders/{order_id}/primary_{uuid}.{ext}`
  - `stores/{store_id}/logo_{uuid}.{ext}`
  - `resellers/{reseller_id}/photo_{uuid}.{ext}`
  - `payments/{payment_id}/proof_{uuid}.{ext}`

## API Response Format

All API responses should follow this structure:

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}

// Error response
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

## Important Notes

1. **PWA First**: Always consider offline capabilities and service worker caching
2. **Philippine Locale**: Use PHP currency formatting, Philippine time zone
3. **Mobile Priority**: Design for mobile-first, most users access via smartphone
4. **Data Integrity**: Use soft deletes, never hard delete business data
5. **Image Optimization**: Compress and resize images before R2 upload

## Testing Conventions

### Test File Structure
- Place test files alongside source files: `*.test.ts` or `*.test.tsx`
- Use `src/test/utils.tsx` for custom render with providers
- Use `src/test/setup.ts` for global test configuration

### Writing Tests
- Group related tests with `describe` blocks
- Test route definitions, validation, and error handling
- Mock database with `vi.mock('../db')`
- Use `beforeEach` to reset mocks between tests

### Test Categories
1. **Route definitions** - Verify endpoints exist
2. **Validation** - Test required fields and data types
3. **Error handling** - Test 400/404 responses
4. **Feature tests** - Status updates, calculations, etc.
