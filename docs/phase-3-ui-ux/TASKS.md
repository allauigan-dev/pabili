# Phase 3 Tasks: UI/UX Improvements

## 3.1 Mobile-First Experience

### Swipe Actions
- [ ] Install gesture library (`@use-gesture/react`)
- [ ] Create `SwipeableCard.tsx` wrapper component
- [ ] Add swipe left action (delete) with red background
- [ ] Add swipe right action (quick status) with green background
- [ ] Apply to OrderCard, PaymentCard
- [ ] Add visual indicators (icons sliding in)

### Pull to Refresh
- [ ] Create `PullToRefresh.tsx` component
- [ ] Integrate with React Query refetch
- [ ] Add pull indicator animation
- [ ] Apply to OrdersPage, ResellersPage, StoresPage

### Bottom Sheets
- [ ] Create `BottomSheet.tsx` component
- [ ] Add drag-to-dismiss gesture
- [ ] Replace status change modal with bottom sheet
- [ ] Replace filter modal with bottom sheet
- [ ] Add backdrop with click-to-close

### Haptic Feedback
- [ ] Create `useHaptics.ts` hook
- [ ] Add vibration on status change success
- [ ] Add vibration on payment confirmation
- [ ] Add subtle vibration on errors
- [ ] Respect user's reduce motion preference

### Floating Action Button
- [ ] Create `FAB.tsx` component
- [ ] Fixed position bottom-right
- [ ] Primary action: New Order
- [ ] Add entrance animation
- [ ] Hide on scroll down, show on scroll up

---

## 3.2 Search & Filter Enhancements

### Global Search
- [ ] Add search input to Header/Sidebar
- [ ] Create `useGlobalSearch.ts` hook
- [ ] Create GET `/api/search?q=` endpoint
- [ ] Return categorized results (orders, resellers, stores)
- [ ] Create `SearchResults.tsx` dropdown component
- [ ] Navigate to detail on result click
- [ ] Add keyboard shortcuts (Cmd/Ctrl + K)

### Smart Filters
- [ ] Define filter presets in config
- [ ] Create filter preset buttons component
- [ ] Apply preset on click
- [ ] Show active preset indicator

### Date Range Picker
- [ ] Create `DateRangePicker.tsx` component
- [ ] Add preset buttons (Today, Last 7 Days, etc.)
- [ ] Add calendar for custom range
- [ ] Integrate with order/invoice filters

### Saved Filters
- [ ] Create `useSavedFilters.ts` hook
- [ ] Store in localStorage
- [ ] Add "Save Filter" button
- [ ] Show saved filters in dropdown
- [ ] Delete saved filter option

---

## 3.3 Order List Optimizations

### Infinite Scroll
- [ ] Create `useInfiniteScroll.ts` hook
- [ ] Update orders API to support cursor pagination
- [ ] Add Intersection Observer at list bottom
- [ ] Show loading indicator during fetch
- [ ] Apply to OrdersPage

### Order Grouping
- [ ] Add groupBy toggle (Date, Reseller, Store, Status)
- [ ] Create group header component
- [ ] Collapse/expand groups
- [ ] Show count per group

### View Toggle
- [ ] Create view toggle button (card/compact)
- [ ] Create `CompactOrderRow.tsx` for table-like view
- [ ] Store preference in localStorage
- [ ] Apply to OrdersPage

### Status Strip
- [ ] Update OrderCard with left border strip
- [ ] Define status-to-color mapping
- [ ] Apply to all card types (Order, Invoice, Payment)

---

## 3.4 Form Experience

### Smart Defaults
- [ ] Create `useFormDefaults.ts` hook
- [ ] Store last used store_id in session
- [ ] Store last used reseller_id in session
- [ ] Pre-fill on new order form
- [ ] Add "Use Last" button option

### Price Calculator
- [ ] Create `PriceCalculator.tsx` component
- [ ] Display as sidebar or bottom card in form
- [ ] Calculate cost, reseller total, profit, margin
- [ ] Update in real-time as inputs change
- [ ] Highlight profit in green

### Auto-Save Drafts
- [ ] Create `useDraftForm.ts` hook
- [ ] Save form state to localStorage on change
- [ ] Debounce saves to every 5 seconds
- [ ] Prompt to restore draft on page load
- [ ] Clear draft on successful submit

### Camera Capture
- [ ] Update image input with `capture="environment"`
- [ ] Add camera icon button
- [ ] Preview captured image
- [ ] Compress image client-side before upload

### Voice Input
- [ ] Create `useVoiceInput.ts` hook
- [ ] Add microphone button to order name field
- [ ] Use Web Speech API for transcription
- [ ] Show listening indicator
- [ ] Fallback for unsupported browsers

---

## 3.5 Notifications & Feedback

### Toast Notifications
- [ ] Install `react-hot-toast` or `sonner`
- [ ] Create toast wrapper with custom styling
- [ ] Replace alert() calls with toast
- [ ] Add success toasts for CRUD operations
- [ ] Add error toasts for API failures

### Skeleton Loaders
- [ ] Create `OrderCardSkeleton.tsx`
- [ ] Create `StoreCardSkeleton.tsx`
- [ ] Create `ResellerCardSkeleton.tsx`
- [ ] Create `DashboardSkeleton.tsx`
- [ ] Replace loading spinners with skeletons

### Empty States
- [ ] Create `EmptyState.tsx` component
- [ ] Design/source illustrations for each entity
- [ ] Add helpful message and CTA
- [ ] Apply to all list pages

### Onboarding Tutorial
- [ ] Install tour library (e.g., `react-joyride`)
- [ ] Define tour steps for new users
- [ ] Trigger on first login
- [ ] Add "Don't show again" option
- [ ] Store completion in user preferences

---

## Testing

- [ ] Test swipe gestures on mobile devices
- [ ] Test pull to refresh on mobile
- [ ] Test bottom sheet drag behavior
- [ ] Test global search with various queries
- [ ] Test infinite scroll performance
- [ ] Test form draft restore flow
- [ ] Test voice input on supported browsers
- [ ] Accessibility testing for new components
