# Phase 1: Multi-Tenancy & Authentication

> **Priority:** 🔴 Critical | **Estimated Effort:** 3-4 weeks

## Overview

Transform Pabili from a single-tenant application to a SaaS platform with secure authentication and multi-tenant data isolation.

---

## 1.1 User Authentication

### Database Schema Changes

```sql
-- Add users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires TEXT,
  last_login TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

-- Add sessions table
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/logout` | Invalidate session |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/verify-email/:token` | Verify email address |
| GET | `/api/auth/me` | Get current user |

### Implementation Steps

1. **Install dependencies**
   ```bash
   npm install bcryptjs jsonwebtoken
   npm install -D @types/bcryptjs @types/jsonwebtoken
   ```

2. **Create Drizzle schema** in `src/server/db/schema.ts`

3. **Create auth routes** at `src/server/routes/auth.ts`

4. **Create auth middleware** at `src/server/middleware/auth.ts`

5. **Create client-side auth context** at `src/client/contexts/AuthContext.tsx`

6. **Create login/register pages**
   - `src/client/pages/auth/LoginPage.tsx`
   - `src/client/pages/auth/RegisterPage.tsx`
   - `src/client/pages/auth/ForgotPasswordPage.tsx`

7. **Add protected route wrapper** at `src/client/components/ProtectedRoute.tsx`

---

## 1.2 Multi-Tenant Architecture

### Database Schema Changes

```sql
-- Add tenants table
CREATE TABLE tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

-- Add tenant_users junction table
CREATE TABLE tenant_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, user_id)
);

-- Add tenant_id to existing tables
ALTER TABLE stores ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE resellers ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE orders ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE invoices ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE payments ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
```

### Implementation Steps

1. **Add tenant_id to all schemas** in `src/server/db/schema.ts`

2. **Create tenant middleware** that extracts tenant from JWT or subdomain

3. **Update all queries** to filter by tenant_id

4. **Create tenant onboarding flow**
   - After registration, create tenant
   - Set up initial configuration

5. **Tenant selector** (if user belongs to multiple tenants)

---

## 1.3 Role-Based Access Control

### Roles & Permissions

| Role | Orders | Stores | Resellers | Invoices | Payments | Reports | Users | Billing |
|------|--------|--------|-----------|----------|----------|---------|-------|---------|
| **Owner** | Full | Full | Full | Full | Full | Full | Full | Full |
| **Admin** | Full | Full | Full | Full | Full | View | View | - |
| **Staff** | Create/Edit | View | View | View | Create | - | - | - |

### Implementation Steps

1. **Add permissions to tenant_users** 
   ```sql
   ALTER TABLE tenant_users ADD COLUMN permissions TEXT;
   ```

2. **Create permission middleware** at `src/server/middleware/permissions.ts`

3. **Create team management UI** at `src/client/pages/settings/TeamPage.tsx`

4. **Invite system**
   - Generate invite link/token
   - Email invite to new user
   - Accept invite flow

---

## Security Considerations

- [ ] Password hashing with bcrypt (cost factor 10+)
- [ ] JWT with short expiry (15 mins) + refresh tokens
- [ ] Rate limiting on auth endpoints
- [ ] CSRF protection
- [ ] Secure cookie settings (httpOnly, secure, sameSite)
- [ ] Input sanitization on all endpoints

---

## Testing Checklist

- [ ] Registration with valid/invalid data
- [ ] Login with correct/incorrect credentials
- [ ] Password reset flow
- [ ] Session expiry and refresh
- [ ] Multi-tenant data isolation
- [ ] Role permissions enforcement
- [ ] Invite and accept flow
