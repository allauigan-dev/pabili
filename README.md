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

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup

1. Create a D1 database:
```bash
wrangler d1 create pabili-db
```

2. Update `wrangler.jsonc` with your database ID

3. Create an R2 bucket:
```bash
wrangler r2 bucket create pabili-uploads
```

4. Generate and apply migrations:
```bash
npm run db:generate
npm run db:push
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
