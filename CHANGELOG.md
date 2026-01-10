# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!-- 2026-01-11 -->

### Added
- **Unit Tests**: Added comprehensive test suites for `OrgGuard`, `OrganizationSwitcher`, and `useLocalStorage` to ensure UI stability and hook reliability.

### Changed
- **Form Standardization**: Refactored `CustomerForm`, `InvoiceForm`, `PaymentForm`, and `StoreForm` to follow the unified premium design system, including standardizing class names and layout.
- **Card UI Refresh**: Updated `CustomerCard` and `PaymentCard` with consistent compact layouts and improved visual hierarchy.
- **Swipe Actions**: Updated `OrderCard` swipe actions for better consistency with the application's gesture system.

### Removed
- **Redundant Scripts**: Removed `scripts/wipe.sql` as it has been superseded by more robust seeding and management utilities.

<!-- 2026-01-10 -->


### Added
- **Buy List Module**: Implemented a new "Buy List" feature that groups pending orders by store for efficient purchasing. Includes a dedicated `BuyListPage` for store overview and `BuyListStorePage` for store-specific order lists.
- **Database Utilities**: Added `scripts/wipe.sql` for cleaning up local development data.

### Changed
- **Order Card UI**: Refactored `OrderCard` with a more compact layout, relocating action buttons (edit/delete) to save space and added the ability to hide the store name in context.
- **Customer Card UI**: Updated `CustomerCard` to move action buttons to the right side, improving vertical scanning.
- **Store Card UI**: Refined layout of `StoreCard` for better consistency with other card components.
- **Navigation**: Added "Buy List" to the sidebar and configurable bottom navigation bar.
- **Seed Data Logic**: Significantly updated `scripts/generate-seed.cjs` to automatically detect Organization IDs, handle image metadata more effectively, and use explicit IDs for deterministic seeding.
- **API Enhancements**: Refactored `orders.ts` routes to support filtering by store ID and improved TypeScript types for list responses.

### Fixed
- **Invoice Form**: Fixed the cancel button functionality in `InvoiceForm`.
- **Infinite Scroll**: Improved `useInfiniteScroll` hook to handle deduplication and refetching more reliably, resolving "duplicate key" issues during rapid data updates.
- **Type Safety**: Improved Zod schemas and TypeScript interfaces for better consistency across client and server.

### Added (Previous)
- **Business Analysis**: Created `docs/BUSINESS_ANALYSIS.md` containing a comprehensive MVP roadmap and business model analysis.
- **CI/CD Documentation**: Created `docs/CICD_GUIDE.md` to document the project's CI/CD pipeline and deployment strategies.
- **Vite Stability**: Added explicit HMR configuration in `vite.config.ts` to improve development experience when using the Cloudflare Workers plugin.

### Changed
- **Documentation Index**: Updated `docs/README.md` to include references to the new business analysis and CI/CD guide.
- **Design System Refresh**:
  - Reduced base border radius from `0.5rem` to `0.375rem` for a sharper, more modern appearance.
  - Refined radius variables (`xl`, `2xl`, `3xl`) for better scaling across components.
  - Updated sidebar and header search inputs to use standardized radius variables.
- **Dashboard Greeting**: Updated dashboard title from "Mabuhay" to "Welcome" for a more professional tone.
- **Header Cleanup**: Removed redundant desktop logo icon to simplify the navigation bar.

<!-- 2026-01-09 -->

### Added
- **Gender Icon System**: Added gender field to user schema and created `useGenderIcon` hook for gender-based avatar icons in Header and Sidebar.
- **Image Upload Compression**: Implemented client-side image compression before upload using Canvas API (`src/client/lib/image-compression.ts`). Automatically resizes images to max 1920×1080, compresses to 80% quality, and converts large PNG/WebP files to JPEG.

### Fixed
- **Swipe Card Flash**: Fixed issue where swiping to change order/invoice status briefly showed "No orders found" by adding a `refetch()` function to `useInfiniteScroll` that updates data without clearing existing items.

