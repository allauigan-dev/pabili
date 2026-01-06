# Phase 8: Settings - Task Checklist

> Track implementation progress for the Settings page feature.

---

## Phase 8A: Core Settings Page (MVP)

### Setup
- [ ] Create `src/client/pages/settings/` directory structure
- [ ] Add `/settings/*` route to `App.tsx`
- [ ] Create `SettingsPage.tsx` main container with tab navigation

### Profile Section
- [ ] Create `ProfileSection.tsx` component
- [ ] Display current user info (name, email, photo)
- [ ] Implement name edit form with validation
- [ ] Implement profile photo upload to R2
- [ ] Connect to better-auth `updateUser` API

### Appearance Section
- [ ] Create `AppearanceSection.tsx` component
- [ ] Add theme mode selector (Light/Dark/System)
- [ ] Add AMOLED mode toggle
- [ ] Add compact view toggle (optional)
- [ ] Add reduced motion toggle (optional)
- [ ] Persist preferences in localStorage

---

## Phase 8B: Organization Settings

### Organization Section
- [ ] Create `OrganizationSection.tsx` component
- [ ] Display organization info (name, slug, logo)
- [ ] Implement edit form for org admins
- [ ] Show organization members list
- [ ] Add member role badges
- [ ] Implement invite member flow
- [ ] Add role-based visibility (hide edit for non-admins)

---

## Phase 8C: Notifications & Account

### Database Schema
- [ ] Create `notification_preferences` table migration
- [ ] Create `user_preferences` table migration
- [ ] Apply migrations to local and production D1

### Notification Preferences API
- [ ] Create `GET /api/user/notification-preferences` endpoint
- [ ] Create `PATCH /api/user/notification-preferences` endpoint
- [ ] Add Zod validation schemas

### Notification Section
- [ ] Create `NotificationsSection.tsx` component
- [ ] Add toggle for each notification type
- [ ] Implement push notification permission request (optional)
- [ ] Save preferences via API

### Account Section
- [ ] Create `AccountSection.tsx` component
- [ ] Display connected OAuth accounts
- [ ] Implement password set/change form
- [ ] Show active sessions list
- [ ] Implement session revocation
- [ ] Add account deletion with confirmation

### User Preferences API
- [ ] Create `GET /api/user/preferences` endpoint
- [ ] Create `PATCH /api/user/preferences` endpoint
- [ ] Sync localStorage theme with database preference

---

## Phase 8D: Polish & Testing

### UI Polish
- [ ] Ensure mobile-first responsive design
- [ ] Add loading states and skeletons
- [ ] Add success/error toast notifications
- [ ] Test with different roles (admin, member)
- [ ] Verify navigation works from all entry points

### Testing
- [ ] Write unit tests for settings components
- [ ] Write API endpoint tests
- [ ] Test preference persistence across devices
- [ ] Test profile photo upload flow

### Documentation
- [ ] Update README if needed
- [ ] Add settings page to user documentation
