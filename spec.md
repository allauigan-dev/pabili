# Pabili - Multi-Tenant Pasabuy Order Management SaaS

> A PWA-based SaaS platform enabling multiple pasabuy (buy-on-behalf) businesses in the Philippines to manage their orders, track payments, and generate invoices independently.

## Project Overview

**Pabili** is a multi-tenant Progressive Web App that empowers pasabuy businesses to operate their own order management system. Each business operates as an **Organization** with isolated data, users, and settings.

### SaaS Business Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PABILI SAAS PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│  │   Organization A     │  │   Organization B     │  │  Organization C │   │
│  │   (Pabili Operator)  │  │   (Pabili Operator)  │  │ (Pabili Operator)│  │
│  ├──────────────────────┤  ├──────────────────────┤  ├─────────────────┤   │
│  │ - Own Stores         │  │ - Own Stores         │  │ - Own Stores    │   │
│  │ - Own Customers      │  │ - Own Customers      │  │ - Own Customers │   │
│  │ - Own Orders         │  │ - Own Orders         │  │ - Own Orders    │   │
│  │ - Own Payments       │  │ - Own Payments       │  │ - Own Payments  │   │
│  │ - Own Invoices       │  │ - Own Invoices       │  │ - Own Invoices  │   │
│  │ - Team Members       │  │ - Team Members       │  │ - Team Members  │   │
│  └──────────────────────┘  └──────────────────────┘  └─────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
             ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
             │   Stores    │   │  Customers  │   │ End Buyers  │
             │ (Suppliers) │   │  (Resellers)│   │ (Consumers) │
             └─────────────┘   └─────────────┘   └─────────────┘
```

### Key SaaS Features

| Feature | Description |
|---------|-------------|
| **Multi-Tenancy** | Complete data isolation per organization |
| **Custom Domains** | Each org can use `{slug}.pabili.app` or custom domain |
| **Team Collaboration** | Invite team members with role-based access |
| **Self-Service Onboarding** | Users sign up and create their organization |
| **Centralized Auth** | Single sign-on across organizations |

---

## Tech Stack (2025 Production-Ready)

| Component | Technology | Status |
|-----------|------------|--------|
| **Framework** | React + Vite | ✅ Production-Ready |
| **Backend** | Hono (Cloudflare Workers) | ✅ Production-Ready |
| **Database** | Cloudflare D1 (SQLite) | ✅ Recommended |
| **ORM** | Drizzle ORM | ✅ Recommended |
| **Authentication** | Better Auth | ✅ Production-Ready |
| **Hosting** | Cloudflare Workers | ✅ Production-Ready |
| **File Storage** | Cloudflare R2 | ✅ Recommended |
| **Package Manager** | npm | ✅ Standard |
| **App Type** | PWA | ✅ Best Practice |

### Why This Stack?

1. **Cloudflare Workers + D1**: Global edge deployment, low latency, generous free tier
2. **Hono**: Ultra-fast, lightweight, officially supported by Cloudflare
3. **Better Auth**: Modern auth library with organization plugin for multi-tenancy
4. **Drizzle ORM**: Type-safe schema, automated migrations
5. **PWA**: Offline capabilities, installable without app store

---

## SaaS Architecture

### Multi-Tenancy Model

Pabili uses **Organization-based tenancy** where all business data is scoped by `organizationId`:

```
┌─────────────────────────────────────────┐
│              User Account               │
│  (Can belong to multiple orgs)          │
└─────────────────┬───────────────────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
┌────▼────┐ ┌────▼────┐ ┌────▼────┐
│  Org A  │ │  Org B  │ │  Org C  │
│ (Owner) │ │ (Admin) │ │(Member) │
└────┬────┘ └────┬────┘ └────┬────┘
     │            │            │
  Isolated     Isolated     Isolated
    Data         Data         Data
```

### Data Isolation Rules

- All business tables have `organizationId` foreign key
- API queries MUST filter by active organization
- R2 file paths prefixed with organization ID
- Cross-organization access is prohibited

### User Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full access, manage billing, delete org |
| **Admin** | Full data access, invite members |
| **Member** | CRUD on assigned resources |

---

## Authentication & Authorization

### Better Auth Integration

Pabili uses [Better Auth](https://better-auth.com) with the Organization plugin:

```typescript
// Auth Providers
- Email/Password
- Google OAuth
- Facebook OAuth (optional)

// Organization Features
- Create organization
- Invite members via email
- Role-based access control
- Switch between organizations
```

### Auth Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sign Up    │────▶│ Create Org   │────▶│  Dashboard   │
│              │     │  (Required)  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Sign In    │────▶│ Select Org   │────▶ Dashboard
│              │     │ (if multiple)│
└──────────────┘     └──────────────┘
```

