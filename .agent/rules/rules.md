---
trigger: always_on
---

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

## UI/Component Design Patterns

When creating new components, UI elements, or pages, follow these design patterns to maintain consistency across the application.

### Design System

- **Color Scheme**: Use CSS variables defined in `src/client/styles/theme.css`
  - Primary: `--primary` (Violet-600)
  - Backgrounds: `bg-background`, `bg-surface-light`, `bg-surface-dark`
  - Text: `text-foreground`, `text-muted-foreground`
  - Borders: `border-border/50`
- **Typography**: Use Inter font family (loaded via theme)
- **Border Radius**: Use `rounded-2xl` for cards/containers, `rounded-xl` for smaller elements
- **Shadows**: Use `shadow-soft` for elevated surfaces

### Page Structure

All list pages should follow this structure:

```tsx
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { FilterPills } from '@/components/ui/FilterPills';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { EmptyState } from '@/components/index';

export const ExamplePage: React.FC = () => {
  return (
    <div className="relative pb-24">
      {/* Header with search and filter */}
      <HeaderContent
        title="Page Title"
        showSearch={true}
        searchPlaceholder="Search..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        actions={<Button variant="ghost" size="icon">...</Button>}
        filterContent={<FilterPills options={filterOptions} activeValue={filter} onChange={setFilter} />}
      />
      
      {/* Main content with pt-14 for header offset */}
      <main className="space-y-4 pt-14">
        {/* Loading skeleton */}
        {isLoading && items.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 h-32 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 text-center">...</div>
        ) : items.length > 0 ? (
          /* Items list */
          <>
            {items.map(item => <ItemCard key={item.id} item={item} />)}
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef}>...</div>
            {/* Add new button */}
            <Button variant="outline" className="w-full py-8 border-dashed border-2...">Add New</Button>
          </>
        ) : (
          /* Empty state */
          <EmptyState title="No items" description="..." actionLabel="Add Item" onAction={() => navigate('/new')} />
        )}
      </main>

      {/* Floating action button */}
      <FloatingActionButton onClick={() => navigate('/new')} />
      
      {/* Delete confirmation dialog */}
      <AlertDialog>...</AlertDialog>
    </div>
  );
};
```

### Card Components

Cards should follow this pattern:

```tsx
<div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-border/50 relative group overflow-hidden">
  {/* Optional status strip */}
  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[status-color] rounded-l-2xl" />
  
  <div className="flex gap-4">
    {/* Image section */}
    <div className="flex-shrink-0 w-20 h-20 bg-secondary/30 rounded-xl overflow-hidden border border-border/50">
      ...
    </div>
    
    {/* Content section */}
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      <h3 className="text-base font-bold text-foreground truncate">Title</h3>
      <span className="text-xs text-muted-foreground">Subtitle</span>
      
      {/* Action buttons */}
      <div className="flex items-center space-x-0.5">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">...</Button>
      </div>
    </div>
  </div>
</div>
```

### Required UI Components

Always use these pre-built components from `@/components/ui/`:

| Component | Usage |
|-----------|-------|
| `Button` | All buttons (variants: default, destructive, outline, secondary, ghost, link) |
| `AlertDialog` | Confirmation dialogs (delete, destructive actions) |
| `Dialog` | Modal dialogs |
| `FloatingActionButton` | Primary action FAB on list pages |
| `FilterPills` | Filter options below header |
| `EmptyState` | Empty/no-results states |
| `HeaderContent` | Page headers with search/filter |
| `ImageGallery` | Image previews and galleries |
| `Combobox` | Searchable select dropdowns |

### Icons

Use `lucide-react` icons consistently:

```tsx
import { Plus, Edit, Trash2, RefreshCcw, Search, Loader2, User, Store, CheckCircle } from 'lucide-react';
```

- Size in buttons: `h-4 w-4` or `h-5 w-5`
- Size in FAB: `h-7 w-7` or `h-8 w-8`
- Color: `text-muted-foreground` for secondary, inherit for primary

### Loading States

- **Skeleton**: Use `animate-pulse` with matching card dimensions
- **Spinner**: Use `<Loader2 className="h-5 w-5 animate-spin" />`
- **Loading more**: Show centered below list with "Loading more..." text

### Mobile-First Patterns

- Container padding: `pb-24` for FAB clearance
- Touch targets: Minimum `h-8 w-8` for buttons
- Bottom navigation clearance: Account for mobile nav bar
- Responsive breakpoints: `md:` for desktop adjustments

### Hooks to Use

| Hook | Purpose |
|------|---------|
| `useInfiniteScroll` | Paginated lists with scroll loading |
| `use[Entity]Mutations` | CRUD operations (e.g., `useOrderMutations`) |
| `useHeader` | Access header context |
| `useScroll` | Scroll position tracking |

### Form Pages

For create/edit forms, follow these patterns:

- Use controlled form state with `useState`
- Include `FormActions` component for Save/Cancel buttons
- Validate with inline error messages
- Show loading state on submit button
- Navigate back on success with `useNavigate`

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
3. **Philippine Locale**: Use PHP currency formatting, Philippine