### Changed
- **Login Page**: Updated styling and authentication options for improved UX.
- **PWA Manifest**: Updated app icons and manifest configuration.

---

### Added
- **Members Feature Planning**: Created comprehensive implementation plan and task checklist for team member management with role-based access control (`docs/members/IMPLEMENTATION.md`, `docs/members/TASKS.md`).

### Changed
- **Agent Rules**: Condensed `.agent/rules.md` from 423 lines to ~75 lines while preserving all essential conventions, multi-tenancy rules, and key principles.
- **Git Workflow**: Improved `.agent/workflows/git.md` with detailed step-by-step instructions, changelog format guidelines, and commit conventions.

### Added
- **Dashboard Card Reordering**:
  - Implemented drag-and-drop reordering for Dashboard cards using `@dnd-kit`.
  - Created `DashboardCardsReorder`, `DashboardCardItem` components, and `useDashboardCards` hook.
  - Added persistence for dashboard card layout in local storage.
- **Modern Drag-and-Drop Infrastructure**:
  - Migrated stateful reordering components to `@dnd-kit` for superior performance and accessibility.
  - Implemented `SortableContext` with vertical list strategies and sensor-based event handling.

### Fixed
- **Quick Action Layout**: Fixed layout of quick action reorder buttons to prevent them from being cut off by the sidebar on desktop screens.
- **Server Stats Precision**: Optimized `/api/stats/counts` route to provide more accurate and efficient entity counting for the dashboard.

### Changed
- **Navigation Reordering Migration**:
  - Migrated `NavigationSection` from `@use-gesture/react` to `@dnd-kit` to resolve positional tracking issues.
  - Improved drag-start delay and touch tolerance for better mobile UX.
- **Image Gallery Modal**: Fixed event propagation issue where closing the image gallery modal on order cards would trigger navigation to order details. Added `stopPropagation` handlers to `DialogOverlay` and `DialogContent` components.

### Changed
- **Login Page Redesign**:
  - Redesigned the login page to align with the project's premium design system.
  - Implemented semantic theme variables for consistent light/dark mode support.
  - Added visual enhancements including a glassmorphism effect and background animations.
  - Updated social sign-in buttons to match the new UI component style.

### Changed
- **Phase 3 (UI/UX)**: Removed Voice Input feature (too niche for SaaS MVP)
- **Phase 4 (Notifications)**: Moved WhatsApp/Viber integration to Phase 14 (Customer Support)
- **Phase 6 (Advanced Features)**: Deprioritized Inventory Tracking, added Customer Portal
- **Phase 7 (Localization)**: Deprioritized Logistics Integration to future release
- **ROADMAP.md**: Complete restructure with 14-phase SaaS roadmap, launch phases, and effort estimates
- **docs/README.md**: Reorganized by category (Core SaaS, Core Features, Customer Success, Nice to Have) with launch checklist

### Added
- **Server-Side Search**:
  - Implemented high-performance server-side search across all core entities: Customers, Stores, Orders, Payments, and Invoices.
  - Added support for fuzzy matching using SQL `LIKE` operations on the backend.
  - Integrated search state into the `useInfiniteScroll` hook for seamless pagination with search queries.
- **Enhanced Dashboard Analytics**:
  - Developed a new `stats` API route (`/api/stats/counts`) for centralized entity and status counting.
  - Created `useStatusCounts` hook to provide real-time status aggregations for the dashboard.
  - Fixed inaccurate dashboard counts by moving from client-side array length counting to server-side SQL counts.
- **Customer Status Management**:
  - Added a "Status" field (Active/Inactive) to the customer schema and exposed it in `CustomerForm`.
  - Implemented visual status indicators in `CustomerCard` and `CustomerDetails` view.
- **Demo Data Improvements**:
  - Enhanced `generate-seed.cjs` script to automatically inject realistic image URLs from Unsplash/Picsum for stores, customers, and orders.
  - Improved multi-tenant seeding logic to handle image metadata more effectively.

