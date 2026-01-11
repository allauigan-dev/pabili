---
description: Track changes to app business workflows and document feature implementation
---

# Business Workflow Tracker

Use this workflow when implementing new business features or modifying existing workflows in Pabili.

## App Business Workflows

The following are the core business workflows in the app:

### 1. Order Lifecycle
```
pending → bought → packed → shipped → delivered
                        ↘ cancelled / no_stock
```

**Key Files:**
- Schema: `src/server/db/schema.ts` (orders table)
- API: `src/server/routes/orders.ts`
- UI: `src/client/pages/orders/`

### 2. Buy List Workflow
Pending orders grouped by store for efficient purchasing.

```
Orders (pending) → Buy List Page → Store Page → Mark as Bought
```

**Key Files:**
- `src/client/pages/buylist/BuyListPage.tsx`
- `src/client/pages/buylist/BuyListStorePage.tsx`

### 3. Packaging Workflow
Bought orders grouped by customer for packing.

```
Orders (bought) → Packaging Page → Customer Page → Select Orders → Mark as Packed (with photo)
```

**Key Files:**
- `src/client/pages/packaging/PackagingPage.tsx`
- `src/client/pages/packaging/PackagingCustomerPage.tsx`

### 4. Shipments Workflow
Packed orders bundled into shipments with tracking.

```
Orders (packed) → Shipments Page → Customer Selection → Create Shipment → Track Delivery
```

**Key Files:**
- Schema: `src/server/db/schema.ts` (shipments table)
- API: `src/server/routes/shipments.ts`
- UI: `src/client/pages/shipments/`

### 5. Invoice & Payment Workflow
```
Orders (delivered) → Create Invoice → Send to Customer → Record Payment → Mark Paid
```

**Key Files:**
- `src/client/pages/invoices/`
- `src/client/pages/payments/`
- API: `src/server/routes/invoices.ts`, `src/server/routes/payments.ts`

---

## Adding a New Business Feature

Follow these steps when implementing a new business workflow:

### Step 1: Plan & Document

1. Identify the workflow stages and status transitions
2. Determine which existing entities are affected
3. Check if schema changes are needed:
```bash
cat src/server/db/schema.ts | grep -A 20 "tableName"
```

### Step 2: Schema Changes (if needed)

// turbo
1. Generate migration after modifying schema:
```bash
npm run db:generate
```

// turbo
2. Apply migration locally:
```bash
npx wrangler d1 migrations apply pabili-db --local
```

### Step 3: Backend Implementation

1. Create/update API route in `src/server/routes/`
2. Register route in `src/server/index.ts`
3. Follow multi-tenancy rules:
```typescript
// Always scope by organizationId
.where(eq(table.organizationId, session.session.activeOrganizationId))
```

### Step 4: Frontend Implementation

1. Create page component(s) in `src/client/pages/{feature}/`
2. Add API functions in `src/client/lib/api.ts`
3. Add route in `src/client/App.tsx`
4. Add navigation entry in Sidebar/BottomNav if needed

### Step 5: Update Navigation

For new features that need navigation:
1. Add to `src/client/components/layout/Sidebar.tsx`
2. Add to `src/client/hooks/useNavConfig.ts` (for bottom nav)
3. Update `NavigationSection.tsx` in Settings if configurable

---

## Status Tracking

### Order Status Values
| Status | Description | Next Statuses |
|--------|-------------|---------------|
| `pending` | Initial state, awaiting purchase | `bought`, `cancelled`, `no_stock` |
| `bought` | Purchased from store | `packed`, `cancelled` |
| `packed` | Ready for shipping | `shipped`, `cancelled` |
| `shipped` | In transit (linked to shipment) | `delivered`, `cancelled` |
| `delivered` | Successfully delivered | - |
| `cancelled` | Cancelled at any stage | - |
| `no_stock` | Not available from store | - |

### Invoice Status Values
| Status | Description |
|--------|-------------|
| `draft` | Not yet sent |
| `sent` | Sent to customer |
| `partial` | Partially paid |
| `paid` | Fully paid |
| `overdue` | Past due date |
| `cancelled` | Cancelled |

### Payment Status Values
| Status | Description |
|--------|-------------|
| `pending` | Awaiting confirmation |
| `confirmed` | Payment verified |
| `rejected` | Payment invalid |

### Shipment Status Values
| Status | Description |
|--------|-------------|
| `pending` | Created, not yet shipped |
| `in_transit` | Currently shipping |
| `delivered` | Successfully delivered |
| `cancelled` | Shipment cancelled |

---

## Workflow Change Checklist

When modifying a business workflow, verify:

- [ ] Schema changes applied (`npm run db:generate` + migrate)
- [ ] API routes updated with proper validation
- [ ] Multi-tenancy filters in place
- [ ] Frontend pages created/updated
- [ ] Navigation added if needed
- [ ] Status transitions validated
- [ ] CHANGELOG.md updated with changes
- [ ] Tests added for new functionality

---

## Quick Reference Commands

// turbo-all

### Check current schema
```bash
cat src/server/db/schema.ts
```

### View migrations
```bash
ls -la drizzle/
```

### Run type check
```bash
npx tsc --noEmit
```

### Run tests
```bash
npm run test:run
```
