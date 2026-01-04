# Pabili Feature Roadmap

> SaaS-focused feature roadmap for the Pabili Pasabuy Order Management System

## Legend

- 🔴 **Critical** - Must have for SaaS launch
- 🟠 **High Priority** - Important for user adoption
- 🟢 **Nice to Have** - Enhances value proposition

---

## Phase 1: Multi-Tenancy & Authentication (SaaS Foundation) 🔴

The system currently operates as a single-tenant application. For SaaS, multi-tenancy is essential.

### 1.1 User Authentication
- [ ] Implement login/registration with email/password
- [ ] Social login (Google, Facebook) for quick onboarding
- [ ] Session management with secure tokens
- [ ] Password reset via email
- [ ] Account verification flow

### 1.2 Multi-Tenant Architecture
- [ ] Add `tenant_id` to all database tables
- [ ] Create `tenants` table (business name, logo, subscription plan)
- [ ] Row-level security: users only see their tenant's data
- [ ] Subdomain or path-based tenant routing (e.g., `mybusiness.pabili.app`)
- [ ] Tenant-specific branding (logo, colors)

### 1.3 Role-Based Access Control
- [ ] **Owner** - Full access, billing, user management
- [ ] **Admin** - Manage orders, stores, resellers, view reports
- [ ] **Staff** - Create/update orders, limited view access
- [ ] Invite team members via email link

---

## Phase 2: Admin/Owner Experience Improvements 🟠

Features specifically for the business owner/admin to manage operations efficiently.

### 2.1 Enhanced Dashboard Analytics
- [ ] **Revenue Overview Card** - Today's total, this week, this month with percentage changes
- [ ] **Profit Summary** - Total profit margin (order_reseller_total - order_total) visualization
- [ ] **Outstanding Balance Widget** - Total receivables from all resellers with aging breakdown (0-30, 31-60, 60+ days)
- [ ] **Top Performing Resellers** - Ranked by order volume or revenue
- [ ] **Store Purchase Distribution** - Pie/bar chart showing which stores are ordered from most
- [ ] **Order Status Pipeline** - Visual funnel: Pending → Bought → Packed → Delivered

### 2.2 Reseller Balance Management
- [ ] **Ledger View** - Complete transaction history per reseller (orders vs payments)
- [ ] **Statement of Account Export** - PDF/Excel statement for reseller
- [ ] **Balance Alert Thresholds** - Set max credit limit per reseller
- [ ] **Overdue Payment Alerts** - Highlight resellers with unpaid invoices past due date
- [ ] **Partial Payment Tracking** - Track multiple payments against a single invoice

### 2.3 Order Workflow Improvements
- [ ] **Batch Order Entry** - Import orders via CSV/Excel (useful for Viber/Messenger order consolidation)
- [ ] **Order Duplication** - Clone an existing order for repeat customers
- [ ] **Bulk Status Update** - Select multiple orders and change status in one action
- [ ] **Order Notes/Comments** - Internal notes visible only to admin (e.g., "delayed at customs")
- [ ] **Order Timeline** - Log of all status changes with timestamps

### 2.4 Store Management Enhancements
- [ ] **Store Credit Terms** - Track if store offers credit (COD vs 30-day terms)
- [ ] **Store Order History** - Quick view of total purchases per store
- [ ] **Store Contacts** - Multiple contact persons per store
- [ ] **Store Categories/Tags** - Categorize stores (e.g., "Cosmetics", "Gadgets", "Food")

---

## Phase 3: UI/UX Improvements 🟠

### 3.1 Mobile-First Experience
- [ ] **Swipe Actions on Cards** - Swipe left to delete, swipe right to mark delivered
- [ ] **Pull to Refresh** - Standard mobile gesture for data refresh
- [ ] **Bottom Sheet Actions** - Replace modals with mobile-friendly bottom sheets
- [ ] **Haptic Feedback** - Vibration on key actions (iOS/Android)
- [ ] **Floating Action Button** - Quick "New Order" button always visible

### 3.2 Search & Filter Enhancements
- [ ] **Global Search** - Search across orders, resellers, stores from one input
- [ ] **Smart Filters** - "This Week's Orders", "Unpaid Invoices", "Low Stock" preset filters
- [ ] **Date Range Picker** - Easy date filtering with presets (Today, Last 7 Days, This Month)
- [ ] **Saved Filters** - Save frequently used filter combinations

### 3.3 Order List Optimizations
- [ ] **Infinite Scroll** - Replace pagination with auto-loading scroll
- [ ] **Order Grouping** - Group by reseller, store, or date
- [ ] **Compact/Expanded View Toggle** - Switch between card and table view
- [ ] **Color-Coded Status Strip** - Quick visual identification of order status

### 3.4 Form Experience
- [ ] **Smart Defaults** - Pre-fill last used store/reseller in new order
- [ ] **Price Calculator** - Real-time profit margin preview while filling order
- [ ] **Auto-Save Drafts** - Don't lose form data on accidental navigation
- [ ] **Image Capture from Camera** - Direct camera access for product photos
- [ ] **Voice Input** - Speech-to-text for order name (Tagalog support)

### 3.5 Notifications & Feedback
- [ ] **Toast Notifications** - Non-blocking success/error messages
- [ ] **Skeleton Loaders** - Replace spinners with skeleton screens
- [ ] **Empty State Illustrations** - Friendly illustrations when no data
- [ ] **Onboarding Tutorial** - First-time user guided tour

---

