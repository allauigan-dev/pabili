# Phase 1: Multi-Tenancy & Authentication

> **Priority:** 🔴 Critical | **Estimated Effort:** 2-3 weeks

## Overview

Transform Pabili from a single-tenant application to a SaaS platform with secure social authentication (Google + Facebook) and multi-tenant data isolation using [Better Auth](https://www.better-auth.com/).

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Auth Library** | Better Auth |
| **Social Providers** | Google, Facebook |
| **Database Adapter** | Drizzle (SQLite/D1) |
| **Multi-Tenancy** | Better Auth Organization Plugin |
| **Session Management** | Secure cookies (handled by Better Auth) |

---

## 1.1 Better Auth Setup

### Environment Variables

```bash
# .env
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=https://pabili.henry-allauigan.workers.dev

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (from Facebook Developer Portal)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### OAuth Callback URLs

Configure these in provider consoles:

| Provider | Callback URL |
|----------|--------------|
| Google | `https://pabili.henry-allauigan.workers.dev/api/auth/callback/google` |
| Facebook | `https://pabili.henry-allauigan.workers.dev/api/auth/callback/facebook` |

For local development:
- Google: `http://localhost:5173/api/auth/callback/google`
- Facebook: `http://localhost:5173/api/auth/callback/facebook`

### Cloudflare Workers Configuration

Add to `wrangler.jsonc`:

```json
"compatibility_flags": ["nodejs_compat"]
```

---

## 1.2 Database Schema (Better Auth Core Tables)

Better Auth manages its own tables. Run CLI to generate schema:

```bash
npx @better-auth/cli@latest generate
```

This creates 4 core tables:

| Table | Purpose |
|-------|---------|
| `user` | User profiles (id, name, email, image, emailVerified) |
| `session` | Session tokens with expiry |
| `account` | Links users to OAuth providers (Google, Facebook) |
| `verification` | Email verification tokens |

### Organization Plugin Tables

The Organization plugin adds:

| Table | Purpose |
|-------|---------|
| `organization` | Tenant/business entities |
| `member` | User-organization relationships with roles |
| `invitation` | Pending invites to organizations |

---

## 1.3 Server Implementation

### Auth Instance

Create `src/server/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "../db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  
  // Social-only auth (no email/password)
  emailAndPassword: {
    enabled: false,
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
  },
  
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
});
```

### Mount Auth Handler

Update `src/server/index.ts`:

```typescript
import { auth } from "./lib/auth";

// Mount Better Auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
```

### Auth Middleware

Create `src/server/middleware/auth.ts`:

```typescript
import { auth } from "../lib/auth";
import type { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};

export const requireAuth = async (c: Context, next: Next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }
  return next();
};
```

---

## 1.4 Client Implementation

### Auth Client

Create `src/client/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});

export const { signIn, signOut, useSession, useActiveOrganization } = authClient;
```

### Sign In Functions

```typescript
// Google Sign In
const handleGoogleSignIn = async () => {
  await authClient.signIn.social({ provider: "google" });
};

// Facebook Sign In  
const handleFacebookSignIn = async () => {
  await authClient.signIn.social({ provider: "facebook" });
};

// For React Native (ID Token flow)
const handleNativeGoogleSignIn = async (idToken: string, accessToken: string) => {
  await authClient.signIn.social({
    provider: "google",
    idToken: { token: idToken, accessToken },
  });
};
```

### Protected Route Component

Create `src/client/components/ProtectedRoute.tsx`:

```tsx
import { useSession } from "../lib/auth-client";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <Navigate to="/login" />;
  
  return <>{children}</>;
}
```

---

## 1.5 Multi-Tenant Data Isolation

### Update Existing Tables

Add `organization_id` to all business tables:

```sql
ALTER TABLE stores ADD COLUMN organization_id TEXT REFERENCES organization(id);
ALTER TABLE resellers ADD COLUMN organization_id TEXT REFERENCES organization(id);
ALTER TABLE orders ADD COLUMN organization_id TEXT REFERENCES organization(id);
ALTER TABLE invoices ADD COLUMN organization_id TEXT REFERENCES organization(id);
ALTER TABLE payments ADD COLUMN organization_id TEXT REFERENCES organization(id);
ALTER TABLE images ADD COLUMN organization_id TEXT REFERENCES organization(id);
```

### Organization Middleware

Create `src/server/middleware/organization.ts`:

```typescript
import { auth } from "../lib/auth";
import type { Context, Next } from "hono";

export const requireOrganization = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session?.session?.activeOrganizationId) {
    return c.json({ success: false, error: "No organization selected" }, 403);
  }
  
  c.set("organizationId", session.session.activeOrganizationId);
  return next();
};
```

### Update API Queries

All queries filter by `organization_id`:

```typescript
// Example: Get orders for current organization
app.get("/", requireAuth, requireOrganization, async (c) => {
  const organizationId = c.get("organizationId");
  
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.organizationId, organizationId));
    
  return c.json({ success: true, data: result });
});
```

---

## 1.6 Role-Based Access Control

### Organization Roles

Better Auth Organization plugin provides:

| Role | Description |
|------|-------------|
| `owner` | Full access, can delete organization |
| `admin` | Can manage members and all data |
| `member` | Standard access |

### Permission Middleware

```typescript
export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    const member = session?.session?.activeMember;
    
    if (!member || !allowedRoles.includes(member.role)) {
      return c.json({ success: false, error: "Insufficient permissions" }, 403);
    }
    
    return next();
  };
};

// Usage
app.delete("/:id", requireAuth, requireRole(["owner", "admin"]), async (c) => {
  // Only owners and admins can delete
});
```

---

## API Endpoints (Better Auth)

Better Auth provides these endpoints automatically:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/get-session` | Get current session |
| POST | `/api/auth/sign-in/social` | Initiate social login |
| POST | `/api/auth/sign-out` | Sign out |
| GET | `/api/auth/callback/:provider` | OAuth callback |

Organization plugin adds:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/organization/create` | Create organization |
| GET | `/api/auth/organization/list` | List user's organizations |
| POST | `/api/auth/organization/set-active` | Set active organization |
| POST | `/api/auth/organization/invite-member` | Invite member |
| POST | `/api/auth/invitation/accept` | Accept invite |

---

## Security Considerations

- [x] No passwords stored (social-only auth)
- [ ] Rate limiting on auth endpoints
- [x] CSRF protection (handled by Better Auth)
- [x] Secure cookies (httpOnly, secure, sameSite)
- [x] Multi-tenant data isolation via `organization_id`
- [ ] Role-based permission checks on all routes (TODO: requireRole middleware)

---

## Testing Checklist

- [x] Google OAuth flow (web)
- [x] Facebook OAuth flow (web)
- [ ] ID Token sign-in (for React Native)
- [x] Session persistence and refresh
- [x] Organization creation on first login
- [ ] Member invitation flow
- [ ] Role permission enforcement
- [x] Multi-tenant data isolation
- [x] Data separation between orgs
