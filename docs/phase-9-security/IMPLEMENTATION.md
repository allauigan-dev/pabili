# Phase 9: Security & Compliance

> **Priority:** 🔴 Critical | **Estimated Effort:** 2-3 weeks

## Overview

Implement comprehensive security measures and compliance features essential for a multi-tenant SaaS platform serving Philippine businesses.

---

## 9.1 Rate Limiting

### API Rate Limits by Plan

| Plan | Requests/min | Requests/day |
|------|--------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Business | 1,000 | Unlimited |

### Implementation

Use Cloudflare Rate Limiting or implement custom rate limiting with D1:

```typescript
// Rate limit middleware
import { RateLimiter } from './lib/rate-limiter';

const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: (plan: string) => {
    switch (plan) {
      case 'business': return 1000;
      case 'pro': return 300;
      default: return 60;
    }
  }
});

app.use('/api/*', rateLimiter.middleware());
```

### Response Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704672000
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 30
}
```

---

## 9.2 CSRF Protection

### Implementation

Better Auth handles CSRF for auth endpoints. For other forms:

```typescript
// Generate CSRF token
import { generateToken, verifyToken } from './lib/csrf';

// Add to form responses
app.get('/api/csrf-token', async (c) => {
  const token = await generateToken(c.get('session').id);
  return c.json({ success: true, data: { token } });
});

// Verify on mutations
app.use('/api/*', async (c, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method)) {
    const token = c.req.header('X-CSRF-Token');
    if (!await verifyToken(token, c.get('session').id)) {
      return c.json({ success: false, error: 'Invalid CSRF token' }, 403);
    }
  }
  return next();
});
```

---

## 9.3 Audit Logging

### Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL REFERENCES organization(id),
  user_id TEXT NOT NULL REFERENCES user(id),
  
  -- Action details
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'export'
  entity_type TEXT NOT NULL, -- 'order', 'customer', 'payment', etc.
  entity_id TEXT,
  
  -- Change tracking
  old_values TEXT, -- JSON of previous values
  new_values TEXT, -- JSON of new values
  
  -- Context
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
```

### Logged Actions

| Action | Entity Types | Data Captured |
|--------|--------------|---------------|
| `create` | All entities | New values |
| `update` | All entities | Old + new values |
| `delete` | All entities | Deleted values |
| `export` | Reports | Export type, filters |
| `login` | Session | IP, user agent |
| `logout` | Session | Reason |
| `invite` | Member | Invitee email, role |

### Implementation

```typescript
// Audit logging service
export const auditLog = async (
  db: DrizzleDB,
  ctx: {
    organizationId: string;
    userId: string;
    ip?: string;
    userAgent?: string;
  },
  action: {
    type: 'create' | 'update' | 'delete' | 'view' | 'export';
    entityType: string;
    entityId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }
) => {
  await db.insert(auditLogs).values({
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    action: action.type,
    entityType: action.entityType,
    entityId: action.entityId,
    oldValues: action.oldValues ? JSON.stringify(action.oldValues) : null,
    newValues: action.newValues ? JSON.stringify(action.newValues) : null,
    ipAddress: ctx.ip,
    userAgent: ctx.userAgent,
  });
};
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit-logs` | List audit logs (admin only) |
| GET | `/api/audit-logs/export` | Export audit logs to CSV |

---

## 9.4 Data Export (GDPR/DPA Compliance)

### User Data Export

Allow users to export all their data in a portable format:

```typescript
// Export user's data
app.get('/api/user/export', requireAuth, async (c) => {
  const userId = c.get('user').id;
  
  const data = {
    user: await getUserData(userId),
    organizations: await getUserOrganizations(userId),
    // For each org, export their data
    organizationData: await Promise.all(
      orgs.map(org => exportOrgData(org.id, userId))
    ),
  };
  
  // Return as downloadable JSON
  return c.json({ success: true, data });
});
```

### Organization Data Export

Owners can export all organization data:

| Data Type | Format | Includes |
|-----------|--------|----------|
| Orders | CSV/JSON | All order fields, images as URLs |
| Customers | CSV/JSON | Contact info, balance history |
| Payments | CSV/JSON | All payment records |
| Invoices | CSV/JSON | Invoice details |
| Stores | CSV/JSON | Store information |
| Audit Logs | CSV | Activity history |

---

## 9.5 Data Deletion (Right to be Forgotten)

### User Account Deletion

