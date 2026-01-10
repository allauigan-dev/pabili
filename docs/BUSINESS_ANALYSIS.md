# Pabili Business Analysis & MVP Roadmap

This document provides a comprehensive review of the **Pabili** project from a business, customer, owner, and developer standpoint. It identifies the core features required for a Minimum Viable Product (MVP) and suggests improvements for long-term maintainability.

---

## 1. Business Standpoint (SaaS & Market Fit)

Pabili is positioned as a **Multi-tenant SaaS for Pasabuy Businesses**. The core value proposition is streamlining the chaotic process of buy-on-behalf services, which are typically managed via manual spreadsheets, social media messages, and bank apps.

### Core Business Needs for MVP:
*   **Tenant Onboarding**: A smooth flow for owners to set up their organization, branding (logo, colors), and currency.
*   **Subscription Tiers**: Preparation for monetization (e.g., Free tier vs. Professional with advanced reporting/unlimited members).
*   **Merchant-Buyer Transparency**: Reducing the "trust gap" by providing verifiable receipts and status updates.

---

## 2. Customer Standpoint (The Buyer)

The customer needs to feel secure and informed throughout the "pasabuy" lifecycle.

### MVP Feature Needs:
*   **Self-Service Tracking Portal**: Customers should have a unique, read-only link (or account) to view their specific orders, payment status, and delivery progress without contacting the owner.
*   **Order Requests**: Instead of the owner manually entering every order, customers should be able to submit "Request Forms" with image uploads for the owner to approve and convert into orders.
*   **Automated Status Alerts**: Notifications (Email/SMS/Viber) when an item is "Bought," "Packed," or "Delivered."
*   **Proof of Purchase Access**: Viewing the actual store receipt image to verify price transparency.

---

## 3. Owner Standpoint (The Operator)

The owner needs efficiency. Managing hundreds of items across multiple stores is the biggest pain point.

### MVP Feature Needs:
*   **Shopping List Mode (Batching)**: A view that groups all "Pending" orders by **Store**. This allows the owner to walk into a store and see exactly what they need to buy for all customers at once. -- DONE
*   **Logistics & Packaging**: Ability to bundle multiple orders into a single "Shipment" or "Delivery Package" with a single tracking number or status.
*   **Expense Tracking**: Capturing overhead costs (gas, parking, toll fees) to calculate **Net Profit**, not just Gross Revenue.
*   **One-Click Invoicing**: Generating a PDF or shareable image invoice from a set of orders.
*   **Quick Status Updates**: Bulk status changes (e.g., "Mark all items from IKEA as Bought").
*   **Product Master List (Catalog)**: Instead of re-typing "Starbucks Coffee Beans" every time, a central **Products** database allows the owner to track repeated items, maintain a "Standard Price," and see which products are their best-sellers.
*   **Merchant Secrecy (Store Privacy)**: A critical feature for resellers who want to protect their "sources." Owners can toggle visibility for specific stores, hiding the store name/location from customer-facing portals and invoices while still tracking it internally.

---

## 4. Developer Standpoint (Maintenance & Feasibility)

To ensure the project remains maintainable as the tenant count grows.

### Scalability Improvements:
*   **Database Multi-Tenancy Strategy**: Ensure all queries strictly use `organization_id`. Consider implementing automated tests that fail if a query is missing this filter (Tenant Isolation testing).
*   **Asset Lifecycle Management**: Implementing a background job (or Cloudflare Queue) to cleanup orphaned R2 images.
*   **Feature Flagging**: A simple way to toggle features (like "Shopping List") for specific tenants or tiers without redeploying code.

### Maintenance Tools:
*   **Audit Logging**: The current `activities` table is good. Expand it to include "Who" and "Before/After" snapshots for critical data (Invoices/Payments) to resolve "Who changed this?" disputes.
*   **System Health Monitoring**: Standardize on a logging platform (e.g., Sentry) to catch edge cases in the edge environment.
*   **API versioning**: Planning for `/v1/` now to prevent breaking client PWAs when the business logic evolves.

---

## 5. MVP Feature Roadmap & Priority

| Feature | Category | Priority | Standpoint | Current Status |
| :--- | :--- | :--- | :--- | :--- |
| **Shopping List (Batch) Mode** | Efficiency | **CRITICAL** | Owner | ⚪ Planned (Phase 2) |
| **Product Master List** | Tracking | **HIGH** | Owner | ⚪ NEW (To be added) |
| **Store Privacy Toggles** | Security | **HIGH** | Owner | ⚪ NEW (To be added) |
| **Customer Order Tracking** | Trust | **CRITICAL** | Customer | ⚪ Partial (Auth ready) |
| **Bulk Status Updates** | UI/UX | **HIGH** | Owner | ⚪ Planned (Phase 3) |
| **Automated Notifications** | Retention | **HIGH** | Customer | ⚪ Planned (Phase 4) |
| **Profit/Loss Dashboard** | Financials | **HIGH** | Owner | ⚪ Planned (Phase 2) |
| **Audit Log Snapshots** | Maintenance | **MEDIUM** | Developer | ⚪ Partial |

---

## 6. Conclusion & Next Steps

Pabili has a solid technical foundation (Multi-tenant schema, R2 integration, Hono backend). However, to transition from a "CRUD app" to a **Professional Pasabuy Tool**, the focus must shift from **Data Entry** to **Data Actionability**.

### Immediate Next Steps:
1.  **Prioritize the "Shopping List" view**: This is the single biggest "Wow" feature for owners.
2.  **Enable the Customer Role**: Start restricting data so owners can safely invite their buyers into the platform.
3.  **Implement Profit Mapping**: Sync `orderPrice` and `orderCustomerPrice` into a real-time dashboard widget.
