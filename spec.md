# Pabili - Pasabuy Order Management System

> A PWA-based order management system for pasabuy (buy-on-behalf) businesses, designed for resellers and store operators in the Philippines.

## Project Overview

**Pabili** is a Progressive Web App that enables pasabuy businesses to manage orders, track payments, and generate invoices for their resellers. The system facilitates the traditional Filipino "pasabuy" model where a buyer procures items on behalf of resellers who then sell to end customers.

### Business Model

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Stores    │────▶│   Pabili    │────▶│  Resellers  │────▶│ End Buyers  │
│ (Suppliers) │     │  (Pasabuyer)│     │  (Sellers)  │     │ (Customers) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

- **Stores**: Suppliers/shops where items are purchased
- **Pabili Admin**: The pasabuyer who manages orders and procures items
- **Resellers**: Individuals who order through the pasabuyer and sell to end customers
- **Orders**: Items ordered by resellers, managed by the pasabuyer

---

## Tech Stack (2025 Production-Ready)

| Component | Technology | Status |
|-----------|------------|--------|
| **Framework** | React + Vite (via `npm create cloudflare@latest -- pabili --framework=react`) | ✅ Supported |
| **Backend** | Hono (GA adapters for Cloudflare Workers as of April 2025) | ✅ Production-Ready |
| **Database** | SQLite → Cloudflare D1 (serverless, edge-deployed) | ✅ Recommended |
| **ORM** | Drizzle ORM (type-safe, excellent D1 support) | ✅ Recommended |
| **Hosting** | Cloudflare Workers (edge computing, low latency) | ✅ Production-Ready |
| **Package Manager** | npm | ✅ Standard |
| **App Type** | PWA (Progressive Web App) | ✅ Best Practice |
| **File Storage** | Cloudflare R2 (for images) | ✅ Recommended |

### Why This Stack?

1. **Cloudflare Workers + D1**: Global edge deployment, low latency for Philippine users, generous free tier
2. **Hono**: Ultra-fast, lightweight, officially supported by Cloudflare for production use
3. **Drizzle ORM**: Type-safe schema definitions, automated migrations with `drizzle-kit`
4. **PWA**: Offline capabilities, installable on mobile devices without app store

---

## PWA Features & Requirements

### Core PWA Capabilities

- [ ] **Web App Manifest** (`manifest.json`)
  - App name, icons, theme colors
  - Display mode: `standalone`
  - Start URL configuration

- [ ] **Service Worker**
  - Cache-first strategy for static assets
  - Network-first strategy for API calls
  - Custom offline page
  - Background sync for offline order submissions

- [ ] **Offline Support**
  - View cached orders when offline
  - Queue order submissions for sync when online
  - Local storage for draft orders

- [ ] **Installability**
  - Add to home screen prompt
  - Splash screen configuration

### PWA Caching Strategies

| Resource Type | Strategy | Rationale |
|--------------|----------|-----------|
| Static assets (CSS, JS, images) | Cache-First | Rarely change, fast load |
| API responses (orders, stores) | Network-First + Cache | Needs fresh data, fallback available |
| User-uploaded images | Cache-First | Immutable once uploaded |
| Order submissions | Background Sync | Critical data, must not be lost |

---

## Pages / Features

### 1. Dashboard
- Overview of pending orders, recent payments
- Quick stats (total orders, pending payments, active resellers)
- Quick action buttons

### 2. Create Order Form

