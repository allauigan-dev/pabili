# Phase 2 Tasks: Admin/Owner Experience Improvements

## 2.1 Enhanced Dashboard Analytics

### Backend - Dashboard Routes
- [ ] Create `src/server/routes/dashboard.ts`
- [ ] Implement GET `/api/dashboard/revenue` with period params
- [ ] Implement GET `/api/dashboard/profit` with margin calculation
- [ ] Implement GET `/api/dashboard/balances` with aging breakdown
- [ ] Implement GET `/api/dashboard/top-resellers` (top 5)
- [ ] Implement GET `/api/dashboard/store-distribution`
- [ ] Implement GET `/api/dashboard/pipeline` (status counts)

### Frontend - Chart Components
- [ ] Install charting library (Chart.js or Recharts)
- [ ] Create `src/client/components/charts/BarChart.tsx`
- [ ] Create `src/client/components/charts/PieChart.tsx`
- [ ] Create `src/client/components/charts/LineChart.tsx`

### Frontend - Dashboard Widgets
- [ ] Create `RevenueCard.tsx` with period toggle
- [ ] Create `ProfitSummaryCard.tsx` with trend indicator
- [ ] Create `OutstandingBalanceCard.tsx` with aging bars
- [ ] Create `TopResellersWidget.tsx` with mini bar chart
- [ ] Create `StoreDistributionWidget.tsx` with pie chart
- [ ] Create `OrderPipelineWidget.tsx` with funnel visualization

### Dashboard Integration
- [ ] Update `Dashboard.tsx` layout to include new widgets
- [ ] Add responsive grid for widget placement
- [ ] Add loading skeletons for each widget
- [ ] Create `useDashboardStats` hook for data fetching

---

## 2.2 Reseller Balance Management

### Database Changes
- [ ] Add `credit_limit` column to resellers table
- [ ] Create migration and apply

### Ledger Feature
- [ ] Create GET `/api/resellers/:id/ledger` endpoint
- [ ] Query orders + payments, sort by date
- [ ] Calculate running balance
- [ ] Create `src/client/pages/resellers/ResellerLedger.tsx`
- [ ] Add "View Ledger" button on ResellerCard

### Statement Export
- [ ] Install PDF library (jsPDF or pdfmake)
- [ ] Create GET `/api/resellers/:id/statement` endpoint
- [ ] Generate PDF with header, transactions, totals
- [ ] Add "Download Statement" button on ledger page

### Credit Limit
- [ ] Add credit_limit field to ResellerForm
- [ ] Display credit limit on ResellerCard
- [ ] Show warning badge when balance > 80% of limit
- [ ] Block order creation when over limit (with override option)

### Overdue Alerts
- [ ] Create GET `/api/resellers/overdue` endpoint
- [ ] Add "Overdue" badge on ResellerCard
- [ ] Add "Overdue" filter on ResellersPage
- [ ] Show overdue count on Dashboard

---

## 2.3 Order Workflow Improvements

### Batch Order Entry
- [ ] Create order import CSV template
- [ ] Create `src/client/pages/orders/ImportOrders.tsx`
- [ ] Implement CSV parsing and validation
- [ ] Show preview table before import
- [ ] Create POST `/api/orders/batch` endpoint
- [ ] Handle errors and partial imports

### Order Duplication
- [ ] Add "Duplicate" button to OrderCard
- [ ] Navigate to OrderForm with pre-filled data
- [ ] Clear order_id and status for new order

### Bulk Status Update
- [ ] Add checkbox column to order list
- [ ] Create selection state management
- [ ] Add bulk action bar when items selected
- [ ] Create PATCH `/api/orders/bulk-status` endpoint
- [ ] Show confirmation modal with affected order count

### Order Notes
- [ ] Add `internal_notes` column to orders table
- [ ] Add notes field to OrderForm
- [ ] Display notes on OrderCard (collapsible)

### Order Timeline
- [ ] Create `order_history` table in schema
- [ ] Insert history record on status change
- [ ] Create GET `/api/orders/:id/history` endpoint
- [ ] Create `OrderTimeline.tsx` component
- [ ] Display on order detail/edit page

---

## 2.4 Store Management Enhancements

### Store Credit Terms
- [ ] Add `payment_terms` column to stores table
- [ ] Add `credit_limit` column to stores table
- [ ] Add fields to StoreForm
- [ ] Display payment terms on StoreCard

### Store Order History
- [ ] Add aggregate query for store stats
- [ ] Display total orders, total spent on StoreCard
- [ ] Show last order date

### Store Contacts
- [ ] Create `store_contacts` table in schema
- [ ] Create CRUD endpoints for contacts
- [ ] Create contacts section in StoreForm
- [ ] Allow multiple contacts with primary flag

### Store Categories
- [ ] Add `category` column or tags table
- [ ] Define default categories
- [ ] Add category selector to StoreForm
- [ ] Add category filter on StoresPage

---

## Testing

- [ ] Test dashboard API aggregations
- [ ] Test ledger calculation accuracy
- [ ] Test PDF statement generation
- [ ] Test credit limit enforcement
- [ ] Test batch import with valid/invalid CSV
- [ ] Test bulk status update
- [ ] Test order duplication