## Phase 4: Communication & Notifications 🟠

Essential for keeping resellers informed and reducing follow-up queries.

### 4.1 In-App Notifications
- [ ] **Notification Center** - Bell icon with unread count
- [ ] **Payment Received Alerts** - When admin confirms a payment
- [ ] **Order Status Change Alerts** - When order moves to next status
- [ ] **Invoice Due Reminders** - Upcoming and overdue invoices

### 4.2 Push Notifications (Web Push)
- [ ] **Service Worker Push** - Browser notifications even when app is closed
- [ ] **Notification Preferences** - Let users opt-in/out of notification types
- [ ] **Scheduled Reminders** - Daily summary of pending orders

### 4.3 External Communication (Future)
- [ ] **SMS Integration** - Send order updates via SMS (Semaphore/Itexmo)
- [ ] **WhatsApp/Viber Bot** - Automated order confirmations
- [ ] **Email Notifications** - Invoice and receipt emails

---

## Phase 5: Billing & Subscription (SaaS Monetization) 🔴

### 5.1 Subscription Plans
- [ ] **Free Tier** - Limited to 50 orders/month, 1 user
- [ ] **Pro Plan** - Unlimited orders, 3 users, reports
- [ ] **Business Plan** - Unlimited users, API access, priority support

### 5.2 Billing Integration
- [ ] **Payment Gateway** - PayMongo or Dragonpay for PH payments
- [ ] **Subscription Management** - Upgrade/downgrade/cancel flows
- [ ] **Usage Tracking** - Monitor limits for free tier
- [ ] **Invoice Generation** - Monthly billing invoices for subscribers
- [ ] **Promo Codes** - Discount codes for marketing

### 5.3 Admin Portal (SaaS Operator)
- [ ] **Tenant Dashboard** - Overview of all tenants/subscribers
- [ ] **Revenue Analytics** - MRR, churn, LTV metrics
- [ ] **User Management** - View/suspend/delete tenant accounts
- [ ] **Feature Flags** - Enable/disable features per plan

---

## Phase 6: Advanced Features 🟢

### 6.1 Reporting & Analytics
- [ ] **Sales Report** - Revenue by period, store, reseller
- [ ] **Profit & Loss Report** - Detailed margin analysis
- [ ] **Reseller Performance Report** - Payment history, order frequency
- [ ] **Export to Excel/PDF** - Downloadable reports
- [ ] **Scheduled Report Emails** - Weekly/monthly reports via email

### 6.2 Inventory Tracking
- [ ] **Product Catalog** - Reusable product items with set prices
- [ ] **Stock Levels** - Track available quantity per product
- [ ] **Low Stock Alerts** - Notify when items need restock
- [ ] **Supplier Price History** - Track price changes over time

### 6.3 Reseller Portal
- [ ] **Self-Service Login** - Resellers can log in to view their orders
- [ ] **Order Status Tracking** - Reseller can check order status without asking admin
- [ ] **Payment History** - View paid/unpaid invoices
- [ ] **New Order Request** - Reseller can submit order requests

### 6.4 Automation & Integrations
- [ ] **Zapier/Make Integration** - Connect with other apps
- [ ] **Google Sheets Sync** - Auto-export orders to a spreadsheet
- [ ] **Webhook Events** - Trigger external actions on order events
- [ ] **API Access** - Public REST API for custom integrations

### 6.5 Offline & PWA Enhancements
- [ ] **Offline Order Creation** - Queue orders when offline, sync when online
- [ ] **Cached Data Access** - View recent orders/resellers offline
- [ ] **Background Sync** - Retry failed requests automatically
- [ ] **Install Prompt UX** - Better "Add to Home Screen" experience

---

## Phase 7: Localization & Philippine Market 🟢

### 7.1 Language Support
- [ ] **Filipino/Tagalog UI** - Translatable interface
- [ ] **Language Switcher** - Toggle between English and Filipino

### 7.2 Payment Methods
- [ ] **GCash QR Code** - Display QR for quick payment
- [ ] **Maya (PayMaya) Integration** - Direct payment link
- [ ] **Bank Transfer Templates** - Pre-filled payment instructions

### 7.3 Logistics Integration (Future)
- [ ] **Grab Express / Lalamove** - Get delivery quotes
- [ ] **Shipping Calculator** - Estimate delivery costs per order
- [ ] **Tracking Number Entry** - Add courier tracking info

---

## Summary: Recommended Implementation Order

| Phase | Description | Priority | Est. Effort |
|-------|-------------|----------|-------------|
| **Phase 1** | Multi-tenancy & Auth | 🔴 Critical | 3-4 weeks |
| **Phase 2** | Admin Experience | 🟠 High | 2-3 weeks |
| **Phase 3** | UI/UX Improvements | 🟠 High | 2-3 weeks |
| **Phase 4** | Notifications | 🟠 High | 1-2 weeks |
| **Phase 5** | Billing/Subscription | 🔴 Critical | 2-3 weeks |
| **Phase 6** | Advanced Features | 🟢 Nice to Have | 4-6 weeks |
| **Phase 7** | Localization | 🟢 Nice to Have | 1-2 weeks |

---

## Next Steps

1. **Phase 1.1-1.2** should be the immediate focus to establish SaaS foundation
2. **Phase 2.1-2.2** for admin dashboard improvements to demonstrate value
3. **Phase 5** for monetization before public launch
4. Other phases can be iterated post-launch based on user feedback

---

*Last Updated: January 2026*