User inputs:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_name` | string | ✅ | Product/item name |
| `order_quantity` | number | ✅ | Quantity ordered |
| `order_price` | decimal | ✅ | Cost price per unit |
| `order_fee` | decimal | ✅ | Service/handling fee per unit |
| `order_reseller_price` | decimal | ✅ | Price charged to reseller per unit |
| `store_id` | foreign key | ✅ | Store where item is sourced |
| `reseller_id` | foreign key | ✅ | Reseller who placed the order |
| `order_image` | file (R2) | ❌ | Product image reference |
| `order_description` | text | ❌ | Additional notes/description |

**Auto-calculated fields:**
- `order_total` = `order_quantity * (order_price + order_fee)`
- `order_reseller_total` = `order_quantity * order_reseller_price`
- `profit_margin` = `order_reseller_total - order_total`

### 3. Orders Page
- List all orders with filtering and search
- Filter by: status, store, reseller, date range
- Bulk status updates
- Export to CSV/PDF
- Order cards on mobile, table on desktop

### 4. Stores Page
- Manage supplier/store information
- Store logo and cover image upload
- Contact information
- Active/inactive status
- Orders per store statistics

### 5. Resellers Page
- Manage reseller profiles
- Contact information and photo
- Order history per reseller
- Outstanding balance calculation
- Active/inactive status

### 6. Payments Page
- Track payments from resellers
- Payment methods (GCash, PayMaya, Bank Transfer, Cash)
- Payment proof upload (R2 storage)
- Link payments to invoices/orders
- Payment history and status

### 7. Invoices Page
- Generate invoices for resellers
- Auto-calculate totals from linked orders
- Invoice statuses (draft, sent, paid, overdue)
- Invoice PDF generation
- Due date tracking

### 8. Reports Page (Future Enhancement)
- Sales reports by period
- Top-performing resellers
- Store purchase analytics
- Profit/loss overview

---

## Database Schema

### Orders Table

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  
  -- Order Details
  order_name TEXT NOT NULL,
  order_description TEXT,
  order_quantity INTEGER NOT NULL DEFAULT 1,
  order_image TEXT,
  
  -- Pricing
  order_price REAL NOT NULL,           -- Cost per unit
  order_fee REAL NOT NULL DEFAULT 0,   -- Fee per unit
  order_reseller_price REAL NOT NULL,  -- Reseller price per unit
  
  -- Calculated (stored for performance)
  order_total REAL GENERATED ALWAYS AS (order_quantity * (order_price + order_fee)) STORED,
  order_reseller_total REAL GENERATED ALWAYS AS (order_quantity * order_reseller_price) STORED,
  
  -- Status
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    order_status IN ('pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock')
  ),
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  store_id INTEGER NOT NULL REFERENCES stores(id),
  reseller_id INTEGER NOT NULL REFERENCES resellers(id),
  invoice_id INTEGER REFERENCES invoices(id),
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  
  -- Indexes for common queries
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (reseller_id) REFERENCES resellers(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_reseller ON orders(reseller_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_date ON orders(order_date);
```

### Stores Table

```sql
CREATE TABLE stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Store Info
  store_name TEXT NOT NULL,
  store_address TEXT,
  store_phone TEXT,
  store_email TEXT,
  
  -- Media
  store_logo TEXT,
  store_cover TEXT,
  store_description TEXT,
  
  -- Status
  store_status TEXT NOT NULL DEFAULT 'active' CHECK (
    store_status IN ('active', 'inactive')
  ),
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_stores_status ON stores(store_status);
```

### Resellers Table

```sql
CREATE TABLE resellers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Reseller Info
  reseller_name TEXT NOT NULL,
  reseller_address TEXT,
  reseller_phone TEXT,
  reseller_email TEXT,
  
  -- Media
  reseller_photo TEXT,
  reseller_description TEXT,
  
  -- Status
  reseller_status TEXT NOT NULL DEFAULT 'active' CHECK (
    reseller_status IN ('active', 'inactive')
  ),
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX idx_resellers_status ON resellers(reseller_status);
```

### Payments Table

```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Payment Info
  payment_amount REAL NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (
    payment_method IN ('cash', 'gcash', 'paymaya', 'bank_transfer', 'other')
  ),
  payment_reference TEXT,
  payment_proof TEXT,          -- R2 URL for receipt image
  payment_notes TEXT,
  
  -- Status
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'confirmed', 'rejected')
  ),
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  reseller_id INTEGER NOT NULL REFERENCES resellers(id),
  invoice_id INTEGER REFERENCES invoices(id),
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  
  FOREIGN KEY (reseller_id) REFERENCES resellers(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE INDEX idx_payments_reseller ON payments(reseller_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(payment_date);
```

### Invoices Table

