# Phase 2: Admin/Owner Experience Improvements

> **Priority:** 🟠 High | **Estimated Effort:** 2-3 weeks

## Overview

Enhance the dashboard and admin tools to provide better visibility into business operations, reseller balances, and order management.

---

## 2.1 Enhanced Dashboard Analytics

### New Dashboard Widgets

#### Revenue Overview Card
- Display: Today, This Week, This Month totals
- Show percentage change from previous period
- Data source: Sum of `order_reseller_total` from delivered orders

#### Profit Summary Widget
- Calculate: `SUM(order_reseller_total) - SUM(order_total)`
- Show gross profit margin percentage
- Weekly/monthly trend indicator

#### Outstanding Balance Widget
- Sum of unpaid invoice balances across all resellers
- Aging breakdown:
  - 0-30 days: Normal color
  - 31-60 days: Warning (yellow)
  - 60+ days: Danger (red)

#### Top Performing Resellers
- Ranked by order volume or revenue
- Show top 5 with bar chart
- Quick link to reseller detail

#### Store Purchase Distribution
- Pie or bar chart
- Show percentage of orders per store
- Use store colors/logos

#### Order Status Pipeline
- Visual funnel: Pending → Bought → Packed → Delivered
- Show counts at each stage
- Clickable to filter orders

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/revenue` | Revenue stats by period |
| GET | `/api/dashboard/profit` | Profit summary |
| GET | `/api/dashboard/balances` | Outstanding balances |
| GET | `/api/dashboard/top-resellers` | Top performers |
| GET | `/api/dashboard/store-distribution` | Order distribution by store |
| GET | `/api/dashboard/pipeline` | Order status counts |

### Implementation

1. Create `src/server/routes/dashboard.ts` with aggregate queries
2. Create reusable chart components using a lightweight library (Chart.js or Recharts)
3. Update `Dashboard.tsx` with new widget sections

---

## 2.2 Reseller Balance Management

### Ledger View

Create a transaction history view per reseller showing:
- Orders (debits to reseller account)
- Payments (credits to reseller account)
- Running balance after each transaction

```
Date        | Description          | Debit    | Credit   | Balance
------------|---------------------|----------|----------|--------
2026-01-01  | Order #1234         | ₱1,500   |          | ₱1,500
2026-01-02  | Order #1235         | ₱2,000   |          | ₱3,500
2026-01-03  | GCash Payment       |          | ₱1,500   | ₱2,000
```

### Statement of Account Export

Generate PDF/Excel with:
- Reseller details
- Date range
- All transactions
- Summary totals
- Due date if applicable

### Credit Limit Feature

- Add `credit_limit` column to resellers table
- Block new orders if balance exceeds limit
- Show warning when approaching limit (80%)

### Overdue Payment Alerts

- Highlight resellers with invoices past due
- Show overdue count on Resellers page
- Add "Overdue" filter option

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resellers/:id/ledger` | Transaction history |
| GET | `/api/resellers/:id/statement` | Generate statement PDF |
| PUT | `/api/resellers/:id/credit-limit` | Set credit limit |
| GET | `/api/resellers/overdue` | List overdue resellers |

---

## 2.3 Order Workflow Improvements

### Batch Order Entry

Allow CSV/Excel import with columns:
- `order_name`, `quantity`, `price`, `fee`, `reseller_price`
- `store_name` (match existing or create)
- `reseller_name` (match existing)

Validation:
- Required fields present
- Numeric values valid
- Store/reseller exists (or create option)

### Order Duplication

- Add "Duplicate" button on OrderCard
- Pre-fill form with existing order data
- Reset status to pending

### Bulk Status Update

- Checkbox selection on orders list
- "Update Status" dropdown when items selected
- Confirm modal showing affected orders

### Order Notes

- Add `internal_notes` column to orders table
- Display in expandable section on OrderCard
- Not visible to resellers (future portal)

### Order Timeline

- Create `order_history` table:
  ```sql
  CREATE TABLE order_history (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    previous_status TEXT,
    new_status TEXT,
    changed_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  ```
- Show timeline on order detail page

---

## 2.4 Store Management Enhancements

### Store Credit Terms

Add fields to stores table:
- `payment_terms` (enum: COD, net_15, net_30, net_60)
- `credit_limit` (for stores that offer credit)

### Store Order History

- Add aggregate stats on StoreCard
- Show: Total orders, Total spent, Last order date

### Store Contacts

Create `store_contacts` table:
```sql
CREATE TABLE store_contacts (
  id INTEGER PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  is_primary INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Store Categories

Add `category` column or create `store_categories` table for tagging:
- Cosmetics, Gadgets, Fashion, Food, etc.
- Allow multiple tags per store
- Filter stores by category
