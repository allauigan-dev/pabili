# Phase 5 Tasks: Billing & Subscription

## 5.1 Subscription Plans

### Database
- [ ] Create `plans` table in schema
- [ ] Create `subscriptions` table in schema  
- [ ] Create `usage_records` table in schema
- [ ] Seed default plans (Free, Pro, Business)

### Limit Enforcement
- [ ] Create `src/server/middleware/limits.ts`
- [ ] Check limits on order/store/reseller creation
- [ ] Return 402 with upgrade prompt when limit reached

### Usage Tracking
- [ ] Create `src/server/lib/usage.ts`
- [ ] Track counts per period
- [ ] Create usage API endpoint

---

## 5.2 Billing Integration (PayMongo)

### Setup
- [ ] Create PayMongo account and get API keys
- [ ] Add keys to environment variables

### Backend
- [ ] Create `src/server/routes/billing.ts`
- [ ] Implement subscribe/cancel/reactivate endpoints
- [ ] Create webhook handler for payment events

### Frontend
- [ ] Create `BillingPage.tsx` in settings
- [ ] Show current plan and upgrade options

---

## 5.3 Admin Portal

- [ ] Create super-admin role check
- [ ] Create admin dashboard with tenant/revenue stats
- [ ] Create tenant management pages
- [ ] Create user management pages

---

## 5.4 Promo Codes

- [ ] Create `promo_codes` table
- [ ] Create validation endpoint
- [ ] Apply discount in checkout flow
