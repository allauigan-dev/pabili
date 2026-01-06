# Pabili - Pasabuy Order Management System

A PWA-based order management system for pasabuy (buy-on-behalf) businesses, designed for resellers and store operators in the Philippines.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Hono (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **File Storage**: Cloudflare R2

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Cloudflare account (for D1 and R2)

### Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Setup local environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your own secrets!

# Apply database migrations locally (required before first run)
npx wrangler d1 migrations apply pabili-db --local

# Seed local database (optional - for sample data)
npx wrangler d1 execute pabili-db --local --file=scripts/seed.sql && npx wrangler d1 execute pabili-db --local --file=scripts/seed-orders.sql

# Start development server
npm run dev
```

> [!IMPORTANT]
> **Before Seeding**: You must first run the app, sign in, and create an organization. Then, update the `organization_id` in `scripts/seed.sql` and `scripts/seed-orders.sql` with your actual organization ID from the database before running the seed command.

### Full Database Setup (For New Projects)

If you're setting up the project from scratch, follow these additional steps:

1. Create a D1 database:
```bash
wrangler d1 create pabili-db
```

2. Update `wrangler.jsonc` with your database ID

3. Create an R2 bucket:
```bash
wrangler r2 bucket create pabili-uploads
```

4. Generate migrations from schema (if schema changes):
```bash
npm run db:generate
```

5. Apply migrations:
```bash
# For local development
npx wrangler d1 migrations apply pabili-db --remote

# For production
npm run db:migrate
```

### Deployment

```bash
npm run deploy
```

## Project Structure

```
pabili/
├── src/
│   ├── client/           # React frontend (coming soon)
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   └── lib/          # Utilities
│   ├── server/           # Hono API
│   │   ├── db/           # Drizzle schema
│   │   └── routes/       # API routes
│   ├── App.tsx           # Main React app
│   └── main.tsx          # Entry point
├── worker/               # Cloudflare Worker
├── drizzle/              # Database migrations
├── public/               # Static assets
└── wrangler.jsonc        # Cloudflare config
```

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Orders | GET, POST, PUT, PATCH, DELETE `/api/orders` |
| Stores | GET, POST, PUT, DELETE `/api/stores` |
| Resellers | GET, POST, PUT, DELETE `/api/resellers` |
| Payments | GET, POST, PUT, PATCH, DELETE `/api/payments` |
| Invoices | GET, POST, PUT, PATCH, DELETE `/api/invoices` |
| Upload | POST, DELETE `/api/upload` |

## License

Private
