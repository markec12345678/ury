# 🍽️ URY Dashboard — Restaurant Management

Interactive dashboard for the [URY](https://github.com/ury-erp/ury) open-source restaurant management system, built on ERPNext/Frappe.

![URY Dashboard](download/ury-dashboard-overview.png)

## ✨ Features

### 📊 7 Interactive Tabs

| Tab | Description |
|---|---|
| **Pregled** | Daily KPI cards, hourly sales chart (dine-in vs takeaway), recent orders table |
| **Mize** | Visual grid of 32 tables across 4 rooms with real-time status updates |
| **Kuhinja** | Live KOT (Kitchen Order Ticket) display with status workflow, audio alerts |
| **P&L** | Daily Profit & Loss with 7-day charts, expense donut, line items |
| **Smena** | Shift management, cashier tracking, payment breakdown (cash/card/UPI) |
| **API Explorer** | Searchable catalog of all 36 URY REST API endpoints with parameter details |
| **Arhitektura** | Animated system architecture diagram, 35 doctypes, 7 document event hooks |

### 🔗 Frappe Backend Integration

- **Settings page** for configuring Frappe/ERPNext connection
- **Two auth modes**: Username+Password or API Token
- **Auto-fallback**: Uses mock data when no backend is connected
- **Real data refresh**: Fetches live KOT, tables, and invoices from Frappe
- **Connection status indicator** throughout the dashboard

### 📡 Real-Time Updates

- **Socket.io** integration for live kitchen and table updates
- Simulated restaurant events (new KOTs, status changes, table occupancy)
- Flash animations, audio beeps, and notification banners
- Live/Simulation status indicator

### 🎨 Design

- **Dark/Light mode** toggle
- Restaurant-themed color palette (emerald + amber)
- Responsive layout (mobile sidebar overlay, adaptive grids)
- Framer Motion tab transitions and component animations
- Built with shadcn/ui component library

## 🛠️ Tech Stack

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
| Backend | Python/Frappe/ERPNext (URY) |

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.20
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
| `NEXTAUTH_URL` | `http://localhost:3000` | Dashboard URL for NextAuth |
| `NEXTAUTH_SECRET` | — | Secret key for JWT signing (change in production!) |
| `NEXT_PUBLIC_SOCKET_PORT` | `3003` | Socket.io simulation port |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard (single-page app)
│   ├── settings/page.tsx     # Frappe connection & auth settings
│   ├── api/auth/             # NextAuth API route
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── dashboard/
│   │   ├── overview-tab.tsx  # KPI cards + sales chart
│   │   ├── tables-tab.tsx    # Table grid with real-time updates
│   │   ├── kitchen-tab.tsx   # KOT cards with live status
│   │   ├── pl-tab.tsx        # P&L charts and breakdown
│   │   ├── shift-tab.tsx     # Shift management & cashier tracking
│   │   ├── api-explorer-tab.tsx  # 36 API endpoints catalog
│   │   └── architecture-tab.tsx  # System architecture diagram
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── frappe-client.ts      # Typed Frappe REST API client
│   ├── ury-store.ts          # Zustand store (centralized state)
│   ├── mock-data.ts          # Restaurant mock data (Spice Garden)
│   ├── use-ury-socket.ts     # Socket.io real-time hook
│   ├── db.ts                 # Prisma database client
│   └── utils.ts              # Utility functions
mini-services/
└── ury-realtime/
    ├── index.ts              # Socket.io simulation server
    └── package.json
```

## 🔗 About URY

[URY](https://github.com/ury-erp/ury) is an open-source ERP for restaurant management built on [ERPNext](https://github.com/frappe/erpnext)/[Frappe](https://github.com/frappe/frappe). It includes:

- POS (dine-in, takeaway, delivery, offline mode)
- Kitchen Display System (KDS/KOT)
- Daily P&L and analytics
- Multi-branch support
- QZ Tray thermal printing
- Aggregator integration (Zomato, Swiggy)

## 📄 License

MIT
