# Members Feature - Tasks

## Phase A: Foundation (Week 1)

### Access Control Setup
- [ ] Create `src/server/auth/permissions.ts`
  - [ ] Define permission statements for all resources (order, store, customer, invoice, payment, report)
  - [ ] Create base roles (owner, admin, member) with permissions
  - [ ] Define preset roles (delivery, packer, back_office)
  - [ ] Export `ac` access controller instance

### Auth Configuration Updates
- [ ] Update `src/server/lib/auth.ts`
  - [ ] Import access controller and roles from permissions.ts
  - [ ] Add `ac` and `roles` to organization plugin config
  - [ ] Enable `dynamicAccessControl: { enabled: true }`
  - [ ] (Optional) Add hook for seeding preset roles on org creation

### Database Migration
- [ ] Generate Better Auth schema update
  ```bash
  npx @better-auth/cli@latest generate
  ```
- [ ] Review generated migration for `organization_role` table
- [ ] Apply migration to local D1
  ```bash
  npx wrangler d1 migrations apply pabili-db --local
  ```
- [ ] Apply migration to production D1
  ```bash
  npx wrangler d1 migrations apply pabili-db --remote
  ```

### Schema Updates
- [ ] Add type exports to `src/server/db/schema.ts`
  - [ ] `Member` and `NewMember` types
  - [ ] `Organization` and `NewOrganization` types

### Client Auth Updates
- [ ] Update `src/client/lib/auth-client.ts`
  - [ ] Enable `dynamicAccessControl: { enabled: true }` in organizationClient
  - [ ] Export `hasPermission` utility

---

## Phase B: API Layer (Week 1-2)

### Permission Middleware
- [ ] Create `src/server/middleware/permissions.ts`
  - [ ] Implement `requirePermission(resource, action)` middleware
  - [ ] Return 403 with descriptive error on permission denied

### Better Auth Invitation Configuration
- [ ] Update `src/server/lib/auth.ts` with invitation settings
  - [ ] Add `sendInvitationEmail` handler (log link for MVP or integrate email)
  - [ ] Configure `invitationExpiresIn` (7 days)
  
### Invitation Page
- [ ] Create `src/client/pages/InvitationPage.tsx`
  - [ ] Fetch invitation details on load
  - [ ] Show organization name and inviter info
  - [ ] Accept/Decline buttons
  - [ ] Handle login redirect if not authenticated
  - [ ] Set new org as active after accepting
- [ ] Add route `/invite/:invitationId` to App.tsx

> **Note:** Better Auth provides all member and invitation APIs out of the box:
> - `authClient.organization.listMembers()` - List org members
> - `authClient.organization.inviteMember()` - Send invitation
> - `authClient.organization.acceptInvitation()` - Accept invite
> - `authClient.organization.updateMemberRole()` - Change role
> - `authClient.organization.removeMember()` - Remove member
> - See IMPLEMENTATION.md for full API reference

### Custom Roles API
- [ ] Create `src/server/routes/roles.ts`
  - [ ] `GET /api/roles` - List organization roles (built-in + custom)
  - [ ] `POST /api/roles` - Create custom role with permissions
  - [ ] `PATCH /api/roles/:id` - Update custom role permissions
  - [ ] `DELETE /api/roles/:id` - Delete custom role (if not assigned)
  - [ ] `GET /api/roles/presets` - List available preset role templates
- [ ] Add route to main server index

### Update Existing Routes with Permissions
- [ ] Update `src/server/routes/orders.ts`
  - [ ] Add `requirePermission("order", "create")` to POST
  - [ ] Add `requirePermission("order", "update")` to PATCH
  - [ ] Add `requirePermission("order", "delete")` to DELETE
  - [ ] Add row-level filtering for `customer` role (only their orders)
- [ ] Update `src/server/routes/stores.ts`
- [ ] Update `src/server/routes/customers.ts`
- [ ] Update `src/server/routes/invoices.ts`
  - [ ] Add row-level filtering for `customer` role
- [ ] Update `src/server/routes/payments.ts`
  - [ ] Add row-level filtering for `customer` role