### Session Context

```typescript
// Every authenticated request includes:
{
  userId: string,
  activeOrganizationId: string,
  role: 'owner' | 'admin' | 'member'
}
```

---

## Onboarding Flow

### New User Registration

1. **Sign Up**: User registers with email/password or OAuth
2. **Email Verification**: Verify email address
3. **Create Organization**: Setup first organization
   - Organization name
   - Organization slug (for subdomain)
   - Optional: Upload logo
4. **Welcome Tour**: Quick overview of features
5. **Dashboard**: Land on main dashboard

### Invite Flow (For Team Members)

1. **Receive Invitation**: Email with invite link
2. **Accept/Register**: Create account if new, or sign in
3. **Join Organization**: Automatically added to org
4. **Dashboard**: Access shared organization data

### Organization Setup

```typescript
interface OrganizationSetup {
  name: string;           // "Juan's Pasabuy"
  slug: string;          // "juans-pasabuy" → juans-pasabuy.pabili.app
  logo?: string;         // R2 uploaded image
  timezone: string;      // "Asia/Manila"
  currency: string;      // "PHP"
}
```

---

## Custom Domains

### Subdomain Support

Every organization gets a unique subdomain:

```
https://{org-slug}.pabili.app
```

Example: `https://juans-pasabuy.pabili.app`

### Custom Domain (Future)

Organizations can connect their own domain:

```
https://orders.juanspasabuy.com → juans-pasabuy.pabili.app
```

**Implementation via Cloudflare for SaaS:**
- Custom hostname provisioning
- Automatic SSL certificates
- DNS CNAME verification

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
- Quick stats (total orders, pending payments, active customers)
- Quick action buttons

### 2. Create Order Form

User inputs:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_name` | string | ✅ | Product/item name |
| `order_quantity` | number | ✅ | Quantity ordered |
| `order_price` | decimal | ✅ | Cost price per unit |
| `order_fee` | decimal | ✅ | Service/handling fee per unit |
| `order_customer_price` | decimal | ✅ | Price charged to customer per unit |
| `store_id` | foreign key | ✅ | Store where item is sourced |
| `customer_id` | foreign key | ✅ | Customer who placed the order |
| `order_image` | file (R2) | ❌ | Product image reference |
| `order_description` | text | ❌ | Additional notes/description |

**Auto-calculated fields:**
- `order_total` = `order_quantity * (order_price + order_fee)`
- `order_customer_total` = `order_quantity * order_customer_price`
- `profit_margin` = `order_customer_total - order_total`

### 3. Orders Page
- List all orders with filtering and search
- Filter by: status, store, customer, date range
- Bulk status updates
- Export to CSV/PDF
- Order cards on mobile, table on desktop

### 4. Stores Page
- Manage supplier/store information
- Store logo and cover image upload
- Contact information
- Active/inactive status
- Orders per store statistics

### 5. Customers Page
- Manage customer profiles
- Contact information and photo
- Order history per customer
- Outstanding balance calculation
- Active/inactive status

### 6. Payments Page
- Track payments from customers
- Payment methods (GCash, PayMaya, Bank Transfer, Cash)
- Payment proof upload (R2 storage)
- Link payments to invoices/orders
- Payment history and status

### 7. Invoices Page
- Generate invoices for customers
- Auto-calculate totals from linked orders
- Invoice statuses (draft, sent, paid, overdue)
- Invoice PDF generation
- Due date tracking

### 8. Settings Page
- Organization settings
- Team member management
- Invite new members
- Custom domain configuration (future)

---

## Database Schema

### Authentication Tables (Better Auth)

```sql
-- Users (global, can belong to multiple orgs)
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Sessions
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES user(id),
  active_organization_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- OAuth Accounts
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id),
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Email Verification
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
```

### Organization Tables (Multi-Tenancy)

```sql
-- Organizations (Tenants)
CREATE TABLE organization (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo TEXT,
  created_at INTEGER NOT NULL,
  metadata TEXT
);

-- Organization Members
CREATE TABLE member (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organization(id),
  user_id TEXT NOT NULL REFERENCES user(id),
  role TEXT NOT NULL, -- 'owner', 'admin', 'member'
  created_at INTEGER NOT NULL
);

