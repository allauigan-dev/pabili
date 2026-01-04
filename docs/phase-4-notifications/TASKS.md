# Phase 4 Tasks: Communication & Notifications

## 4.1 In-App Notifications

### Database
- [ ] Create `notifications` table in Drizzle schema
- [ ] Add indexes for user_id and read_at
- [ ] Generate and apply migration

### Backend
- [ ] Create `src/server/routes/notifications.ts`
- [ ] Implement GET `/api/notifications` with pagination
- [ ] Implement GET `/api/notifications/unread-count`
- [ ] Implement PATCH `/api/notifications/:id/read`
- [ ] Implement PATCH `/api/notifications/read-all`

### Notification Triggers
- [ ] Create `src/server/lib/notifications.ts` helper
- [ ] Trigger notification on payment confirmation
- [ ] Trigger notification on order status change
- [ ] Trigger notification on new team member join

### Frontend Components
- [ ] Create `src/client/components/NotificationBell.tsx`
- [ ] Create `src/client/components/NotificationDropdown.tsx`
- [ ] Create `src/client/components/NotificationItem.tsx`
- [ ] Add bell to header/navigation
- [ ] Show unread count badge
- [ ] Implement mark as read on click
- [ ] Implement "Mark all as read" action

### Polling/Real-time
- [ ] Create `useNotifications.ts` hook with polling interval
- [ ] Poll unread count every 30 seconds
- [ ] Refresh dropdown on new notification

---

## 4.2 Push Notifications (Web Push)

### VAPID Keys
- [ ] Generate VAPID key pair
- [ ] Add keys to environment variables
- [ ] Store public key in client config

### Database
- [ ] Create `push_subscriptions` table in schema
- [ ] Generate and apply migration

### Service Worker
- [ ] Update service-worker.js with push event handler
- [ ] Handle notification click to open URL
- [ ] Test with Chrome DevTools

### Backend
- [ ] Install `web-push` library
- [ ] Create POST `/api/push/subscribe` endpoint
- [ ] Create DELETE `/api/push/unsubscribe` endpoint
- [ ] Create helper function to send push

### Frontend
- [ ] Create `usePushNotifications.ts` hook
- [ ] Request permission on user action
- [ ] Subscribe and send to server
- [ ] Add "Enable Push Notifications" toggle in settings

### Notification Preferences
- [ ] Create `notification_preferences` table
- [ ] Create GET/PUT `/api/notifications/preferences` endpoints
- [ ] Create preferences UI in settings page
- [ ] Check preferences before sending

---

## 4.3 External Communication (Future Phase)

### Email Integration
- [ ] Set up email provider (Resend/SendGrid)
- [ ] Create email templates:
  - [ ] Welcome email
  - [ ] Password reset
  - [ ] Invoice email
  - [ ] Weekly summary
- [ ] Create email sending helper

### Scheduled Jobs
- [ ] Set up Cloudflare Workers Cron Triggers
- [ ] Create `check-overdue-invoices` job (daily)
- [ ] Create `daily-summary` job (6pm)
- [ ] Add job handlers to worker

---

## Testing

- [ ] Test notification creation on payment confirm
- [ ] Test notification creation on status change
- [ ] Test unread count accuracy
- [ ] Test mark as read functionality
- [ ] Test push notification delivery
- [ ] Test notification preferences filtering
- [ ] Test scheduled job execution
