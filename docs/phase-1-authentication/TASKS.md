# Phase 1 Tasks: Multi-Tenancy & Authentication (Better Auth)

## 1.1 Better Auth Setup

### Dependencies & Configuration
- [x] Install `better-auth` package
- [x] Add `nodejs_compat` flag to `wrangler.jsonc`
- [x] Create `.env` with `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
- [x] Configure Google OAuth credentials in Google Cloud Console
- [x] Configure Facebook OAuth credentials in Facebook Developer Portal
- [x] Add callback URLs for both providers (dev + production)

### Database Schema
- [x] Run `npx @better-auth/cli@latest generate` to generate auth schema
- [x] Add generated tables to Drizzle schema (`user`, `session`, `account`, `verification`)
- [x] Add Organization plugin tables (`organization`, `member`, `invitation`)
- [x] Generate and apply migrations with `drizzle-kit`

---

## 1.2 Server Implementation

### Auth Instance
- [x] Create `src/server/lib/auth.ts` with Better Auth configuration
- [x] Configure social providers (Google, Facebook)
- [x] Enable Organization plugin
- [x] Disable email/password authentication

### Route Integration
- [x] Mount auth handler at `/api/auth/*` in `src/server/index.ts`
- [x] Create `src/server/middleware/auth.ts` with session middleware
- [x] Create `requireAuth` middleware for protected routes
- [x] Test auth endpoints (verified via browser and production deployment)

---

## 1.3 Client Implementation

### Auth Client
- [x] Create `src/client/lib/auth-client.ts`
- [x] Configure with Organization client plugin
- [x] Export `signIn`, `signOut`, `useSession`, `useActiveOrganization`

### Pages & Components
- [x] Create `src/client/pages/auth/LoginPage.tsx` with social buttons
- [x] Create `src/client/components/ProtectedRoute.tsx`
- [x] Create `src/client/components/OrganizationSwitcher.tsx`
- [x] Wrap existing routes with `ProtectedRoute`
- [x] Redirect authenticated users from login to dashboard

---

## 1.4 Multi-Tenant Data Isolation

### Schema Updates
- [x] Add `organization_id` column to `stores` table
- [x] Add `organization_id` column to `resellers` table
- [x] Add `organization_id` column to `orders` table
- [x] Add `organization_id` column to `invoices` table
- [x] Add `organization_id` column to `payments` table
- [x] Add `organization_id` column to `images` table
- [x] Generate and apply migrations

### Organization Middleware
- [x] Create `src/server/middleware/organization.ts`
- [x] Implement `requireOrganization` middleware
- [x] Add middleware to all protected API routes

### Query Updates
- [x] Update stores routes to filter by `organization_id`
- [x] Update resellers routes to filter by `organization_id`
- [x] Update orders routes to filter by `organization_id`
- [x] Update invoices routes to filter by `organization_id`
- [x] Update payments routes to filter by `organization_id`
- [x] Update all INSERT queries to include `organization_id`

---

## 1.5 Role-Based Access Control

### Permission Middleware
- [ ] Create `src/server/middleware/permissions.ts`
- [ ] Implement `requireRole` middleware factory
- [ ] Define role permissions (owner, admin, member)

### Route Protection
- [ ] Add role checks to destructive operations (DELETE)
- [ ] Add role checks to admin-only endpoints
- [ ] Test permission enforcement

---

## 1.6 Organization Onboarding

### First Login Flow
- [x] Detect new users without organizations
- [x] Prompt for business name to create organization
- [x] Auto-assign "owner" role to organization creator

### Invite System (Deferred)
- [ ] Create team management UI at `src/client/pages/settings/TeamPage.tsx`
- [ ] Implement invite modal with email input
- [ ] Display pending invitations
- [ ] Handle invite acceptance flow

> **Note:** Member invitations are deferred to a future phase. Current focus is on single-owner organizations.

---

## 1.7 Testing

### Authentication Tests
- [x] Test Google OAuth flow (web browser)
- [x] Test Facebook OAuth flow (web browser)
- [x] Test session persistence across page reloads
- [x] Test sign out flow

### Multi-Tenancy Tests
- [x] Verify data isolation between organizations
- [x] Test organization switching
- [x] Verify new records include `organization_id`

### Permission Tests
- [ ] Test owner permissions (requires requireRole middleware)
- [ ] Test admin permissions (requires requireRole middleware)
- [ ] Test member permissions (requires requireRole middleware)
- [ ] Verify unauthorized access is blocked (requires requireRole middleware)