-- Pending Invitations
CREATE TABLE invitation (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organization(id),
  email TEXT NOT NULL,
  role TEXT,
  status TEXT NOT NULL, -- 'pending', 'accepted', 'expired'
  expires_at INTEGER NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) -- inviter
);
```

### Stores Table

```sql
CREATE TABLE stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT REFERENCES organization(id),
  
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
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE INDEX idx_stores_org ON stores(organization_id);
CREATE INDEX idx_stores_status ON stores(store_status);
```

### Customers Table

```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT REFERENCES organization(id),
  
  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  
  -- Media
  customer_photo TEXT,
  customer_description TEXT,
  
  -- Status
  customer_status TEXT NOT NULL DEFAULT 'active' CHECK (
    customer_status IN ('active', 'inactive')
  ),
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_customers_status ON customers(customer_status);
```

### Orders Table

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT REFERENCES organization(id),
  order_number TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  
  -- Order Details
  order_name TEXT NOT NULL,
  order_description TEXT,
  order_quantity INTEGER NOT NULL DEFAULT 1,
  order_image TEXT,
  order_images TEXT, -- JSON array
  
  -- Pricing
  order_price REAL NOT NULL,           -- Cost per unit
  order_fee REAL NOT NULL DEFAULT 0,   -- Fee per unit
  order_customer_price REAL NOT NULL,  -- Customer price per unit
  
  -- Calculated (stored for performance)
  order_total REAL,           -- quantity * (price + fee)
  order_customer_total REAL,  -- quantity * customer_price
  
  -- Status
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    order_status IN ('pending', 'bought', 'packed', 'delivered', 'cancelled', 'no_stock')
  ),
  order_date TEXT DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  store_id INTEGER NOT NULL REFERENCES stores(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  invoice_id INTEGER REFERENCES invoices(id),
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE INDEX idx_orders_org ON orders(organization_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_date ON orders(order_date);
```

### Payments Table

```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT REFERENCES organization(id),
  
  -- Payment Info
  payment_amount REAL NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (
    payment_method IN ('cash', 'gcash', 'paymaya', 'bank_transfer', 'other')
  ),
  payment_reference TEXT,
  payment_proof TEXT,
  payment_notes TEXT,
  
  -- Status
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'confirmed', 'rejected')
  ),
  payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
  
  -- Relations
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  invoice_id INTEGER REFERENCES invoices(id),
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE INDEX idx_payments_org ON payments(organization_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
```

### Invoices Table

```sql
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT REFERENCES organization(id),
  
  -- Invoice Info
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_total REAL NOT NULL DEFAULT 0,
  invoice_paid REAL NOT NULL DEFAULT 0,
  invoice_notes TEXT,
  due_date TEXT,
  
  -- Status
  invoice_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    invoice_status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')
  ),
  
  -- Relations
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(invoice_status);
```

### Images Table (R2 Integration)

```sql
CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT REFERENCES organization(id),
  
  -- R2 Storage Info
  r2_key TEXT NOT NULL UNIQUE,
  r2_url TEXT NOT NULL,
  
  -- File Metadata
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  
  -- Polymorphic Association
  entity_type TEXT NOT NULL CHECK (
    entity_type IN ('order', 'store', 'customer', 'payment', 'invoice')
  ),
  entity_id INTEGER NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'primary' CHECK (
    image_type IN ('primary', 'logo', 'cover', 'proof', 'gallery', 'attachment')
  ),
  
  -- Optional metadata
  alt_text TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE INDEX idx_images_org ON images(organization_id);
CREATE INDEX idx_images_entity ON images(entity_type, entity_id);
```

### R2 Storage Structure (Org-Scoped)

```
pabili-uploads/
├── {org_id}/
│   ├── orders/
│   │   └── {order_id}/
│   │       ├── primary_{uuid}.{ext}
│   │       └── gallery_{uuid}.{ext}
│   ├── stores/
│   │   └── {store_id}/
│   │       ├── logo_{uuid}.{ext}
│   │       └── cover_{uuid}.{ext}
│   ├── customers/
│   │   └── {customer_id}/
│   │       └── photo_{uuid}.{ext}
│   ├── payments/
│   │   └── {payment_id}/
│   │       └── proof_{uuid}.{ext}
│   └── org/
│       └── logo_{uuid}.{ext}
└── temp/
    └── {uuid}.{ext}
```

---

## API Endpoints (Hono Routes)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register with email/password |
| POST | `/api/auth/sign-in/email` | Sign in with email/password |
| POST | `/api/auth/sign-in/social` | OAuth sign in |
| POST | `/api/auth/sign-out` | Sign out |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | List user's organizations |
| GET | `/api/organizations/:id` | Get organization details |
| POST | `/api/organizations` | Create new organization |
| PUT | `/api/organizations/:id` | Update organization |
| DELETE | `/api/organizations/:id` | Delete organization (owner only) |
| POST | `/api/organizations/:id/switch` | Switch active organization |
| GET | `/api/organizations/:id/members` | List members |
| POST | `/api/organizations/:id/invite` | Invite member |
| DELETE | `/api/organizations/:id/members/:memberId` | Remove member |

