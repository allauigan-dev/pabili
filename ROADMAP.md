# Pabili Feature Roadmap

> SaaS-focused feature roadmap for the Pabili Pasabuy Order Management System

## Legend

- 🔴 **Critical** - Must have for SaaS launch
- 🟠 **High Priority** - Important for user adoption
- 🟢 **Nice to Have** - Enhances value proposition

---

## Summary: Implementation Order

| Phase | Description | Priority | Est. Effort |
|-------|-------------|----------|-------------|
| **1** | Multi-Tenancy & Authentication | 🔴 Critical | 2-3 weeks |
| **5** | Billing & Subscription | 🔴 Critical | 2-3 weeks |
| **9** | Security & Compliance | 🔴 Critical | 2-3 weeks |
| **10** | Onboarding & Customer Success | 🟠 High | 2-3 weeks |
| **2** | Admin Experience | 🟠 High | 2-3 weeks |
| **3** | UI/UX Improvements | 🟠 High | 2-3 weeks |
| **8** | Settings Page | 🟠 High | 1-2 weeks |
| **12** | Performance & Scalability | 🟠 High | 1-2 weeks |
| **4** | Communications & Notifications | 🟠 High | 1-2 weeks |
| **14** | Customer Support | 🟠 High | 1-2 weeks |
| **13** | Marketing & Growth | 🟢 Nice to Have | 2-3 weeks |
| **6** | Advanced Features | 🟢 Nice to Have | 4-6 weeks |
| **7** | Localization | 🟢 Nice to Have | 1-2 weeks |
| **11** | API & Developer Platform | 🟢 Nice to Have | 3-4 weeks |

**Total Estimated Effort:** 24-36 weeks

---

## SaaS Launch Phases

### MVP Launch (8-10 weeks)

Essential for initial paid launch:

- **Phase 1**: Multi-tenancy, authentication, organization setup
- **Phase 5**: Subscription plans, PayMongo integration
- **Phase 9**: Rate limiting, basic security
- **Phase 10**: Onboarding wizard, trial management
- **Phase 13**: Landing page (basic)

### Beta Launch (6-8 weeks after MVP)

Polish for beta users:

- **Phase 2**: Dashboard analytics, profit tracking
- **Phase 3**: Mobile-first experience, UX improvements
- **Phase 8**: Settings page, organization management
- **Phase 12**: Performance optimization, caching

### Public Launch (4-6 weeks after Beta)

Ready for scale:

- **Phase 4**: Notifications, email alerts
- **Phase 14**: Help center, support tickets

### Post-Launch Iteration

Based on user feedback:

- **Phase 6**: Advanced reporting, customer portal
- **Phase 7**: Multi-language, multi-currency
- **Phase 11**: Public API, webhooks, white-label

---

## Phase 1: Multi-Tenancy & Authentication 🔴

> **Status:** ✅ Mostly Complete | **Effort:** 2-3 weeks

Transform Pabili from single-tenant to multi-tenant SaaS.

### 1.1 User Authentication
- [x] Social login (Google, Facebook)
- [x] Session management with Better Auth
- [ ] Password reset via email
- [ ] Account verification flow

### 1.2 Multi-Tenant Architecture
- [x] Organization-based tenancy
- [x] `organization_id` on all business tables
- [x] Row-level data isolation
- [ ] Custom subdomains (`{slug}.pabili.app`)
- [ ] Tenant-specific branding

### 1.3 Role-Based Access Control
- [x] Owner, Admin, Member roles
- [ ] Invite team members via email
- [ ] Permission enforcement on routes

---

## Phase 2: Admin/Owner Experience 🟠

> **Effort:** 2-3 weeks

Enhance dashboard and admin tools for business visibility.

### 2.1 Enhanced Dashboard Analytics
- [ ] Revenue Overview Card (today, week, month)
- [ ] Profit Summary Widget (margin analytics)
- [ ] Outstanding Balance Widget (aging breakdown)
- [ ] Top Performing Customers
- [ ] Store Purchase Distribution
- [ ] Order Status Pipeline

