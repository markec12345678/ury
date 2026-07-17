# URY Dashboard — Restaurant Management

Interactive dashboard for the [URY](https://github.com/ury-erp/ury) open-source restaurant management system, built on ERPNext/Frappe.

![URY Dashboard](download/ury-dashboard-overview.png)

## Features

### 11 Interactive Tabs

| Tab | Description |
|---|---|
| **Pregled** | Daily KPI cards, hourly sales chart (dine-in vs takeaway), recent orders table |
| **Mize** | Visual grid of 32 tables across 4 rooms with real-time status updates |
| **Kuhinja** | Live KOT (Kitchen Order Ticket) display with status workflow, audio alerts |
| **Naročila** | Order management with filtering, status tracking, and detail views |
| **Jedilnik** | Menu browsing with categories, items, and pricing |
| **P&L** | Daily Profit & Loss with 7-day charts, expense donut, line items |
| **Smena** | Shift management, cashier tracking, payment breakdown (cash/card/UPI) |
| **API Explorer** | Searchable catalog of all URY REST API endpoints with parameter details |
| **Arhitektura** | Animated system architecture diagram, 35 doctypes, 7 document event hooks |
| **Menu Management** | CRUD operations for menu items, categories, and pricing |
| **Report Generator** | Custom report generation with configurable parameters and export |

### Frappe Backend Integration

- **Settings page** for configuring Frappe/ERPNext connection
- **Two auth modes**: Username+Password or API Token
- **Auto-fallback**: Uses mock data when no backend is connected
- **Real data refresh**: Fetches live KOT, tables, and invoices from Frappe
- **Connection status indicator** throughout the dashboard

### Real-Time Updates

- **Socket.io** integration for live kitchen and table updates
- Simulated restaurant events (new KOTs, status changes, table occupancy)
- Flash animations, audio beeps, and notification banners
- Live/Simulation status indicator

### Additional Features

- **Command Palette** — Quick navigation and actions via keyboard shortcut
- **Notification Center** — Centralized notification management with history
- **Error Boundary** — Graceful error handling with recovery options
- **Toast Notifications** — Non-intrusive feedback for user actions
- **Dark/Light mode** toggle
- Restaurant-themed color palette (emerald + amber)
- Responsive layout (mobile sidebar overlay, adaptive grids)
- Framer Motion tab transitions and component animations
- Built with shadcn/ui component library

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts |
| State | Zustand |
| Real-time | Socket.io |
| Auth | NextAuth v4 (Frappe Credentials Provider) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Database | Prisma (SQLite/PostgreSQL) |
| Testing | Vitest + Playwright |
| CI/CD | GitHub Actions |
| Backend | Python/Frappe/ERPNext (URY) |

## Getting Started

### Prerequisites

- Node.js >= 18.20
- bun (or npm/yarn)
- Frappe/ERPNext server with URY installed (optional, for live data)

### Installation

```bash
# Clone the repo
git clone -b dashboard https://github.com/markec12345678/ury.git
cd ury

# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Start real-time simulation (optional)
cd mini-services/ury-realtime && bun install && bun run dev &
cd ../..

# Start the dashboard
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Connecting to a Real Frappe Server

1. Open the dashboard and click **Nastavitve** (Settings) in the sidebar
2. Enter your Frappe server URL (e.g., `https://erp.myrestaurant.com`)
3. Choose authentication mode:
   - **Username + Password**: Standard Frappe login
   - **API Token**: Generate keys in Frappe User settings
4. Click **Shrani in preveri** (Save and Test)
5. Dashboard will switch from DEMO to LIVE mode

> **Note**: Your Frappe server must have CORS configured to allow requests from the dashboard URL.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_FRAPPE_URL` | — | Frappe backend URL (optional — can also configure via Settings UI) |
| `NEXTAUTH_URL` | `http://localhost:3000` | Dashboard URL for NextAuth |
| `NEXTAUTH_SECRET` | — | Secret key for JWT signing (change in production!) |
| `NEXT_PUBLIC_SOCKET_PORT` | `3003` | Socket.io simulation port |
| `NEXT_PUBLIC_REFRESH_INTERVAL` | `30000` | Auto-refresh interval in milliseconds |
| `NEXT_PUBLIC_RESTAURANT_NAME` | `URY Restaurant` | Default restaurant name in demo mode |
| `NEXT_PUBLIC_CURRENCY` | `€` | Currency symbol |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard (single-page app)
│   ├── settings/page.tsx     # Frappe connection & auth settings
│   ├── api/                  # Next.js API routes
│   │   ├── auth/             # NextAuth API route
│   │   ├── frappe/           # Frappe proxy API route
│   │   ├── health/           # Health check endpoint
│   │   ├── menu/             # Menu API (categories, items)
│   │   ├── orders/           # Orders API
│   │   ├── rooms/            # Rooms API
│   │   └── tables/           # Tables API
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── dashboard/
│   │   ├── overview-tab.tsx       # KPI cards + sales chart
│   │   ├── tables-tab.tsx         # Table grid with real-time updates
│   │   ├── kitchen-tab.tsx        # KOT cards with live status
│   │   ├── orders-tab.tsx         # Order management
│   │   ├── menu-tab.tsx           # Menu browsing
│   │   ├── pl-tab.tsx             # P&L charts and breakdown
│   │   ├── shift-tab.tsx          # Shift management & cashier tracking
│   │   ├── api-explorer-tab.tsx   # API endpoints catalog
│   │   ├── architecture-tab.tsx   # System architecture diagram
│   │   ├── menu-management-tab.tsx # Menu CRUD operations
│   │   ├── report-generator-tab.tsx # Custom report generation
│   │   ├── advanced-dashboard-tab.tsx # Advanced analytics
│   │   ├── command-palette.tsx    # Keyboard shortcut command palette
│   │   ├── notification-center.tsx # Centralized notifications
│   │   ├── error-boundary.tsx     # Graceful error handling
│   │   └── toast-container.tsx    # Toast notification management
│   └── ui/                        # shadcn/ui components
├── hooks/
│   ├── use-keyboard-shortcuts.ts  # Global keyboard shortcuts
│   └── use-mobile.ts              # Mobile detection hook
├── lib/
│   ├── frappe-client.ts      # Typed Frappe REST API client
│   ├── ury-store.ts          # Zustand store (centralized state)
│   ├── ury-types.ts          # TypeScript type definitions
│   ├── mock-data.ts          # Restaurant mock data (Spice Garden)
│   ├── use-ury-socket.ts     # Socket.io real-time hook
│   ├── db.ts                 # Prisma database client
│   └── utils.ts              # Utility functions
mini-services/
└── ury-realtime/
    ├── index.ts              # Socket.io simulation server
    └── package.json
```

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests with Playwright
npx playwright test

# Run E2E tests with UI
npx playwright test --ui
```

### E2E Test Coverage

Playwright E2E tests cover all major tabs and features:

- Navigation between tabs
- Overview KPIs and charts
- Tables grid interaction
- Kitchen KOT workflow
- P&L charts and breakdown
- Shift management
- Menu management CRUD
- Report generator
- API explorer
- Architecture diagram
- Dark mode and color palette
- Notifications and command palette
- Settings and features

## Deployment

### Docker

```bash
# Build and run with Docker Compose
docker compose up -d

# Production deployment
docker compose -f docker-compose.prod.yml up -d
```

### Manual

```bash
npm run build
npm start
```

The app runs on port 3000 by default. Configure via `NEXTAUTH_URL` environment variable.

## About URY

[URY](https://github.com/ury-erp/ury) is an open-source ERP for restaurant management built on [ERPNext](https://github.com/frappe/erpnext)/[Frappe](https://github.com/frappe/frappe). It includes:

- POS (dine-in, takeaway, delivery, offline mode)
- Kitchen Display System (KDS/KOT)
- Daily P&L and analytics
- Multi-branch support
- QZ Tray thermal printing
- Aggregator integration (Zomato, Swiggy)

## License

MIT
