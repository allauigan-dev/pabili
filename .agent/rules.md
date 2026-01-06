# Agent Rules - Pabili Project

## Project Overview

Pabili is a **multi-tenant SaaS platform** for pasabuy (buy-on-behalf) businesses in the Philippines. Each business operates as an **Organization** with isolated data, team members, and settings. The system manages orders, tracks payments, and generates invoices for customers.

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | React + Vite |
| **Backend** | Hono (Cloudflare Workers) |
| **Database** | Cloudflare D1 (SQLite) |
| **ORM** | Drizzle ORM |
| **Authentication** | Better Auth (with Organization plugin) |
| **Hosting** | Cloudflare Workers |
| **File Storage** | Cloudflare R2 |
| **Testing** | Vitest + React Testing Library |
| **Package Manager** | npm |

## Project Structure

```
/home/hallauigan/pabili/
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
│   │   ├── auth/         # Better Auth configuration
│   │   └── lib/          # Server utilities
│   └── index.ts          # Main entry point
├── public/               # Static assets
├── drizzle/              # Drizzle migrations
├── wrangler.jsonc        # Cloudflare Workers config
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

## Multi-Tenancy Rules

### Critical: Organization Scoping

**All data queries MUST be scoped by `organizationId`:**

```typescript
// ✅ CORRECT - Always filter by org
const orders = await db.select()
  .from(ordersTable)
  .where(eq(ordersTable.organizationId, session.activeOrganizationId));

// ❌ WRONG - Never query without org filter
const orders = await db.select().from(ordersTable);
```

### Getting Organization Context

```typescript
// From auth session
const session = await auth.api.getSession({ headers: c.req.raw.headers });
const orgId = session?.session.activeOrganizationId;

if (!orgId) {
  return c.json({ success: false, error: 'No active organization' }, 401);
}
```

### Insert with Organization

```typescript
// Always include organizationId on insert
await db.insert(ordersTable).values({
  ...orderData,
  organizationId: session.activeOrganizationId,
});
```

### Cross-Org Access Prevention

- Never allow queries across organizations
- Validate resource ownership before update/delete
- Use middleware to enforce org scoping

## Authentication Patterns

### Protected Routes

```typescript
// Apply auth middleware to protected routes
app.use('/api/*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  c.set('session', session);
  return next();
});
```

### Public Routes

Auth routes are public by default:
- `/api/auth/sign-in/*`
- `/api/auth/sign-up/*`
- `/api/auth/callback/*`

## Common Commands

```bash
# Development
> [!IMPORTANT]
> You must apply migrations to the local D1 database before running the dev server for the first time, otherwise you'll get "no such table" errors.

### Full Database Setup (For New Projects)

If you're setting up the project from scratch, follow these additional steps:

1. Create a D1 database:
```bash
wrangler d1 create pabili-db
```

2. Update `wrangler.jsonc` with your database ID

3. Create an R2 bucket:
```bash
wrangler r2 bucket create pabili-uploads
```

4. Generate migrations from schema (if schema changes):
```bash
npm run db:generate
```

5. Apply migrations:
```bash
# For local development
npx wrangler d1 migrations apply pabili-db --local

# For production
npm run db:migrate
```


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
- **Always scope R2 paths by organization ID:**
  - `{org_id}/orders/{order_id}/primary_{uuid}.{ext}`
  - `{org_id}/stores/{store_id}/logo_{uuid}.{ext}`
  - `{org_id}/customers/{customer_id}/photo_{uuid}.{ext}`
  - `{org_id}/payments/{payment_id}/proof_{uuid}.{ext}`
  - `{org_id}/org/logo_{uuid}.{ext}`

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

1. **Multi-Tenant First**: Always scope data by organization
2. **PWA First**: Consider offline capabilities and service worker caching
3. **Philippine Locale**: Use PHP currency formatting, Philippine time zone
4. **Mobile Priority**: Design for mobile-first, most users access via smartphone
5. **Data Integrity**: Use soft deletes, never hard delete business data
6. **Image Optimization**: Compress and resize images before R2 upload

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
- **Mock auth session for org-scoped tests**

### Test Categories
1. **Route definitions** - Verify endpoints exist
2. **Validation** - Test required fields and data types
3. **Error handling** - Test 400/401/403/404 responses
4. **Multi-tenancy** - Test org isolation
5. **Feature tests** - Status updates, calculations, etc.
