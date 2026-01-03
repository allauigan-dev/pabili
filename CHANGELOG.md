# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
