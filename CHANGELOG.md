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

### Changed
- Dashboard UI refined for better "Mabuhay" experience and mobile responsiveness
- Standardized Card components to support interactive actions (delete/confirm)

### Fixed
- Navigation bug in `InvoiceCard` where ID template literal was escaped
- Numerous TypeScript type mismatches and unused variable warnings
- Badge variant type safety issues in multiple components
- Oversized icons and broken layout in Orders page and form by manually adding missing CSS utility classes (polyfill for missing Tailwind)

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