- **Dropdown Filtering**:
  - Implemented automatic filtering in `OrderForm`, `PaymentForm`, and `InvoiceForm` to hide inactive customers and stores.
  - Ensured historical data remains visible by allowing the currently selected inactive item to still appear in the list during edits.
- **UI Error Fixes**:
  - Resolved `ReferenceError` in form components caused by accessing `formData` state before initialization.
  - Fixed "Maximum update depth exceeded" error in `AppearanceSection` by optimizing `useLocalStorage` with `useRef` for initial values and `setTimeout` for state sync.
- **Theme Rendering**:
  - Added a blocking script in `index.html` to apply theme and accent color preferences before the first paint, effectively eliminating FOUC.

### Added
- **Accent Color Theming**:
  - Added 6 premium accent color options (Violet, Blue, Teal, Rose, Amber, Emerald) in Appearance settings.
  - Created `useAccentColor` hook for persistent accent color selection.
  - Updated `theme.css` with accent color palettes using `data-accent` attribute selectors.
- **Configurable Mobile Navigation**:
  - Users can now customize which items appear in the mobile bottom navigation (up to 4 items).
  - Dashboard is always visible and cannot be removed.
  - Implemented drag-and-drop reordering for navigation items in Settings.
  - Created `useNavConfig` hook for persistent navigation configuration.
  - Enhanced `useLocalStorage` hook to support real-time sync across components using custom events.
  - Added new "Navigation" tab in Settings page with live preview.
- **Auto-Organization Creation**:
  - Implemented automatic organization creation for new users (e.g., "John's PaOrders") during initial sign-in.
  - Updated `OrgGuard` and application routing to remove the mandatory onboarding step, providing a seamless multi-tenant entry.
  - Repurposed the onboarding page into a "Create Organization" page for manual growth and fallback scenarios.
  - Updated database schema (`organization` table) to support creator tracking and user-specific organization slugs.
- **Collapsible Desktop Sidebar**:
  - Implemented a persistent, collapsible sidebar system using `SidebarProvider` and `useLocalStorage`.
  - Refactored `Sidebar`, `Layout`, and `Header` to support dynamic width transitions using CSS variables.
  - Added tooltips and icon-only mode for collapsed state to maximize workspace area on desktop.
- **Mobile UI Enhancements**:
  - Improved Dashboard quick actions on mobile with clear visual cues for horizontal scrollability.
- **Invoice Management**:
  - Refined `InvoiceForm` to only display orders with a `delivered` status as available options, ensuring business process consistency.
- **Developer Tools**:
  - Created `scripts/generate-seed.cjs`, a robust multi-tenant utility for seeding sample data across isolated organizations while preventing constraint violations.
- **Settings & Personalization**:
  - Implemented a dedicated Settings section with Appearance, Profile, and Organization management sub-pages.

### Added
- **Activity Feed Improvements**:
  - **Natural Language Formatting**: Updated Dashboard activity feed to display events as natural sentences (e.g., "Order #123 was placed", "Customer John added") instead of generic titles.
  - **Deletion Tracking**: Implemented logging for deleted items (Orders, Customers, Stores, Payments) so they appear in the activity feed.
  - **Auto-Refresh**: Implemented real-time updates for the activity feed using a cache invalidation system in `api.ts`, ensuring the feed updates instantly without manual refresh.
- **Detail View UI Implementation**:
  - Created dedicated read-only **Detail Pages** for Orders, Customers, Stores, Invoices, and Payments (accessed via `/:id` paths).
  - Implemented clickable card rows in all list pages that automatically navigate to their respective Detail views.
  - Added event propagation prevention on cards to allow interacting with buttons, status selectors, and image galleries without accidental navigation.
  - Updated all form and detail pages to support "Navigate Back" behavior on Cancel, improving UX flow from details to list.
  - Refined Detail View UI with high-fidelity summaries, full-screen image previews, and financial breakdowns.