### Customer-Member Linking
- [ ] Add migration for `linked_member_id` on customers table
  ```bash
  # Add to schema.ts and generate migration
  npx drizzle-kit generate
  ```
- [ ] Create `POST /api/customers/link-member` endpoint
  - [ ] Find customer by email in organization
  - [ ] Update customer with memberId
- [ ] Update customer create/edit flow
  - [ ] Add "Invite to App" button (when email exists)
  - [ ] Call `authClient.organization.inviteMember()` with role: "customer"
  - [ ] Show invitation status on customer card/details

---

## Phase C: UI Components (Week 2)

### Settings Page Updates
- [ ] Update `src/client/pages/settings/SettingsPage.tsx`
  - [ ] Add "Members" section to navigation
  - [ ] Add route for `/settings/members`
  - [ ] Add route for `/settings/members/roles`

### Members Section
- [ ] Create `src/client/pages/settings/MembersSection.tsx`
  - [ ] Member list with cards/table
  - [ ] Role badge display
  - [ ] Edit role dropdown
  - [ ] Remove member button
  - [ ] Empty state for no members

### Invite Member Dialog
- [ ] Create invite member dialog component
  - [ ] Email input field
  - [ ] Role selector (dropdown)
  - [ ] Send invitation button
  - [ ] Loading state
  - [ ] Success/error feedback

### Roles Management
- [ ] Create `src/client/pages/settings/RolesSection.tsx`
  - [ ] List existing roles (preset + custom)
  - [ ] Create new role button
  - [ ] Role editor form
    - [ ] Role name input
    - [ ] Permission checkboxes grouped by resource
  - [ ] Edit/Delete actions for custom roles

### Permission Gate Component
- [ ] Create `src/client/components/auth/PermissionGate.tsx`
  - [ ] Accept resource and action props
  - [ ] Render children only if user has permission
  - [ ] Support fallback prop

### Permission Hook
- [ ] Create `src/client/hooks/usePermission.ts`
  - [ ] `useHasPermission(resource, action)` hook
  - [ ] Returns boolean for conditional rendering

---

## Phase D: Integration (Week 2-3)

### Apply Permission Gates
- [ ] Orders page
  - [ ] Create button: `order:create`
  - [ ] Edit button: `order:update`
  - [ ] Delete button: `order:delete`
  - [ ] Status change: `order:status:update`
- [ ] Stores page
  - [ ] CRUD buttons with appropriate permissions
- [ ] Customers page  
  - [ ] CRUD buttons with appropriate permissions
- [ ] Invoices page
  - [ ] CRUD buttons with appropriate permissions
- [ ] Payments page
  - [ ] CRUD buttons with appropriate permissions
  - [ ] Confirm button: `payment:confirm`

### Member Role Badges
- [ ] Add role badge to member avatars/displays where relevant
- [ ] Show current user's role in settings

### Invitation Email Integration
- [ ] Setup email sending for invitations (Phase 4 dependency)
- [ ] Or implement invitation link display for manual sharing

---

## Phase E: Testing & Polish

### Unit Tests
- [ ] `permissions.test.ts` - Test permission middleware
- [ ] `members.test.ts` - Test member API endpoints
- [ ] `roles.test.ts` - Test role API endpoints

### Integration Tests
- [ ] Test complete invitation flow
- [ ] Test permission enforcement across routes
- [ ] Test role assignment changes

### Manual Testing
- [ ] Owner invites member with delivery role
- [ ] Member signs in with Google
- [ ] Member sees restricted UI
- [ ] Owner creates custom role
- [ ] Custom role assigned to member
- [ ] Verify API access matches UI access

### Documentation
- [ ] Update API.md with new endpoints
- [ ] Add members section to docs/README.md
- [ ] Update ROADMAP.md if needed


---

## Notes

- Better Auth handles most of the heavy lifting for member/invitation management
- Focus on custom permissions layer and UI integration
- Email sending for invitations may require Phase 4 (Notifications) completion first
- Alternative: Display shareable invitation links for MVP
