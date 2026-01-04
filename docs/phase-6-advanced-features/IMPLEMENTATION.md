# Phase 6: Advanced Features

> **Priority:** 🟢 Nice to Have | **Estimated Effort:** 4-6 weeks

## 6.1 Reporting & Analytics

### Sales Report
- Revenue by period, store, reseller
- Export to Excel/PDF
- Scheduled email reports

### Profit & Loss Report
- Detailed margin analysis per order
- Cost breakdown vs revenue

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/sales` | Sales report with filters |
| GET | `/api/reports/profit` | Profit/loss report |
| GET | `/api/reports/reseller-performance` | Reseller analytics |
| GET | `/api/reports/export/:type` | Export as Excel/PDF |

---

## 6.2 Inventory Tracking

### Product Catalog
- Reusable product items with set prices
- Quick selection in order form

### Stock Levels
- Track available quantity per product
- Low stock alerts
- Supplier price history

### Database Schema
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  name TEXT NOT NULL,
  sku TEXT,
  default_price REAL,
  default_fee REAL,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6.3 Reseller Portal

Self-service portal for resellers:
- Login with phone/email
- View their orders and status
- View payment history
- Submit new order requests

---

## 6.4 Automation & Integrations

- Zapier/Make integration
- Google Sheets sync
- Webhook events on order changes
- Public REST API for custom integrations

---

## 6.5 Offline & PWA Enhancements

- Offline order creation queue
- Cached data access
- Background sync for failed requests
- Better install prompt UX
