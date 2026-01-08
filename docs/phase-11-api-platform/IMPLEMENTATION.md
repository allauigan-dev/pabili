# Phase 11: API & Developer Platform

> **Priority:** 🟢 Nice to Have (Business Plan Feature) | **Estimated Effort:** 3-4 weeks

## Overview

Provide a public API and developer tools for integrations, automation, and white-label partners. This is a premium feature available only on the Business plan.

---

## 11.1 Public REST API

### API Versioning

```
Base URL: https://api.pabili.app/v1
```

### Authentication

API requests use Bearer token authentication:

```bash
curl -X GET "https://api.pabili.app/v1/orders" \
  -H "Authorization: Bearer pk_live_xxxxxxxxxxxx"
```

### Available Endpoints

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| Orders | GET, POST, PUT, DELETE | Manage orders |
| Customers | GET, POST, PUT, DELETE | Manage customers |
| Stores | GET, POST, PUT, DELETE | Manage stores |
| Payments | GET, POST, PUT | Record payments |
| Invoices | GET, POST, PUT | Manage invoices |
| Webhooks | GET, POST, DELETE | Manage webhooks |

### Rate Limits (Business Plan)

| Limit | Value |
|-------|-------|
| Requests per minute | 1,000 |
| Requests per day | Unlimited |
| Webhook deliveries | 10,000/day |

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Order with ID 123 not found",
    "details": null
  }
}
```

---

## 11.2 API Key Management

### Key Types

| Type | Prefix | Permissions | Use Case |
|------|--------|-------------|----------|
| Live | `pk_live_` | Full access | Production |
| Test | `pk_test_` | Sandbox only | Development |
| Read-only | `pk_read_` | GET only | Reporting |

### Database Schema

```sql
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL REFERENCES organization(id),
  created_by TEXT NOT NULL REFERENCES user(id),
  
  -- Key info
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for display
  key_hash TEXT NOT NULL UNIQUE, -- Hashed full key
  key_type TEXT NOT NULL DEFAULT 'live' CHECK (
    key_type IN ('live', 'test', 'read_only')
  ),
  
  -- Permissions
  scopes TEXT, -- JSON array of allowed scopes
  
  -- Usage tracking
  last_used_at TEXT,
  request_count INTEGER DEFAULT 0,
  
  -- Status
  is_active INTEGER DEFAULT 1,
  expires_at TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/api-keys` | List API keys |
| POST | `/api/settings/api-keys` | Create new key |
| DELETE | `/api/settings/api-keys/:id` | Revoke key |
| GET | `/api/settings/api-keys/:id/usage` | Get usage stats |

### Key Generation

```typescript
import { createHash, randomBytes } from 'crypto';

export function generateApiKey(type: 'live' | 'test' | 'read_only'): {
  key: string;
  prefix: string;
  hash: string;
} {
  const prefixMap = {
    live: 'pk_live_',
    test: 'pk_test_',
    read_only: 'pk_read_',
  };
  
  const randomPart = randomBytes(24).toString('base64url');
  const key = `${prefixMap[type]}${randomPart}`;
  const prefix = key.substring(0, 12);
  const hash = createHash('sha256').update(key).digest('hex');
  
  return { key, prefix, hash };
}
```

---

## 11.3 Webhook Configuration

### Webhook Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `order.created` | New order created | Order object |
| `order.updated` | Order modified | Order object + changes |
| `order.status_changed` | Status update | Order object |
| `order.deleted` | Order soft deleted | Order ID |
| `customer.created` | New customer | Customer object |
| `customer.updated` | Customer modified | Customer object |
| `payment.created` | Payment recorded | Payment object |
| `payment.confirmed` | Payment confirmed | Payment object |
| `invoice.created` | Invoice generated | Invoice object |
| `invoice.paid` | Invoice fully paid | Invoice object |

### Database Schema

```sql
CREATE TABLE webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL REFERENCES organization(id),
  
  -- Webhook config
  url TEXT NOT NULL,
  secret TEXT NOT NULL, -- For signature verification
  events TEXT NOT NULL, -- JSON array of event types
  
  -- Status
  is_active INTEGER DEFAULT 1,
  
  -- Stats
  last_triggered_at TEXT,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_id INTEGER NOT NULL REFERENCES webhooks(id),
  
  -- Delivery info
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  
  -- Response
  response_status INTEGER,
  response_body TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'success', 'failed', 'retrying')
  ),
  attempts INTEGER DEFAULT 0,
  next_retry_at TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  delivered_at TEXT
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
```

### Webhook Signature

```typescript
// Signing webhook payloads
import { createHmac } from 'crypto';