### Added
- **Phase 8 Planning**: Created comprehensive documentation for Settings page implementation in `docs/phase-8-settings/`.

### Fixed
- **Search Component**: Fixed search functionality in header that was not filtering results when typing.
  - Refactored `HeaderProvider.tsx` to store the search callback in context and call it directly from `Header.tsx`.
  - Eliminated infinite loop issues caused by bidirectional sync between page state and context.

### Added
- **Theme System**: Implemented a comprehensive theme management system with light, dark, and AMOLED modes.
  - Created `useTheme` hook for persistent theme state and system preference detection in `src/client/hooks/useTheme.ts`.
  - Added AMOLED mode specifically for OLED devices with pure black (#000000) backgrounds.
  - Updated `src/client/styles/theme.css` with dark and AMOLED color palettes and CSS variables.
- **UI Design Guidelines**: Documented comprehensive UI/Component Design Patterns in `.agent/rules.md` to ensure design consistency across the application.

### Changed
- **Mobile-First UI Refactor**: Enhanced mobile responsiveness and premium UI across core pages:
  - Updated `Dashboard`, `Orders`, `Customers`, `Invoices`, `Payments`, and `Stores` pages with improved layouts and mobile-optimized interactions.
  - Refined `Header` and `Sidebar` components to support the new theme system and improve navigation.
- **Improved Quick Actions**: Updated Dashboard quick actions with persistence and customization options.
- **Infinite Scroll**: Replaced pagination with auto-loading infinite scroll across all list pages:
  - Created `useInfiniteScroll` hook using Intersection Observer API
  - Added `listPaginated` functions to all API objects (`ordersApi`, `storesApi`, etc.)
  - Updated `OrdersPage`, `PaymentsPage`, `StoresPage`, `CustomersPage`, `InvoicesPage` with sentinel-based loading
  - Shows loading spinner at bottom when fetching more items
  - Displays "All X items loaded" when complete
- **Backend Pagination**: Added `page` and `limit` query params to all list endpoints with `meta` response containing total count
- **Local Dev Seeding Docs**: Updated `README.md` and `.agent/workflows/dev.md` with instructions for local database seeding and mandatory organization setup.
- **Improved Seeding Workflow**: Added requirement for developers to sign in and create an organization before seeding.

### Changed
- **Seed Scripts**: Updated `scripts/seed.sql` and `scripts/seed-orders.sql` with a valid organization ID and improved instructions.

### Changed
- **Customer Balance Optimization**: Fixed N+1 query issue where each `CustomerCard` made a separate API call for balance:
  - Backend `/api/customers` now includes `totalOrders`, `totalPayments`, and `balance` for each customer
  - `CustomerCard` uses embedded balance data directly instead of separate `useCustomerBalance` hook
- **Client-Side API Cache**: Implemented in-memory caching for API responses to eliminate skeleton loading on page navigation:
  - GET requests are cached with 30-second TTL
  - Mutations (POST/PUT/DELETE) automatically invalidate related caches
  - Related resources are also invalidated (e.g., order changes invalidate customer balances)

### Changed
- **Enhanced PWA Service Worker** (`sw.js`):
  - Added cache size limits to prevent storage issues
  - Implemented Google Fonts caching for offline use
  - Improved SPA fallback for offline navigation
  - Added client communication for cache management (`SKIP_WAITING`, `GET_VERSION`, `CLEAR_CACHE`, `SYNC_NOW`)
  - Extended precaching to include all icon sizes
- **Improved Service Worker Registration** (`main.tsx`):
  - Replaced browser `confirm()` with styled update notification banner
  - Added visibility-based update checks (checks when user returns to tab)
  - Exposed `window.pwaUtils` for debugging (`checkForUpdate`, `clearCache`, `syncNow`, `getVersion`)
  - Added periodic sync registration for supported browsers
- **API Hook Optimization** (`useApi.ts`): Hook now starts with `loading: false` when cached data may exist, preventing unnecessary skeleton states
- **Offline Storage Utilities** (`useOfflineStorage.ts`): Added `useSyncEvents` hook and `triggerBackgroundSync`/`requestManualSync` utilities
- **Build Optimization**: Configured Vite code splitting with manual chunks to separate React, React Router, Radix UI, and Lucide icons into vendor bundles. Reduced main application bundle size by ~70% (569KB to 176KB).
- **PWA UI**: Updated `offline.html` and `InstallBanner.tsx` to align with the app's Violet design system, replacing the legacy Teal theme and adding Inter font support.


### Added
- **PWA Best Practices Implementation**:
  - Enhanced `manifest.json` with multiple icon sizes (48-512px), maskable icons, and app shortcuts
  - Rewrote `sw.js` with intelligent caching strategies (cache-first, network-first, stale-while-revalidate)
  - Created `offline.html` styled fallback page with auto-reconnection
  - Added `useOfflineStorage.ts` hook for IndexedDB with background sync support
  - Added `useInstallPrompt.ts` hook for custom install prompt handling
  - Created `OfflineIndicator.tsx` component for online/offline status display
  - Created `InstallBanner.tsx` component for custom PWA install prompts
  - iOS-specific splash screen support and meta tags in `index.html`
  - Service worker update detection with user notification in `main.tsx`

### Changed
- **Deployment Workflow**: Integrated automatic D1 migrations into the `deploy` script to ensure database schema synchronization during application deployment.
- **Database Configuration**: Updated `wrangler.jsonc` with the new production D1 database instance ID.

### Fixed
- **Documentation**: Corrected migration commands in `README.md` for remote database management.


### Fixed
- **Order Form Improvements**:
    - Redesigned Quantity stepper with larger touch targets and centered display for better mobile UX.
    - Improved Status dropdown by converting to full-width and removing redundant status dots.
    - Fixed quantity button order to follow standard minus/plus positioning.
- **Form Submission**: Fixed "Save" button in the global sticky footer (`FormActions`) to correctly trigger form submission across `OrderForm`, `CustomerForm`, `StoreForm`, and `PaymentForm`.
- **TypeScript**: Refactored form submission handlers to be event-optional, resolving type errors when called programmatically.
- **Quantity Validation**: Added fallback for potentially undefined quantity and disabled decrement button when quantity is 1.

### Changed
- **Resellers → Customers Rename**: Refactored the entire application to use "Customers" terminology instead of "Resellers":
  - Renamed database table `resellers` → `customers` with updated column names (`customer_name`, `customer_id`, etc.)
  - Updated all API routes (`/api/resellers` → `/api/customers`)
  - Migrated frontend pages, hooks, and components to use `Customer` terminology
  - Updated Orders, Invoices, and Payments to reference `customer_id` instead of `reseller_id`
  - Renamed pricing fields: `order_reseller_price` → `order_customer_price`, `order_reseller_total` → `order_customer_total`
- **Database Schema Reset**: Regenerated migrations from scratch to resolve migration conflicts from the rename refactor.

### Added
- **Dynamic Header System**: Implemented `HeaderProvider` context for dynamic page headers with search and filter support.
- **FilterPills Component**: Created reusable filter pill UI component for status filtering across list pages.
- **Customers Module**: New `/customers` routes with full CRUD operations, replacing the old Resellers module.

### Removed
- **Resellers Module**: Removed all reseller-related files (`ResellersPage`, `ResellerForm`, `ResellerCard`, `useResellers` hook, and API routes).

### Fixed
- **Production Auth**: Fixed 500 errors on production auth endpoints by enabling environment-aware secure cookies (automatically enabled for HTTPS).
- **TypeScript Build**: Fixed type-only imports for `AppEnv` across all server route files to resolve build warnings.
- **LoginPage**: Removed unused `isPending` variable to fix TypeScript warning.
- **Sticky Header Cutoff**: Resolved issue where mobile headers were being clipped by refactoring the global layout and unified padding strategy.
- **Scroll Restoration**: Fixed issue where scroll position persisted across route navigations by implementing a `ScrollToTop` component to reset window scroll.

### Added
- **Global FAB**: Implemented a global Floating Action Button with "Scroll to Top" functionality and dynamic positioning.
- **Image Gallery Refinements**: Added swipe validation, glassmorphism UI, and dot indicators to the Image Gallery.
- **Swipe Navigation**: Enabled horizontal swipe navigation between main tabs on mobile.

### Fixed
- **FAB Positioning**: Resolved issue where FAB was trapped in stacking context and overlapped with Bottom Navigation by using React Portals and adjusting z-index/margins.
- **Gesture Conflicts**: Fixed conflict between Image Gallery swipe and global page navigation.

### Added
- **Order Management: Multiple Images**:
    - Added support for up to 5 images per order.
    - Implemented a multi-upload grid in `OrderForm` with thumbnail previews and delete capability.
    - Created a premium `ImageGallery` modal with mobile swipe gestures, keyboard navigation, and dot indicators.
    - Added an image count badge to `OrderCard` for quick visual reference.

### Added
- **UI/UX: Unified Premium Form Design**:
    - Implemented a consistent, mobile-first sticky header across all entity forms (`OrderForm`, `StoreForm`, `ResellerForm`, `PaymentForm`, `InvoiceForm`).
    - Added high-density typography and premium CSS glassmorphism effects to form headers.
    - Simplified form header UX by removing redundant "Save" buttons in favor of primary action buttons at the bottom.
- **UI Components**:
    - Added `Combobox` and `Command` components for improved selection UX (e.g., searching for Stores/Resellers in forms).


### Added
- **Phase 1: Multi-Tenancy & Authentication (Better Auth Integration)**:
  - Integrated **Better Auth** with Google and Facebook social login providers.
  - Implemented multi-tenant data isolation using the Better Auth **Organization plugin**.
  - Added `organization_id` to all business tables (`stores`, `resellers`, `orders`, `invoices`, `payments`, `images`) for secure data partitioning.
  - Created server-side middlewares (`requireAuth`, `requireOrganization`) to enforce access control.
  - Developed a custom **Organization Onboarding** flow for new users.
  - Integrated **Organization Switcher** and **OrgGuard** for seamless tenant management.
  - Updated all API routes to filter data by active organization.
  - **API Documentation**: Created `docs/API.md` for backend endpoint reference.
  - **Mobile UI Refinements**:
    - Improved Sidebar responsiveness with mobile-friendly organization switcher and settings.
    - Fixed Header and BottomNav positioning for true mobile-first experience.
    - Refined `OrderCard` layout: removed date, added store name, and relocated action buttons for better density.
- **Feature Roadmap** (`ROADMAP.md`): Comprehensive 7-phase SaaS feature roadmap tailored to pasabuy business model
- **Phase Documentation** (`docs/`): Implementation plans and task checklists for all 7 development phases:
  - Phase 1: Multi-Tenancy & Authentication
  - Phase 2: Admin/Owner Experience Improvements
  - Phase 3: UI/UX Improvements
  - Phase 4: Communication & Notifications
  - Phase 5: Billing & Subscription (SaaS Monetization)
  - Phase 6: Advanced Features (Reports, Inventory, Reseller Portal)
  - Phase 7: Localization & Philippine Market
- Initial project scaffolding with React + Vite
- Project specification document (`spec.md`)
- Development and agent rules configuration
- Testing framework with Vitest and React Testing Library
- Comprehensive test suite (103 tests) for all API routes and components
- Test files for stores, orders, invoices, payments, resellers, and upload APIs
- Progressive Web App (PWA) support with manifest and service worker
- Delete functionality for Orders, Stores, Resellers, Payments, and Invoices
- Payment confirmation feature in the Payments module
- Enhanced Dashboard with real-time statistics, recent activity, and quick actions
- Dedicated hooks for `useInvoices` and `usePayments`
- Custom premium PWA app icon
- shadcn/ui component library integration (`components.json`, `src/client/components/ui/`)
- File serving API route (`src/server/routes/files.ts`) for R2 bucket file retrieval
- Utility function `cn()` for conditional class names (`src/client/lib/utils.ts`)

### Changed
- Dashboard UI refined for better "Mabuhay" experience and mobile responsiveness
- Standardized Card components to support interactive actions (delete/confirm)
- Migrated custom UI components (Badge, Button, Card, Input, Modal, Select) to shadcn/ui
- Updated all page components to use shadcn/ui components
- Refactored layout components (Header, Sidebar, BottomNav, Layout) for shadcn/ui compatibility
- Enhanced theme CSS with additional design tokens and utility classes
- Updated TypeScript configuration for better path resolution

### Fixed
- **Database Setup**: Fixed "no such table: orders" error by documenting required local D1 migration step

### Changed
- **README.md**: Improved dev setup documentation with clear Quick Start section and local D1 migration instructions.
- **Agent Guidelines**: Added clear instructions for resetting local D1 database and R2 storage in `.agent/rules.md` and `.agent/workflows/dev.md`.

### Fixed
- Navigation bug in `InvoiceCard` where ID template literal was escaped
- Numerous TypeScript type mismatches and unused variable warnings
- Badge variant type safety issues in multiple components
- Oversized icons and broken layout in Orders page and form by manually adding missing CSS utility classes (polyfill for missing Tailwind)
- Upload 500 error by adding R2 bucket binding (`BUCKET`) to `wrangler.jsonc`
- 404 errors for uploaded images by implementing file serving route
- API validation errors in Order Form by aligning frontend/backend field names
- React rendering errors when displaying API validation messages
- NaN API requests in entity forms by checking for valid IDs before fetching
- Input placeholder deletion issue in forms
- Dropdown menu layout issue in `Select` component
- Fixed `OrderForm` status options to match database schema (removed invalid statuses, added `no_stock`)

### Added
- **Order Status Management**: Added quick status update button on Order Cards with valid status transition logic.

### Changed
- **Redesigned Order Form**: Complete visual overhaul of "Create New Order" page with premium UI, custom file upload, and improved layout.
- **Theme Update**: Introduced new color palette (Violet/Gray) and updated design tokens in `theme.css`.
- **Order Cards**: Refined layout to be more compact, allowing 8+ cards per screen.
- **Store & Reseller Cards**: Redesigned to match the horizontal layout of Order cards.
- **Uniform Layouts**: Standardized `InvoicesPage`, `PaymentsPage`, and their respective cards to match the new compact design.

### Added
- **Customizable Quick Actions**: Implemented configurable quick actions on the dashboard with persistence using `useLocalStorage`.
- **Meta Tag Update**: Replaced deprecated `apple-mobile-web-app-capable` with `mobile-web-app-capable` in `index.html`.

### Fixed
- **Build & Deploy**: Resolved TypeScript errors in `ResellerForm` and `InvoiceForm` to ensure successful build.
- **Project Configuration**: Excluded `src/server` from client build in `tsconfig.app.json` to prevent type conflicts.
- **Server Deployment**: Updated `wrangler.jsonc` with new D1 database ID (`pabili-db`) and configured migrations directory.
- **Type Definitions**: Regenerated `worker-configuration.d.ts` to include correct `Env` bindings for DB and BUCKET.

### Deprecated
- N/A

### Removed
- N/A

### Security
- N/A

---

## Version History

<!-- 
## [1.0.0] - YYYY-MM-DD

### Added
- Dashboard with order overview and quick stats
- Order management (CRUD operations)
- Stores management
- Resellers management
- Payments tracking with proof upload
- Invoice generation
- PWA support with offline capabilities
- Cloudflare D1 database integration
- Cloudflare R2 file storage integration
-->
