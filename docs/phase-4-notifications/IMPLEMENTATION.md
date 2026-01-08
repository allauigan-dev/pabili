# Phase 4: Communication & Notifications

> **Priority:** 🟠 High | **Estimated Effort:** 1-2 weeks

## Overview

Implement a notification system to keep admins informed of important events and reduce the need for constant manual checking.

---

## 4.1 In-App Notifications

### Notification Center

Create a bell icon in the header with unread count badge.

**Notification Types:**
| Type | Trigger | Icon |
|------|---------|------|
| `payment_received` | Payment confirmed | 💵 |
| `order_status_change` | Order moves to new status | 📦 |
| `invoice_overdue` | Invoice past due date | ⚠️ |
| `low_stock_alert` | Future inventory feature | 📉 |
| `new_team_member` | Someone joins team | 👤 |

### Database Schema

```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  user_id INTEGER REFERENCES users(id), -- null = all users in tenant
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data TEXT, -- JSON with entity references
  read_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications (paginated) |
| GET | `/api/notifications/unread-count` | Get unread count |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Implementation

1. **Create notification when:**
   - Payment status changes to confirmed
   - Order status changes
   - Invoice becomes overdue (scheduled check)

2. **Frontend components:**
   - `NotificationBell.tsx` - Bell icon with badge
   - `NotificationDropdown.tsx` - Dropdown list of recent notifications
   - `NotificationItem.tsx` - Single notification row

3. **Real-time updates (optional):**
   - Use polling (every 30 seconds) or WebSocket/SSE for live updates

---

## 4.2 Push Notifications (Web Push)

### Service Worker Setup

Extend existing service worker to handle push notifications.

```javascript
// In service-worker.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: '/icon-192x192.png',
    data: data.url
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});
```

### Push Subscription Flow

1. User clicks "Enable Notifications"
2. Browser prompts for permission
3. If granted, get PushSubscription object
4. Send subscription to server
5. Store in `push_subscriptions` table

### Database Schema

```sql
CREATE TABLE push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  endpoint TEXT NOT NULL UNIQUE,
  keys TEXT NOT NULL, -- JSON with p256dh and auth
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Server-Side Push

Use `web-push` library on Cloudflare Workers:

```typescript
import webPush from 'web-push';

webPush.setVapidDetails(
  'mailto:admin@pabili.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send push notification
await webPush.sendNotification(subscription, JSON.stringify({
  title: 'Payment Received',
  message: 'Maria Santos paid ₱1,500',
  url: '/payments/123'
}));
```

### Notification Preferences

Allow users to opt-in/out per notification type:

```sql
CREATE TABLE notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL, -- notification type
  in_app INTEGER DEFAULT 1,
  push INTEGER DEFAULT 0,
  email INTEGER DEFAULT 0,
  UNIQUE(user_id, type)
);
```

---

## 4.3 External Communication (Future)

### SMS Integration

**Providers:** Semaphore, Itexmo, Twilio

Use Cases:
- Order ready for pickup
- Payment reminder
- Invoice due notification

### ~~WhatsApp/Viber Bot~~ (Moved to Phase 14)

> **Note:** WhatsApp/Viber integration has been moved to Phase 14 (Customer Support) as it's an external integration that requires dedicated setup and ongoing maintenance.

### Email Notifications

**Provider:** Resend, SendGrid, or Cloudflare Email Workers

Templates:
- Welcome email
- Password reset
- Invoice email with PDF attachment
- Weekly summary report

---

## 4.4 SaaS-Specific Notifications

### Subscription Notifications

| Event | Notification | Channel |
|-------|--------------|---------|
| Trial Starting | Welcome + trial info | Email + In-App |
| Trial Ending (3 days) | Upgrade reminder | Email + In-App |
| Trial Ended | Features limited | Email + In-App |
| Plan Upgraded | Confirmation | Email |
| Payment Failed | Retry request | Email + In-App |
| Subscription Cancelled | Confirmation + win-back | Email |

### Usage Limit Notifications

| Trigger | Message |
|---------|---------|
| 80% of order limit | "You've used 80% of your monthly orders" |
| 100% of order limit | "Order limit reached - upgrade to continue" |
| 80% of user limit | "Consider upgrading for more team members" |

### Admin Notifications (Platform Owner)

| Event | Notification |
|-------|--------------|
| New signup | New tenant alert |
| Plan upgrade | Revenue notification |
| Churn risk | At-risk tenant alert |
| Support ticket | New ticket notification |

---

## Scheduled Jobs

Use Cloudflare Workers Scheduled Events (Cron Triggers) for:

| Job | Schedule | Description |
|-----|----------|-------------|
| `check-overdue-invoices` | Daily 9am | Find overdue invoices, create notifications |
| `daily-summary` | Daily 6pm | Send summary of day's activity |
| `payment-reminders` | Weekly Mon | Remind resellers of outstanding balance |
