# Phase 6 Tasks: Advanced Features

## 6.1 Reporting & Analytics

- [ ] Create `src/server/routes/reports.ts`
- [ ] Implement sales report with date/store/reseller filters
- [ ] Implement profit/loss report
- [ ] Implement reseller performance report
- [ ] Add Excel export using xlsx library
- [ ] Add PDF export using jsPDF
- [ ] Create `ReportsPage.tsx` with report selection
- [ ] Add date range picker for reports
- [ ] Implement scheduled email reports (Cron)

---

## 6.2 Inventory Tracking

- [ ] Create `products` table in schema
- [ ] Create CRUD endpoints for products
- [ ] Create `ProductsPage.tsx` and `ProductForm.tsx`
- [ ] Add product selector to OrderForm
- [ ] Implement stock quantity tracking
- [ ] Add low stock alerts (notification)
- [ ] Track supplier price history

---

## 6.3 Reseller Portal

- [ ] Create separate reseller auth flow
- [ ] Create reseller login page
- [ ] Create reseller dashboard
- [ ] Show reseller's orders
- [ ] Show reseller's payment history
- [ ] Optional: Order request form

---

## 6.4 Automation & Integrations

- [ ] Define webhook events (order.created, etc.)
- [ ] Create `webhooks` table for subscriptions
- [ ] Create webhook delivery system
- [ ] Document public API endpoints
- [ ] Create API key management

---

## 6.5 PWA Enhancements

- [ ] Implement offline order queue in IndexedDB
- [ ] Add background sync for failed requests
- [ ] Cache recent data for offline access
- [ ] Improve install prompt UX