### Orders (Org-Scoped)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id` | Update order |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Soft delete order |

### Stores (Org-Scoped)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List all stores |
| GET | `/api/stores/:id` | Get single store |
| POST | `/api/stores` | Create new store |
| PUT | `/api/stores/:id` | Update store |
| DELETE | `/api/stores/:id` | Soft delete store |

### Customers (Org-Scoped)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get single customer |
| GET | `/api/customers/:id/orders` | Get customer's orders |
| GET | `/api/customers/:id/balance` | Get customer's outstanding balance |
| POST | `/api/customers` | Create new customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Soft delete customer |

### Payments (Org-Scoped)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List all payments |
| GET | `/api/payments/:id` | Get single payment |
| POST | `/api/payments` | Record new payment |
| PUT | `/api/payments/:id` | Update payment |
| PATCH | `/api/payments/:id/confirm` | Confirm payment |
| DELETE | `/api/payments/:id` | Soft delete payment |

### Invoices (Org-Scoped)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List all invoices |
| GET | `/api/invoices/:id` | Get single invoice |
| GET | `/api/invoices/:id/pdf` | Generate invoice PDF |
| POST | `/api/invoices` | Create new invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| PATCH | `/api/invoices/:id/status` | Update invoice status |
| DELETE | `/api/invoices/:id` | Soft delete invoice |

### File Upload (Org-Scoped)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file to R2 |
| DELETE | `/api/upload/:key` | Delete file from R2 |
| GET | `/api/images` | List images |
| POST | `/api/images/presigned` | Get presigned upload URL |

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Apply local migrations (required before first run)
npx wrangler d1 migrations apply pabili-db --local

# Run development server
npm run dev

# Generate Drizzle migrations
npx drizzle-kit generate

# Apply migrations to production D1
npx wrangler d1 migrations apply pabili-db --remote
```

### Deployment
```bash
# Deploy to Cloudflare Workers
npm run deploy
```

---

## Environment Variables

### wrangler.jsonc Configuration
```jsonc
{
  "name": "pabili",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "pabili-db",
      "database_id": "<your-database-id>"
    }
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "pabili-uploads"
    }
  ]
}
```

### Auth Environment Variables
```bash
# .dev.vars
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Security Considerations

- [x] All endpoints served over HTTPS (Cloudflare default)
- [x] Input validation on all API endpoints (Zod)
- [x] SQL injection prevention via Drizzle ORM
- [x] Organization-scoped data access
- [ ] File upload validation (type, size limits)
- [ ] Soft deletes for data retention
- [ ] Rate limiting on API endpoints
- [ ] CSRF protection on auth endpoints

---

## Future Enhancements (Roadmap)

### Phase 1: Core SaaS (Current)
- [x] Multi-tenancy with organizations
- [x] Better Auth integration
- [ ] Complete onboarding flow
- [ ] Custom subdomains

### Phase 2: Monetization
- [ ] Subscription tiers (Free, Pro, Business)
- [ ] Feature limits per tier
- [ ] Stripe/payment integration
- [ ] Usage-based billing

### Phase 3: Advanced Features
- [ ] Push Notifications via Web Push API
- [ ] Analytics Dashboard with charts
- [ ] WhatsApp Integration for order notifications
- [ ] Custom domains with SSL
- [ ] Inventory Tracking per store
- [ ] Multi-currency support (USD for OFW pasabuy)

### Phase 4: Scale
- [ ] Barcode/QR scanning for products
- [ ] API access for integrations
- [ ] White-label options
- [ ] Mobile app (React Native)

---

## Viability Assessment

| Criteria | Status | Notes |
|----------|--------|-------|
| **Tech Stack Viability** | ✅ Excellent | All technologies production-ready as of 2025 |
| **Scalability** | ✅ High | Cloudflare edge network handles global scale |
| **Multi-Tenancy** | ✅ Implemented | Organization-based isolation |
| **Cost** | ✅ Low | Generous free tiers for D1, Workers, R2 |
| **Developer Experience** | ✅ Good | TypeScript, hot reload, type-safe ORM |
| **Mobile Experience** | ✅ Good | PWA provides native-like experience |
| **Offline Capability** | ✅ Achievable | Service workers + background sync |
| **Market Fit** | ✅ Strong | Addresses real needs in PH pasabuy market |

### Conclusion

Pabili as a **multi-tenant SaaS platform** is highly viable. The combination of Cloudflare Workers, D1, Hono, Better Auth, and Drizzle ORM provides a modern, scalable, and cost-effective solution for the pasabuy business model in the Philippines.