### 2.2 Customer Balance Management
- [ ] Ledger View (transaction history)
- [ ] Statement of Account Export
- [ ] Credit Limit Feature
- [ ] Overdue Payment Alerts

### 2.3 Order Workflow Improvements
- [ ] Batch Order Entry (CSV import)
- [ ] Order Duplication
- [ ] Bulk Status Update
- [ ] Order Notes/Timeline

---

## Phase 3: UI/UX Improvements 🟠

> **Effort:** 2-3 weeks

Enhance mobile-first experience.

### 3.1 Mobile-First Experience
- [ ] Swipe Actions on Cards
- [ ] Pull to Refresh
- [ ] Bottom Sheet Actions
- [ ] Floating Action Button

### 3.2 Search & Filter
- [ ] Global Search
- [ ] Smart Filters
- [ ] Date Range Picker
- [ ] Saved Filters

### 3.3 Order List
- [ ] Infinite Scroll
- [ ] Order Grouping
- [ ] Compact/Expanded View
- [ ] Color-Coded Status

### 3.4 Form Experience
- [ ] Smart Defaults
- [ ] Price Calculator
- [ ] Auto-Save Drafts
- [ ] Camera Capture

---

## Phase 4: Communications & Notifications 🟠

> **Effort:** 1-2 weeks

Keep users informed of key events.

### 4.1 In-App Notifications
- [ ] Notification Center
- [ ] Payment Received Alerts
- [ ] Order Status Change Alerts
- [ ] Invoice Due Reminders

### 4.2 Push Notifications
- [ ] Web Push via Service Worker
- [ ] Notification Preferences
- [ ] Scheduled Reminders

### 4.3 SaaS Notifications
- [ ] Trial Expiry Alerts
- [ ] Usage Limit Warnings
- [ ] Subscription Updates

---

## Phase 5: Billing & Subscription 🔴

> **Effort:** 2-3 weeks

Monetize the platform.

### 5.1 Subscription Plans
| Feature | Free | Pro (₱499/mo) | Business (₱1,499/mo) |
|---------|------|---------------|----------------------|
| Orders/month | 50 | Unlimited | Unlimited |
| Users | 1 | 3 | Unlimited |
| Stores | 5 | 20 | Unlimited |
| Reports | Basic | Full | Full |
| API Access | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ✅ |

### 5.2 Billing Integration
- [ ] PayMongo (GCash, Maya, Cards)
- [ ] Stripe (optional, for international)
- [ ] Subscription Management
- [ ] Usage Tracking
- [ ] Invoice Generation
- [ ] Promo Codes

### 5.3 Admin Portal
- [ ] Tenant Dashboard
- [ ] Revenue Analytics
- [ ] User Management
- [ ] Feature Flags

---

## Phase 6: Advanced Features 🟢

> **Effort:** 4-6 weeks

Value-add features for power users.

### 6.1 Reporting & Analytics
- [ ] Sales Report
- [ ] Profit & Loss Report
- [ ] Statement of Account
- [ ] Export to Excel/PDF

### 6.2 Customer Portal (Pro)
- [ ] Self-Service Login
- [ ] Order Status Tracking
- [ ] Payment History
- [ ] Invoice Downloads

### 6.3 Barcode/QR Scanning
- [ ] Product Barcode Scanning
- [ ] Payment QR Generation

### 6.4 Integrations
- [ ] Google Sheets Sync
- [ ] Scheduled Report Emails

---

## Phase 7: Localization & PH Market 🟢

> **Effort:** 1-2 weeks

Tailored for Philippine market.

### 7.1 Language Support
- [ ] Filipino/Tagalog UI
- [ ] Language Switcher

### 7.2 Multi-Currency
- [ ] USD for OFW pasabuy
- [ ] Exchange Rate Support