```sql
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Invoice Info
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_total REAL NOT NULL DEFAULT 0,
  invoice_paid REAL NOT NULL DEFAULT 0,
  invoice_balance REAL GENERATED ALWAYS AS (invoice_total - invoice_paid) STORED,
  
  invoice_notes TEXT,
  due_date DATE,
  
  -- Status
  invoice_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    invoice_status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')
  ),
  
  -- Relations
  reseller_id INTEGER NOT NULL REFERENCES resellers(id),
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  
  FOREIGN KEY (reseller_id) REFERENCES resellers(id)
);

CREATE INDEX idx_invoices_reseller ON invoices(reseller_id);
CREATE INDEX idx_invoices_status ON invoices(invoice_status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
```

### Images Table (R2 Integration)

This table serves as a metadata registry for all files stored in Cloudflare R2, enabling:
- Centralized file management
- Entity linking (polymorphic associations)
- File deduplication
- Usage tracking and cleanup

```sql
CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- R2 Storage Info
  r2_key TEXT NOT NULL UNIQUE,         -- Unique key in R2 bucket (e.g., "orders/abc123.jpg")
  r2_url TEXT NOT NULL,                -- Public/signed URL for access
  
  -- File Metadata
  original_filename TEXT NOT NULL,     -- Original uploaded filename
  file_size INTEGER NOT NULL,          -- Size in bytes
  mime_type TEXT NOT NULL,             -- MIME type (e.g., "image/jpeg")
  width INTEGER,                       -- Image width in pixels (null for non-images)
  height INTEGER,                      -- Image height in pixels (null for non-images)
  
  -- Polymorphic Association (links to any entity)
  entity_type TEXT NOT NULL CHECK (
    entity_type IN ('order', 'store', 'reseller', 'payment', 'invoice')
  ),
  entity_id INTEGER NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'primary' CHECK (
    image_type IN ('primary', 'logo', 'cover', 'proof', 'gallery', 'attachment')
  ),
  
  -- Optional metadata
  alt_text TEXT,                       -- Accessibility description
  caption TEXT,                        -- User-provided caption
  sort_order INTEGER DEFAULT 0,        -- For ordering multiple images
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

-- Indexes for efficient querying
CREATE INDEX idx_images_entity ON images(entity_type, entity_id);
CREATE INDEX idx_images_r2_key ON images(r2_key);
CREATE INDEX idx_images_type ON images(image_type);
```

### R2 Storage Structure

```
pabili-uploads/
├── orders/
│   ├── {order_id}/
│   │   ├── primary_{uuid}.{ext}      # Main product image
│   │   └── gallery_{uuid}.{ext}      # Additional images
├── stores/
│   ├── {store_id}/
│   │   ├── logo_{uuid}.{ext}         # Store logo
│   │   └── cover_{uuid}.{ext}        # Store cover image
├── resellers/
│   ├── {reseller_id}/
│   │   └── photo_{uuid}.{ext}        # Reseller profile photo
├── payments/
│   ├── {payment_id}/
│   │   └── proof_{uuid}.{ext}        # Payment proof/receipt
└── temp/
    └── {uuid}.{ext}                  # Temporary uploads (auto-cleanup)
```

### Image Processing Features

| Feature | Implementation | Notes |
|---------|----------------|-------|
| **Upload Validation** | Server-side | Max 10MB, allowed types: JPEG, PNG, WebP, GIF |
| **Image Resizing** | Cloudflare Images (optional) | Generate thumbnails on-the-fly |
| **Signed URLs** | R2 presigned URLs | Time-limited access for private files |
| **CDN Caching** | Cloudflare CDN | Cache-Control headers for performance |
| **Cleanup Job** | Scheduled Worker | Remove orphaned files from temp/ |

---

