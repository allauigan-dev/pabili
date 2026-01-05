# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Production Auth**: Fixed 500 errors on production auth endpoints by enabling environment-aware secure cookies (automatically enabled for HTTPS).
- **TypeScript Build**: Fixed type-only imports for `AppEnv` across all server route files to resolve build warnings.
- **LoginPage**: Removed unused `isPending` variable to fix TypeScript warning.
- **Sticky Header Cutoff**: Resolved issue where mobile headers were being clipped by refactoring the global layout and unified padding strategy.

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