### 7.3 Payment Methods
- [ ] GCash QR Code
- [ ] Maya Integration
- [ ] Bank Transfer Templates

---

## Phase 8: Settings Page 🟠

> **Effort:** 1-2 weeks

### 8.1 Profile Settings
- [ ] Display Name
- [ ] Profile Photo
- [ ] Email Update

### 8.2 Organization Settings
- [ ] Organization Name/Logo
- [ ] Team Members
- [ ] Invitations
- [ ] Custom Domain

### 8.3 Preferences
- [ ] Theme Mode
- [ ] Notification Preferences
- [ ] Regional Settings

---

## Phase 9: Security & Compliance 🔴

> **Effort:** 2-3 weeks

Essential for SaaS trust.

### 9.1 Security
- [ ] Rate Limiting
- [ ] CSRF Protection
- [ ] Security Headers
- [ ] Session Management
- [ ] File Upload Validation

### 9.2 Compliance
- [ ] Audit Logging
- [ ] Data Export (GDPR/DPA)
- [ ] Data Deletion (Right to be Forgotten)

---

## Phase 10: Onboarding & Customer Success 🟠

> **Effort:** 2-3 weeks

### 10.1 Onboarding
- [ ] Email Verification
- [ ] Organization Setup Wizard
- [ ] Welcome Tour
- [ ] Sample Data Option
- [ ] Progress Checklist

### 10.2 Trial Management
- [ ] 14-day Trial
- [ ] Trial Expiry Notifications
- [ ] Conversion Tracking

### 10.3 Customer Success
- [ ] Health Scores
- [ ] Churn Risk Alerts

---

## Phase 11: API & Developer Platform 🟢

> **Effort:** 3-4 weeks

For integrations and partners (Business plan).

### 11.1 Public API
- [ ] RESTful API (/v1/)
- [ ] API Key Management
- [ ] Rate Limit Dashboard

### 11.2 Webhooks
- [ ] Event Webhooks
- [ ] Retry Logic
- [ ] Delivery Logs

### 11.3 White-Label
- [ ] Custom Domain
- [ ] Remove Branding
- [ ] Custom Templates

---

## Phase 12: Performance & Scalability 🟠

> **Effort:** 1-2 weeks

### 12.1 Optimization
- [ ] Edge Caching
- [ ] Database Indexes
- [ ] Query Optimization
- [ ] Image Optimization
- [ ] Lazy Loading

### 12.2 Monitoring
- [ ] Error Monitoring (Sentry)
- [ ] Performance Metrics
- [ ] Background Sync

---

## Phase 13: Marketing & Growth 🟢

> **Effort:** 2-3 weeks

### 13.1 Landing Page
- [ ] Hero Section
- [ ] Features Showcase
- [ ] Pricing Page
- [ ] Testimonials

### 13.2 SEO
- [ ] Meta Tags
- [ ] Structured Data
- [ ] Sitemap

### 13.3 Growth
- [ ] Referral Program
- [ ] Email Marketing
- [ ] Analytics Integration

---

## Phase 14: Customer Support 🟠

> **Effort:** 1-2 weeks

### 14.1 Self-Service
- [ ] Help Center / Knowledge Base
- [ ] In-App Help Widget
- [ ] FAQ

### 14.2 Support Channels
- [ ] Contact Form
- [ ] Ticket System
- [ ] Live Chat (Crisp)
- [ ] WhatsApp Integration

### 14.3 Operations
- [ ] Status Page

---

## Removed/Deprioritized Features

The following features have been removed or deprioritized from the MVP scope:

| Feature | Reason | Status |
|---------|--------|--------|
| Voice Input (Tagalog) | Too niche for MVP | Removed |
| Inventory Tracking | Scope creep | Deprioritized to future |
| Logistics Integration | External dependency | Deprioritized to future |
| Mobile App (React Native) | PWA sufficient for MVP | Future consideration |

---

*Last Updated: January 2026*