## API Endpoints (Hono Routes)

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders (with pagination, filters) |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id` | Update order |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Soft delete order |

### Stores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List all stores |
| GET | `/api/stores/:id` | Get single store |
| POST | `/api/stores` | Create new store |
| PUT | `/api/stores/:id` | Update store |
| DELETE | `/api/stores/:id` | Soft delete store |

### Resellers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resellers` | List all resellers |
| GET | `/api/resellers/:id` | Get single reseller |
| GET | `/api/resellers/:id/orders` | Get reseller's orders |
| GET | `/api/resellers/:id/balance` | Get reseller's outstanding balance |
| POST | `/api/resellers` | Create new reseller |
| PUT | `/api/resellers/:id` | Update reseller |
| DELETE | `/api/resellers/:id` | Soft delete reseller |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List all payments |
| GET | `/api/payments/:id` | Get single payment |
| POST | `/api/payments` | Record new payment |
| PUT | `/api/payments/:id` | Update payment |
| PATCH | `/api/payments/:id/confirm` | Confirm payment |
| DELETE | `/api/payments/:id` | Soft delete payment |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List all invoices |
| GET | `/api/invoices/:id` | Get single invoice |
| GET | `/api/invoices/:id/pdf` | Generate invoice PDF |
| POST | `/api/invoices` | Create new invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| PATCH | `/api/invoices/:id/status` | Update invoice status |
| DELETE | `/api/invoices/:id` | Soft delete invoice |

### File Upload (R2)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file to R2 |
| DELETE | `/api/upload/:key` | Delete file from R2 |

### Images (R2 Database)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/images` | List all images (with filters) |
| GET | `/api/images/:id` | Get single image metadata |
| GET | `/api/images/entity/:type/:id` | Get images for an entity (e.g., order, store) |
| POST | `/api/images` | Upload and register new image |
| POST | `/api/images/presigned` | Get presigned URL for direct upload |
| PUT | `/api/images/:id` | Update image metadata (alt text, caption) |
| PATCH | `/api/images/:id/reorder` | Update image sort order |
| DELETE | `/api/images/:id` | Delete image (removes from R2 and database) |
| DELETE | `/api/images/entity/:type/:id` | Delete all images for an entity |

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run development server (with local D1)
npm run dev

# Generate Drizzle migrations
npx drizzle-kit generate

# Apply migrations locally
npx drizzle-kit push

# Apply migrations to production D1
npx wrangler d1 migrations apply pabili-db --remote
```

### Deployment
```bash
# Deploy to Cloudflare Workers
npm run deploy
# or
npx wrangler deploy
```

---

## Environment Variables

### wrangler.toml Configuration
```toml
name = "pabili"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "DB"
database_name = "pabili-db"
database_id = "<your-database-id>"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "pabili-uploads"
```

---

## Security Considerations

- [ ] All endpoints served over HTTPS (Cloudflare default)
- [ ] Input validation on all API endpoints
- [ ] SQL injection prevention via Drizzle ORM parameterized queries
- [ ] File upload validation (type, size limits)
- [ ] Soft deletes for data retention
- [ ] Rate limiting on API endpoints

---

## Future Enhancements

1. **Multi-user Support**: Add authentication (Cloudflare Access, Auth0)
2. **Push Notifications**: Order status updates via Web Push API
3. **Analytics Dashboard**: Charts and insights
4. **WhatsApp Integration**: Order notifications via WhatsApp Business API
5. **Barcode/QR Scanning**: Quick product lookup
6. **Multi-currency**: Support for USD purchases (for OFW pasabuy)
7. **Inventory Tracking**: Stock levels per store

---

## Viability Assessment

| Criteria | Status | Notes |
|----------|--------|-------|
| **Tech Stack Viability** | ✅ Excellent | All technologies are production-ready as of 2025 |
| **Scalability** | ✅ High | Cloudflare's edge network handles global scale |
| **Cost** | ✅ Low | Generous free tiers for D1, Workers, R2 |
| **Developer Experience** | ✅ Good | TypeScript, hot reload, type-safe ORM |
| **Mobile Experience** | ✅ Good | PWA provides native-like experience |
| **Offline Capability** | ✅ Achievable | Service workers + background sync |
| **Market Fit** | ✅ Strong | Addresses real needs in PH pasabuy market |

### Conclusion

The Pabili project is **highly viable** with the chosen tech stack. The combination of Cloudflare Workers, D1, Hono, and Drizzle ORM provides a modern, scalable, and cost-effective solution that is well-suited for the pasabuy business model in the Philippines.