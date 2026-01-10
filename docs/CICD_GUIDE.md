# CI/CD Guide - Pabili

This guide outlines the Continuous Integration (CI) and Continuous Deployment (CD) processes for the Pabili project.

## Overview

The CI/CD pipeline ensures that every code change is tested, linted, and built correctly before being deployed to the production environment on Cloudflare.

## Tools & Services

- **CI Runner**: GitHub Actions (Recommended)
- **Deployment Platform**: Cloudflare Workers & Pages
- **Database**: Cloudflare D1
- **File Storage**: Cloudflare R2
- **Testing**: Vitest

---

## 1. Continuous Integration (CI)

CI should run on every Pull Request and pushed commit to any branch.

### Workflow Steps

1.  **Setup Node.js**: Use the version specified in `package.json` (v20+ recommended).
2.  **Install Dependencies**: `npm ci` (use `ci` for clean, reproducible installs).
3.  **Lint**: `npm run lint` — ensures code consistency and catches common errors.
4.  **Type Check**: `npm run build` — the build script includes `tsc -b`, which performs a full TypeScript compilation check.
5.  **Run Tests**: `npm run test:run` — executes Vitest suite once.

### Recommended GitHub Action Trigger
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
```

---

## 2. Continuous Deployment (CD)

CD should run only when changes are merged into the `main` branch.

### Prerequisites

You must configure the following secrets in your GitHub repository:
- `CLOUDFLARE_API_TOKEN`: Created in the Cloudflare Dashboard with "Edit Cloudflare Workers" permissions.
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID (found in the dashboard sidebar).

### Workflow Steps

1.  **Build**: `npm run build` — generates the production assets in `dist/`.
2.  **Database Migrations**: `npm run db:migrate` — applies pending Drizzle migrations to the production D1 database.
    - *Command*: `wrangler d1 migrations apply pabili-db --remote`
3.  **Deployment**: `npm run deploy` — deploys the Worker and static assets to Cloudflare.
    - *Command*: `wrangler deploy`

---

## 3. Database Management

### Generating Migrations
If you've modified `src/server/db/schema.ts`, generate a new migration locally first:
```bash
npm run db:generate
```

### Manual Deployment
If you need to manually deploy (e.g., for hotfixes), ensure you have the correct environment variables and run:
```bash
npm run deploy
```

---

## 4. Environment Configuration

Ensure that your `wrangler.jsonc` is correctly configured for your production environment:
- `database_id`: Must match your production D1 database.
- `bucket_name`: Must match your production R2 bucket.

Secrets for the production Worker should be set via:
```bash
wrangler secret put <SECRET_NAME>
```

---

## 5. Potential Improvements

- **Staging Environments**: Use [Cloudflare Worker Environments](https://developers.cloudflare.com/workers/wrangler/environments/) to set up a `preview` or `staging` environment.
- **E2E Testing**: Add Playwright or Cypress for end-to-end testing of the full checkout/pasabuy flow.
- **Preview Deployments**: Configure GitHub Actions to deploy to a preview URL for every Pull Request.
