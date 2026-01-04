# Phase 1 Tasks: Multi-Tenancy & Authentication

## 1.1 User Authentication

### Database & Schema
- [ ] Create `users` table in Drizzle schema
- [ ] Create `sessions` table in Drizzle schema
- [ ] Generate and apply migrations
- [ ] Add type exports for User, Session

### Backend Routes
- [ ] Install bcryptjs and jsonwebtoken
- [ ] Create `src/server/routes/auth.ts`
- [ ] Implement POST `/api/auth/register`
- [ ] Implement POST `/api/auth/login`
- [ ] Implement POST `/api/auth/logout`
- [ ] Implement POST `/api/auth/forgot-password`
- [ ] Implement POST `/api/auth/reset-password`
- [ ] Implement GET `/api/auth/verify-email/:token`
- [ ] Implement GET `/api/auth/me`
- [ ] Add Zod validation schemas for all endpoints

### Middleware
- [ ] Create `src/server/middleware/auth.ts`
- [ ] Implement JWT verification
- [ ] Implement session refresh logic
- [ ] Add auth middleware to protected routes

### Frontend - Auth Context
- [ ] Create `src/client/contexts/AuthContext.tsx`
- [ ] Implement useAuth hook
- [ ] Handle token storage (secure cookies or localStorage)
- [ ] Auto-refresh token logic

### Frontend - Pages
- [ ] Create `src/client/pages/auth/LoginPage.tsx`
- [ ] Create `src/client/pages/auth/RegisterPage.tsx`
- [ ] Create `src/client/pages/auth/ForgotPasswordPage.tsx`
- [ ] Create `src/client/pages/auth/ResetPasswordPage.tsx`
- [ ] Style pages to match existing design system

### Protected Routes
- [ ] Create `src/client/components/ProtectedRoute.tsx`
- [ ] Wrap all existing routes with ProtectedRoute
- [ ] Redirect unauthenticated users to login
- [ ] Redirect authenticated users from auth pages to dashboard

---

## 1.2 Multi-Tenant Architecture

### Database & Schema
- [ ] Create `tenants` table in Drizzle schema
- [ ] Create `tenant_users` table in Drizzle schema
- [ ] Add `tenant_id` column to `stores` table
- [ ] Add `tenant_id` column to `resellers` table
- [ ] Add `tenant_id` column to `orders` table
- [ ] Add `tenant_id` column to `invoices` table
- [ ] Add `tenant_id` column to `payments` table
- [ ] Add `tenant_id` column to `images` table
- [ ] Generate and apply migrations
- [ ] Add type exports for Tenant, TenantUser

### Backend - Tenant Context
- [ ] Create `src/server/middleware/tenant.ts`
- [ ] Extract tenant from JWT claim
- [ ] Validate tenant access for current user
- [ ] Inject tenant_id into request context

### Backend - Query Updates
- [ ] Update stores routes to filter by tenant_id
- [ ] Update resellers routes to filter by tenant_id
- [ ] Update orders routes to filter by tenant_id
- [ ] Update invoices routes to filter by tenant_id
- [ ] Update payments routes to filter by tenant_id
- [ ] Update all INSERT queries to include tenant_id

### Tenant Onboarding
- [ ] Create tenant during user registration
- [ ] Prompt for business name on first login
- [ ] Allow tenant customization (name, logo)

### Frontend - Tenant Context
- [ ] Create `src/client/contexts/TenantContext.tsx`
- [ ] Display tenant name/logo in header
- [ ] Tenant switcher (if user has multiple)

---

## 1.3 Role-Based Access Control

### Database
- [ ] Add `role` column to `tenant_users` table
- [ ] Define role enum: owner, admin, staff
- [ ] Add `permissions` JSON column (optional granular)

### Backend - Permissions
- [ ] Create `src/server/middleware/permissions.ts`
- [ ] Define permission constants
- [ ] Implement role-to-permission mapping
- [ ] Add permission checks to all routes

### Team Management API
- [ ] Implement GET `/api/team` - List team members
- [ ] Implement POST `/api/team/invite` - Send invite
- [ ] Implement PUT `/api/team/:id/role` - Change role
- [ ] Implement DELETE `/api/team/:id` - Remove member
- [ ] Implement GET `/api/invites/:token` - Get invite details
- [ ] Implement POST `/api/invites/:token/accept` - Accept invite

### Frontend - Team Page
- [ ] Create `src/client/pages/settings/TeamPage.tsx`
- [ ] List team members with roles
- [ ] Invite modal with email input
- [ ] Role dropdown to change roles
- [ ] Remove member confirmation

### Invite Flow
- [ ] Create invite email template
- [ ] Generate secure invite tokens
- [ ] Create accept invite page
- [ ] Handle expired invites

---

## Testing

- [ ] Write tests for auth routes
- [ ] Write tests for tenant isolation
- [ ] Write tests for permission middleware
- [ ] Manual testing of full auth flow
- [ ] Manual testing of multi-tenant data isolation
