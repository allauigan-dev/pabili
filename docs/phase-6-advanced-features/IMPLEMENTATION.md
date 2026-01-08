# Phase 6: Advanced Features

> **Priority:** 🟢 Nice to Have | **Estimated Effort:** 4-6 weeks

## Overview

Advanced features that add significant value for pasabuy operators but are not essential for the MVP launch. These features differentiate Pabili from simple spreadsheet-based solutions.

---

## 6.1 Reporting & Analytics

### Sales Report
- Revenue by period, store, customer
- Export to Excel/PDF
- Scheduled email reports

### Profit & Loss Report
- Detailed margin analysis per order
- Cost breakdown vs revenue
- `profit_margin = order_customer_total - order_total`

### Statement of Account
- Complete transaction history per customer
- Orders (debits) vs Payments (credits)
- Running balance calculation
- Export as PDF for customer

```typescript
// Statement of Account Structure
interface StatementOfAccount {
  customer: Customer;
  dateRange: { from: Date; to: Date };
  openingBalance: number;
  transactions: Array<{
    date: Date;
    description: string;
    debit: number | null;  // Order total
    credit: number | null; // Payment amount
    balance: number;       // Running balance
  }>;
  closingBalance: number;
}
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/sales` | Sales report with filters |
| GET | `/api/reports/profit` | Profit/loss report |
| GET | `/api/reports/customer-performance` | Customer analytics |
| GET | `/api/reports/export/:type` | Export as Excel/PDF |
| GET | `/api/customers/:id/statement` | Statement of account |

---

## 6.2 Inventory Tracking (Deprioritized)

> **Note:** Inventory tracking adds complexity and may be considered for a future release. The current focus is on order management and payment tracking.

### Product Catalog (Future)
- Reusable product items with set prices
- Quick selection in order form

### Stock Levels (Future)
- Track available quantity per product
- Low stock alerts
- Supplier price history

### Database Schema (For Reference)
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  organization_id TEXT REFERENCES organization(id),
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

## 6.3 Customer Portal

Self-service portal for customers (resellers):
- Login with phone/email
- View their orders and status
- View payment history
- View outstanding balance
- Download invoices/statements
- Submit new order requests (optional)

### Implementation Approach
- Separate login flow for customers
- Read-only access to their org-scoped data
- Limited actions (view, download)

### Database Addition
```sql
-- Customer login credentials
CREATE TABLE customer_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id) UNIQUE,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT,
  is_active INTEGER DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6.4 Barcode/QR Scanning

From spec.md Phase 4 roadmap:

### Product Barcode Scanning
- Scan product barcodes to auto-fill order details
- Look up products from catalog
- Camera-based scanning using Web APIs

### QR Code for Payments
- Generate QR codes for GCash/Maya payments
- Include payment reference and amount
- Customer scans to pay

### Implementation
```typescript
import { BarcodeDetector } from 'barcode-detector';

async function scanBarcode(imageData: ImageBitmap) {
  const detector = new BarcodeDetector({
    formats: ['ean_13', 'ean_8', 'qr_code']
  });
  
  const barcodes = await detector.detect(imageData);
  return barcodes[0]?.rawValue;
}
```

---

## 6.5 Automation & Integrations

> **Note:** API/Webhook features moved to Phase 11 (API & Developer Platform).

### Google Sheets Sync
- Export orders to Google Sheets automatically
- Real-time sync on order creation/update
- Use Google Sheets API

### Scheduled Reports
- Daily/weekly summary emails
- Overdue invoice reminders
- Low balance alerts

---

## 6.6 Offline & PWA Enhancements

> **Note:** Core PWA features moved to Phase 12 (Performance & Scalability).

### Enhanced Offline Experience
- Offline order creation queue
- Cached data access (recent orders, customers)
- Visual indicator when offline
- Sync status display

### Better Install Prompt
- Custom install banner
- Benefits explanation
- "Add to Home Screen" guidance

---

## Feature Availability by Plan

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Sales Reports | Basic | Full | Full |
| Profit Reports | ❌ | ✅ | ✅ |
| Statement Export | ❌ | ✅ | ✅ |
| Customer Portal | ❌ | ❌ | ✅ |
| Barcode Scanning | ❌ | ✅ | ✅ |
| Google Sheets Sync | ❌ | ❌ | ✅ |
| Scheduled Reports | ❌ | ✅ | ✅ |
