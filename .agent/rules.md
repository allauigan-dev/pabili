# Agent Rules - Pabili Project

## Overview
Pabili is a **multi-tenant SaaS platform** for pasabuy businesses in the Philippines. Each business is an **Organization** with isolated data, team members, and settings.

## Tech Stack
- **Frontend**: React + Vite, CSS variables for theming
- **Backend**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Auth**: Better Auth (with Organization plugin)
- **Storage**: Cloudflare R2
- **Testing**: Vitest + React Testing Library

## Project Structure
```
src/
├── client/       # React frontend (components, pages, hooks, lib, styles)
├── server/       # Hono backend (routes, db, auth, lib)
└── index.ts      # Main entry
```

## Coding Conventions

### General
- TypeScript, ES modules, `const` over `let`, async/await, explicit error handling

### Frontend
- Functional components with hooks, React Query for data, mobile-first design
- Use components from `@/components/ui/`: `Button`, `AlertDialog`, `Dialog`, `FloatingActionButton`, `FilterPills`, `EmptyState`, `HeaderContent`, `ImageGallery`, `Combobox`
- Icons: `lucide-react` (`h-4 w-4` in buttons, `h-7 w-7` in FAB)

### Backend
- Zod for validation, soft deletes (`deleted_at`), user-friendly error messages
- Response format: `{ success: boolean, data?: T, error?: string, code?: string }`

### Database
- Schema in `src/server/db/schema.ts`
- Always include `created_at`, `updated_at`, `deleted_at` timestamps

## Multi-Tenancy (CRITICAL)

**All queries MUST filter by `organizationId`:**
```typescript
// Get org from session
const orgId = session?.session.activeOrganizationId;
// Always scope queries
.where(eq(table.organizationId, orgId))
// Always include on insert
{ ...data, organizationId: orgId }
```

## File Uploads
- Max 10MB, JPEG/PNG/WebP/GIF only
- R2 paths: `{org_id}/{entity}/{entity_id}/{type}_{uuid}.{ext}`

## Commands
```bash
# Setup (first time)
npx wrangler d1 migrations apply pabili-db --local

# Development
npm run dev

# Database
npm run db:generate    # Generate migrations
npm run db:migrate     # Apply to production

# Testing
npm test              # Watch mode
npm run test:run      # Single run

# Deploy
npm run deploy
```

## Key Principles
1. **Multi-Tenant First**: Always scope data by organization
2. **Mobile Priority**: Design mobile-first
3. **Philippine Locale**: PHP currency, PH timezone
4. **Soft Deletes**: Never hard delete business data
5. **PWA Ready**: Consider offline capabilities
