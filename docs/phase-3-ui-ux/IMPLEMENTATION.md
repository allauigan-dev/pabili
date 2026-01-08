# Phase 3: UI/UX Improvements

> **Priority:** 🟠 High | **Estimated Effort:** 2-3 weeks

## Overview

Enhance the mobile-first experience with modern UI patterns, improved search/filter, optimized forms, and better feedback mechanisms.

---

## 3.1 Mobile-First Experience

### ✅ Swipe Actions on Cards (Completed)
- [x] Implement swipe gestures on OrderCard, InvoiceCard, PaymentCard
- [x] **Swipe Left:** Delete (with confirmation)
- [x] **Swipe Right:** Quick action (mark delivered, confirm payment)
- [x] Library: `@use-gesture/react` + `@react-spring/web`
- [x] Created reusable `SwipeableCard` component in `src/client/components/ui/`

### Pull to Refresh
- Add pull-to-refresh on list pages
- Show refresh indicator during fetch
- Works with existing React Query refetch

### Bottom Sheet Actions
- Replace modal dialogs with bottom sheets on mobile
- Smooth drag-to-dismiss gesture
- Use for: Status change, filters, confirmations
- Library: Consider `react-spring/bottom-sheet` or custom

### Haptic Feedback
- Trigger vibration on key actions:
  - Order status change
  - Payment confirmed
  - Error occurred
- Use `navigator.vibrate()` API

### Floating Action Button (FAB)
- Fixed position "+" button bottom-right
- Quick access to "New Order"
- Optional: Expand to show multiple quick actions

---

## 3.2 Search & Filter Enhancements

### Global Search
- Search input in header/navigation
- Search across: Orders, Resellers, Stores
- Show categorized results in dropdown
- Navigate to detail on selection

```
┌────────────────────────────────┐
│ 🔍 Search...                   │
├────────────────────────────────┤
│ ORDERS                         │
│   Order #1234 - iPhone Case    │
│   Order #1235 - Lipstick       │
│ RESELLERS                      │
│   Maria Santos                 │
│ STORES                         │
│   Beauty Hub                   │
└────────────────────────────────┘
```

### Smart Filters (Presets)
- Predefined filter buttons:
  - "This Week's Orders"
  - "Pending Delivery"
  - "Unpaid Invoices"
  - "Top Resellers"
- One-click application

### Date Range Picker
- Custom date range selector
- Quick presets: Today, Yesterday, Last 7 Days, This Month, Last Month
- Calendar UI for custom range

### Saved Filters
- Allow user to save filter combinations
- Store in localStorage
- Quick access from filter panel

---

## 3.3 Order List Optimizations

### Infinite Scroll
- Replace pagination with auto-loading
- Load next page when near bottom
- Use Intersection Observer API
- Show loading indicator at bottom

### Order Grouping
- Group by option: Date, Reseller, Store, Status
- Collapsible group headers
- Count per group

### Compact/Expanded View Toggle
- Toggle button on list header
- **Compact:** Single line per order, table-like
- **Expanded:** Full card with image

### Color-Coded Status Strip
- Vertical strip on left of card
- Colors:
  - Pending: Amber
  - Bought: Blue
  - Packed: Purple
  - Delivered: Green
  - Cancelled: Gray
  - No Stock: Red

---

## 3.4 Form Experience

### Smart Defaults
- Remember last used:
  - Store (per session)
  - Reseller (per session)
  - Markup percentage
- Pre-fill on new order form

### Price Calculator
- Real-time calculation as user types
- Show:
  - Cost Total: `qty × (price + fee)`
  - Reseller Total: `qty × reseller_price`
  - Profit: `reseller_total - cost_total`
  - Margin %: `profit / reseller_total × 100`

### Auto-Save Drafts
- Save form state to localStorage every 5 seconds
- Prompt to restore on page load if draft exists
- Clear draft on successful submit

### Image Capture from Camera
- Use `<input type="file" capture="environment">`
- Direct camera access on mobile
- Preview before upload
- Compress before sending

### ~~Voice Input~~ (Removed)

> **Note:** Voice input feature has been removed from the MVP scope. It may be reconsidered for future releases based on user feedback.

---

## 3.5 Notifications & Feedback

### Toast Notifications
- Non-blocking success/error messages
- Auto-dismiss after 3-5 seconds
- Position: Bottom-center on mobile
- Library: `react-hot-toast` or `sonner`

### Skeleton Loaders
- Replace spinners with skeleton screens
- Match exact layout of content
- Animate with subtle pulse

### Empty State Illustrations
- Custom illustrations for:
  - No orders yet
  - No search results
  - No resellers added
- Include CTA button

### Onboarding Tutorial
- First-time user guided tour
- Highlight key features:
  1. Create your first store
  2. Add a reseller
  3. Create an order
  4. Track payments
- Skip option, don't show again preference