export function signWebhook(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Header: X-Pabili-Signature: t=1704672000,v1=abc123...
```

### Retry Logic

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 5 minutes |
| 3 | 30 minutes |
| 4 | 2 hours |
| 5 | 24 hours |
| Final | Mark as failed |

---

## 11.4 API Documentation

### Interactive Documentation

Use OpenAPI/Swagger for documentation:

```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: Pabili API
  version: 1.0.0
  description: API for managing pasabuy orders, customers, and payments.

servers:
  - url: https://api.pabili.app/v1
    description: Production

paths:
  /orders:
    get:
      summary: List orders
      tags: [Orders]
      security:
        - ApiKeyAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, bought, packed, delivered, cancelled]
      responses:
        '200':
          description: List of orders
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderList'
```

### Documentation Hosting

Host interactive docs at:
- `https://developers.pabili.app` - Main docs site
- `https://api.pabili.app/docs` - Swagger UI

---

## 11.5 Rate Limit Dashboard

### Usage Metrics

| Metric | Display |
|--------|---------|
| Requests today | Counter with % of limit |
| Requests this month | Progress bar |
| Top endpoints | Table with counts |
| Error rate | Percentage |
| Avg response time | Milliseconds |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/api-usage` | Current usage stats |
| GET | `/api/settings/api-usage/history` | Usage over time |

### Implementation

```typescript
app.get('/api/settings/api-usage', requireAuth, async (c) => {
  const orgId = c.get('organizationId');
  
  const usage = await getApiUsage(db, orgId);
  const limits = await getPlanLimits(db, orgId);
  
  return c.json({
    success: true,
    data: {
      today: {
        requests: usage.todayRequests,
        limit: limits.requestsPerDay,
        percentage: (usage.todayRequests / limits.requestsPerDay) * 100,
      },
      month: {
        requests: usage.monthRequests,
        webhookDeliveries: usage.monthWebhooks,
      },
      topEndpoints: usage.topEndpoints,
      errorRate: usage.errorRate,
      avgResponseTime: usage.avgResponseTime,
    }
  });
});
```

---

## 11.6 Zapier/Make Integration

### Zapier App

Create a Zapier app with:

**Triggers:**
- New Order
- Order Status Changed
- New Payment
- New Customer

**Actions:**
- Create Order
- Update Order Status
- Create Customer
- Record Payment

### Implementation

Zapier uses REST hooks (webhooks) and polling:

```typescript
// Zapier subscribe endpoint
app.post('/api/zapier/subscribe', requireApiKey, async (c) => {
  const { hookUrl, event } = await c.req.json();
  
  // Create webhook for Zapier
  await createWebhook(db, {
    organizationId: c.get('organizationId'),
    url: hookUrl,
    events: [event],
    source: 'zapier',
  });
  
  return c.json({ success: true });
});

// Zapier unsubscribe endpoint
app.delete('/api/zapier/subscribe', requireApiKey, async (c) => {
  const { hookUrl } = await c.req.json();
  
  await deleteWebhook(db, {
    organizationId: c.get('organizationId'),
    url: hookUrl,
  });
  
  return c.json({ success: true });
});
```

---

## 11.7 White-Label Options

### White-Label Features (Business Plan)

| Feature | Description |
|---------|-------------|
| Custom Domain | Use own domain (orders.mybusiness.com) |
| Remove Branding | No "Powered by Pabili" |
| Custom Colors | Match brand identity |
| Custom Email Templates | Branded notifications |
| Custom Invoice Template | Include business logo/details |

### Implementation

Add to organization settings:

```sql
ALTER TABLE organization ADD COLUMN white_label_enabled INTEGER DEFAULT 0;
ALTER TABLE organization ADD COLUMN custom_domain TEXT;
ALTER TABLE organization ADD COLUMN custom_colors TEXT; -- JSON
ALTER TABLE organization ADD COLUMN remove_branding INTEGER DEFAULT 0;
```

### Custom Domain Setup

Use Cloudflare for SaaS:

```typescript
// Verify custom domain
app.post('/api/settings/custom-domain/verify', requireAuth, async (c) => {
  const { domain } = await c.req.json();
  
  // Check CNAME points to pabili.app
  const verified = await verifyCname(domain);
  
  if (verified) {
    // Provision SSL via Cloudflare
    await provisionCustomHostname(domain);
    
    // Update organization
    await updateOrganization(db, orgId, { custom_domain: domain });
  }
  
  return c.json({ success: true, verified });
});
```

---

## API Feature Gates

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| API Access | ❌ | ❌ | ✅ |
| API Keys | 0 | 0 | 10 |
| Webhooks | 0 | 0 | 25 |
| Rate Limit | N/A | N/A | 1,000/min |
| White-Label | ❌ | ❌ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ |
