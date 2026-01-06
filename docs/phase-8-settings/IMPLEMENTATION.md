# Phase 8: Settings Page Implementation

> **Priority:** 🟠 High | **Estimated Effort:** 1-2 weeks

## Overview

Implement a comprehensive Settings page to centralize user preferences, account management, appearance settings, and organization configuration. Currently, the settings button exists in the navigation (Header, Sidebar, BottomNav) but navigates to a non-existent `/settings` route.

---

## Current State Analysis

### Existing Infrastructure
- **Theme Settings**: Already functional via `useTheme` hook (`pabili-theme`, `pabili-amoled` in localStorage)
- **User Data**: Available through better-auth (`user` table with name, email, image)
- **Organization Data**: Available via better-auth organization plugin (`organization` table)
- **No Settings Route**: `/settings` not defined in `App.tsx`

### What's Missing
- No dedicated Settings page component
- No user preferences database table
- No notification preferences (documented in Phase 4)
- No account management UI (password change, connected accounts)

---

## 8.1 Settings Page Structure

### Route Structure

```
/settings                    → General/Profile settings (default)
/settings/appearance         → Theme & display preferences  
/settings/organization       → Organization management
/settings/notifications      → Notification preferences
/settings/account            → Account security & connected accounts
```

### Mobile-First Navigation

Use a tab-based or accordion-style layout for mobile:

```
┌────────────────────────────────────┐
│ ← Settings                         │
├────────────────────────────────────┤
│ ┌──────────────────────────────┐   │
│ │ 👤 Profile                   │   │  ← Active Tab
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 🎨 Appearance                │   │
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 🏢 Organization              │   │
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 🔔 Notifications             │   │
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 🔐 Account                   │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

---

## 8.2 Settings Categories

### 8.2.1 Profile Settings

Manage user profile information.

**Fields:**
| Field | Type | Source | Editable |
|-------|------|--------|----------|
| Display Name | text | `user.name` | ✅ |
| Email | email | `user.email` | ✅ (requires verification) |
| Profile Photo | image | `user.image` | ✅ |

**API Endpoints:**
- `PATCH /api/user/update` - Update user profile (via better-auth)
- `POST /api/upload/avatar` - Upload profile photo to R2

**Implementation:**
- Use better-auth's `updateUser` method from auth client
- For photo upload, use existing R2 upload infrastructure

---

### 8.2.2 Appearance Settings

Manage visual preferences stored in localStorage.

**Settings:**
| Setting | Options | Storage Key | Default |
|---------|---------|-------------|---------|
| Theme Mode | Light / Dark / System | `pabili-theme` | `system` |
| AMOLED Mode | On / Off (dark mode only) | `pabili-amoled` | `false` |
| Compact View | On / Off | `pabili-compact-view` | `false` |
| Reduced Motion | On / Off | `pabili-reduced-motion` | `false` |

**Implementation:**
- Extend existing `useTheme` hook or create new `useAppearance` hook
- All settings stored in localStorage (no backend required)
- Apply CSS classes or CSS variables based on preferences

---

### 8.2.3 Organization Settings

Manage organization details. Only available to organization admins/owners.

**Fields:**
| Field | Type | Source | Editable |
|-------|------|--------|----------|
| Organization Name | text | `organization.name` | ✅ |
| Organization Slug | text | `organization.slug` | ✅ |
| Organization Logo | image | `organization.logo` | ✅ |

**Sub-sections:**
- **Members**: View/manage organization members (already exists via better-auth)
- **Invitations**: Pending invitations
- **Danger Zone**: Leave organization, transfer ownership

**API Endpoints:**
- `PATCH /api/organization` - Update organization details
- `GET /api/organization/members` - List members
- `POST /api/organization/invite` - Send invitation
- `DELETE /api/organization/members/:id` - Remove member

**Implementation:**
- Use better-auth's organization methods
- Check role permissions before showing edit controls

---

### 8.2.4 Notification Preferences

> **Note:** This is documented in Phase 4. Database schema required.

**Preferences:**
| Notification Type | In-App | Push | Description |
|-------------------|--------|------|-------------|
| Payment Received | ✅ | ⬜ | When a payment is confirmed |
| Order Status Change | ✅ | ⬜ | When order moves to new status |
| Invoice Overdue | ✅ | ⬜ | When invoice becomes overdue |
| New Team Member | ✅ | ⬜ | When someone joins organization |

**Database Schema:** (From Phase 4)
```sql
CREATE TABLE notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES user(id),
  notification_type TEXT NOT NULL,
  in_app INTEGER DEFAULT 1,
  push INTEGER DEFAULT 0,
  email INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, notification_type)
);
```

**API Endpoints:**
- `GET /api/user/notification-preferences` - Get user preferences
- `PATCH /api/user/notification-preferences` - Update preferences

---

### 8.2.5 Account Settings

Manage account security and connected accounts.

**Sections:**

#### Connected Accounts
Show linked OAuth providers (Google, etc.) from better-auth.
- View connected accounts
- Connect new accounts
- Disconnect accounts (if password is set)

#### Password Management
- Set password (if using OAuth only)
- Change password
- Use better-auth's password methods

#### Sessions
- View active sessions
- Revoke other sessions
- Use better-auth's session management

#### Danger Zone
- Delete account (soft delete, with confirmation)
- Export data (GDPR compliance)

**API Endpoints:**
- `GET /api/user/accounts` - List connected accounts
- `POST /api/user/password` - Set/change password
- `GET /api/user/sessions` - List active sessions
- `DELETE /api/user/sessions/:id` - Revoke session
- `POST /api/user/delete` - Delete account

---

## 8.3 User Preferences Table (New Schema)

For app-specific preferences that should persist across devices.

```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES user(id) UNIQUE,
  organization_id TEXT REFERENCES organization(id),
  
  -- Order Form Defaults
  default_store_id INTEGER REFERENCES stores(id),
  default_markup_percentage REAL DEFAULT 0,
  
  -- Display Preferences (synced from localStorage)
  theme TEXT DEFAULT 'system',
  amoled_mode INTEGER DEFAULT 0,
  compact_view INTEGER DEFAULT 0,
  reduced_motion INTEGER DEFAULT 0,
  
  -- Regional Settings
  currency TEXT DEFAULT 'PHP',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  timezone TEXT DEFAULT 'Asia/Manila',
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
```

**API Endpoints:**
- `GET /api/user/preferences` - Get preferences
- `PATCH /api/user/preferences` - Update preferences

---

## 8.4 Implementation Plan

### Phase 8A: Core Settings Page (MVP)

1. **Create Settings Page Component**
   - `src/client/pages/settings/SettingsPage.tsx` - Main container with tabs
   - Mobile-first responsive design

2. **Add Route to App.tsx**
   ```tsx
   <Route path="/settings/*" element={<SettingsPage />} />
   ```

3. **Profile Section**
   - Display current user info
   - Edit name form
   - Profile photo upload

4. **Appearance Section**
   - Theme mode selector (already works)
   - AMOLED mode toggle (already works)
   - Move from header dropdown to dedicated section

### Phase 8B: Organization Settings

5. **Organization Section**
   - Display organization info
   - Edit form for admins
   - Member list

### Phase 8C: Notifications & Account

6. **Create Notification Preferences Schema**
   - Add migration
   - Create API endpoints

7. **Notification Section**
   - Toggle switches for each notification type

8. **Account Section**
   - Connected accounts display
   - Password management
   - Session management

---

## 8.5 File Structure

```
src/client/pages/settings/
├── SettingsPage.tsx           # Main container with navigation
├── ProfileSection.tsx         # Profile editing
├── AppearanceSection.tsx      # Theme & display settings
├── OrganizationSection.tsx    # Organization management
├── NotificationsSection.tsx   # Notification preferences
├── AccountSection.tsx         # Account security
└── components/
    ├── SettingsNav.tsx        # Side navigation (desktop)
    ├── SettingsCard.tsx       # Consistent card wrapper
    └── SettingToggle.tsx      # Reusable toggle component
```

---

## 8.6 Design Guidelines

Follow existing design patterns from `OrdersPage`, `CustomersPage`:

- Use `card` component for sections
- Use `Badge` for status indicators
- Use form components from `@/components/ui/`
- Mobile-first with responsive breakpoints
- Use Lucide icons consistently
- Follow the established color scheme

### Settings Card Pattern
```tsx
<Card className="card">
  <div className="card-header">
    <h2>Section Title</h2>
    <p className="text-muted-foreground">Description</p>
  </div>
  <div className="card-inner">
    {/* Settings content */}
  </div>
</Card>
```

---

## 8.7 Dependencies on Other Phases

| Dependency | Phase | Required For |
|------------|-------|--------------|
| Notification preferences schema | Phase 4 | Notifications section |
| Push subscription management | Phase 4 | Push notification toggles |
| Billing subscription info | Phase 5 | Billing section (future) |

---

## Verification Plan

### Manual Testing
- [ ] Navigate to `/settings` from all navigation points
- [ ] Edit profile name and verify update
- [ ] Upload profile photo
- [ ] Toggle theme modes and verify persistence
- [ ] Test on mobile viewport
- [ ] Verify organization settings respect role permissions

### Automated Tests
- [ ] Settings page renders without errors
- [ ] Profile update API validation
- [ ] Preference persistence in localStorage
- [ ] Route protection (authenticated only)
