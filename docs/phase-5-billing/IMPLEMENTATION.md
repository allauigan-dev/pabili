# Phase 5: Billing & Subscription (SaaS Monetization)

> **Priority:** 🔴 Critical | **Estimated Effort:** 2-3 weeks

## Overview

Implement subscription plans, payment processing, and an admin portal for SaaS monetization.

---

## 5.1 Subscription Plans

### Plan Definitions

| Feature | Free | Pro (₱499/mo) | Business (₱1,499/mo) |
|---------|------|---------------|----------------------|
| Orders/month | 50 | Unlimited | Unlimited |
| Users | 1 | 3 | Unlimited |
| Stores | 5 | 20 | Unlimited |
| Resellers | 10 | 50 | Unlimited |
| Reports | Basic | Full | Full |
| API Access | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| White-label | ❌ | ❌ | ✅ |

### Database Schema

```sql
-- Subscription plans configuration
CREATE TABLE plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL, -- in centavos
  price_yearly INTEGER, -- optional yearly discount
  limits TEXT NOT NULL, -- JSON with all limits
  features TEXT NOT NULL, -- JSON array of feature flags
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tenant subscriptions
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due, trialing
  current_period_start TEXT NOT NULL,
  current_period_end TEXT NOT NULL,
  cancel_at_period_end INTEGER DEFAULT 0,
  trial_end TEXT,
  payment_provider TEXT, -- paymongo, dragonpay
  external_subscription_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking
CREATE TABLE usage_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  metric TEXT NOT NULL, -- orders, users, stores, resellers
  count INTEGER NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, metric, period_start)
);
```

### Limit Enforcement

Check limits on:
- Order creation: Count orders in current period
- User invite: Count active team members
- Store creation: Count active stores
- Reseller creation: Count active resellers

Show upgrade prompt when approaching limit (80%).

---

## 5.2 Billing Integration

### PayMongo Integration

PayMongo is the recommended payment gateway for PH SaaS.

**Supported Methods:**
- Credit/Debit Cards
- GCash
- Maya
- GrabPay

**Flow:**
1. User clicks "Subscribe"
2. Create PayMongo Checkout Session
3. Redirect to PayMongo hosted page
4. User completes payment
5. PayMongo redirects back with success/cancel
6. Webhook confirms payment, activate subscription

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing/plans` | List available plans |
| GET | `/api/billing/subscription` | Get current subscription |
| POST | `/api/billing/subscribe` | Create checkout session |
| POST | `/api/billing/cancel` | Cancel subscription |
| POST | `/api/billing/reactivate` | Reactivate cancelled sub |
| POST | `/api/billing/webhook` | PayMongo webhook handler |
| GET | `/api/billing/invoices` | List billing invoices |

### PayMongo Webhook Events

- `checkout_session.payment.paid` - Payment successful
- `subscription.active` - Subscription activated
- `subscription.cancelled` - Subscription cancelled
- `invoice.payment_failed` - Payment failed

### Invoice Generation

Generate and store billing invoices:

```sql
CREATE TABLE billing_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  subscription_id INTEGER REFERENCES subscriptions(id),
  invoice_number TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL, -- in centavos
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed
  paid_at TEXT,
  pdf_url TEXT,
  external_invoice_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5.3 Admin Portal (SaaS Operator)

Separate admin interface for the SaaS operator (you) to manage tenants.

### Features

1. **Tenant Dashboard**
   - Total tenants by plan
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - New signups this week/month

2. **Tenant Management**
   - List all tenants
   - View tenant details (plan, usage, last login)
   - Suspend/unsuspend tenant
   - Delete tenant (soft delete)
   - Override plan limits

3. **Revenue Analytics**
   - MRR trend chart
   - LTV (Lifetime Value) calculation
   - Churn analysis
   - Revenue by plan breakdown

4. **User Management**
   - List all users
   - View user's tenants
   - Password reset for user
   - Impersonate user (login as them)

5. **Feature Flags**
   - Enable/disable features per tenant
   - Beta feature rollout
   - Plan-specific feature gates

### Implementation

Create separate routes under `/admin/*` protected by super-admin role:

```
/admin/dashboard
/admin/tenants
/admin/tenants/:id
/admin/users
/admin/revenue
/admin/settings
```

Use same codebase but different layout/context.

---

## 5.4 Promo Codes

Allow discount codes for marketing:

```sql
CREATE TABLE promo_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL, -- percentage, fixed
  discount_value INTEGER NOT NULL,
  applies_to TEXT, -- plan names, or 'all'
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Apply promo during checkout:
- Validate code exists and is valid
- Calculate discount
- Store promo_code_id on subscription