```typescript
app.post('/api/user/delete', requireAuth, async (c) => {
  const userId = c.get('user').id;
  
  // 1. Check if user owns any organizations
  const ownedOrgs = await getOwnedOrganizations(userId);
  if (ownedOrgs.length > 0) {
    return c.json({
      success: false,
      error: 'Transfer or delete owned organizations first',
      data: { organizations: ownedOrgs }
    }, 400);
  }
  
  // 2. Remove from all organizations
  await removeFromAllOrganizations(userId);
  
  // 3. Anonymize audit logs (keep for compliance)
  await anonymizeAuditLogs(userId);
  
  // 4. Delete user account
  await deleteUser(userId);
  
  // 5. Invalidate all sessions
  await invalidateAllSessions(userId);
  
  return c.json({ success: true });
});
```

### Organization Deletion

Owners can delete entire organization (soft delete with 30-day recovery):

```sql
-- Soft delete with recovery period
UPDATE organization SET 
  deleted_at = CURRENT_TIMESTAMP,
  scheduled_deletion_at = datetime('now', '+30 days')
WHERE id = ?;
```

---

## 9.6 Security Headers

### Cloudflare Workers Headers

```typescript
// Security headers middleware
app.use('*', async (c, next) => {
  await next();
  
  // Content Security Policy
  c.res.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.pabili.app"
  );
  
  // Prevent XSS
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  
  // HSTS (handled by Cloudflare, but set anyway)
  c.res.headers.set('Strict-Transport-Security', 
    'max-age=31536000; includeSubDomains'
  );
  
  // Referrer policy
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
});
```

---

## 9.7 Session Security

### Session Management

```typescript
// List active sessions
app.get('/api/user/sessions', requireAuth, async (c) => {
  const userId = c.get('user').id;
  const sessions = await auth.api.listSessions({ userId });
  
  return c.json({
    success: true,
    data: sessions.map(s => ({
      id: s.id,
      createdAt: s.createdAt,
      lastActive: s.updatedAt,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      isCurrent: s.id === c.get('session').id
    }))
  });
});

// Revoke session
app.delete('/api/user/sessions/:id', requireAuth, async (c) => {
  const sessionId = c.req.param('id');
  const userId = c.get('user').id;
  
  await auth.api.revokeSession({ 
    sessionId, 
    userId // Ensure user owns the session
  });
  
  return c.json({ success: true });
});

// Revoke all other sessions
app.post('/api/user/sessions/revoke-all', requireAuth, async (c) => {
  const userId = c.get('user').id;
  const currentSessionId = c.get('session').id;
  
  await auth.api.revokeAllSessions({ 
    userId, 
    except: currentSessionId 
  });
  
  return c.json({ success: true });
});
```

---

## 9.8 File Upload Validation

### Validation Rules

| Check | Rule |
|-------|------|
| File Size | Max 10MB (configurable per plan) |
| File Type | JPEG, PNG, WebP, GIF, PDF |
| Filename | Sanitize special characters |
| Content | Verify magic bytes match extension |

### Implementation

```typescript
import { validateFile } from './lib/file-validator';

app.post('/api/upload', requireAuth, async (c) => {
  const file = await c.req.formData().get('file');
  
  // Validate file
  const validation = await validateFile(file, {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    validateMagicBytes: true
  });
  
  if (!validation.valid) {
    return c.json({ 
      success: false, 
      error: validation.error 
    }, 400);
  }
  
  // Proceed with upload
  // ...
});
```

---

## 9.9 Input Validation

### Zod Schema Validation

All API inputs validated with Zod:

```typescript
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const orderSchema = z.object({
  order_name: z.string().min(1).max(255),
  order_quantity: z.number().int().positive().max(10000),
  order_price: z.number().positive().max(1000000),
  order_fee: z.number().min(0).max(100000),
  order_customer_price: z.number().positive().max(1000000),
  store_id: z.number().int().positive(),
  customer_id: z.number().int().positive(),
  order_description: z.string().max(1000).optional(),
});

app.post('/api/orders', 
  requireAuth, 
  zValidator('json', orderSchema),
  async (c) => {
    const data = c.req.valid('json');
    // ...
  }
);
```

---

## Security Checklist

- [ ] Rate limiting implemented per plan
- [ ] CSRF tokens on all mutation endpoints
- [ ] Audit logging for all data changes
- [ ] User data export endpoint
- [ ] User account deletion flow
- [ ] Organization deletion with recovery
- [ ] Security headers configured
- [ ] Session management UI
- [ ] File upload validation
- [ ] Input validation with Zod on all endpoints
