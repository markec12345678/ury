# URY - Open Source Restaurant Management System

[![Fork CI](https://github.com/markec12345678/ury/actions/workflows/fork-ci.yml/badge.svg?branch=develop)](https://github.com/markec12345678/ury/actions/workflows/fork-ci.yml)
[![CI](https://github.com/markec12345678/ury/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/markec12345678/ury/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-108_stories-ff6f91?logo=storybook)](https://github.com/markec12345678/ury/tree/develop/packages/ui/src/components/__stories__)
[![Node](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

URY is an open-source ERP designed to simplify and streamline restaurant operations, built on top of [ERPNext](https://erpnext.com) — the world's best free and open-source ERP.

> **Warning:** URY is in active development. Backward compatibility is not guaranteed until a stable release.

---

## What It Includes

| Module | Description |
|--------|-------------|
| **URY POS** | Lightweight web-based POS for dine-in, takeaway, delivery, and aggregator orders |
| **URY MOSAIC** | Interactive Kitchen Display System (KDS) with KOT printing |
| **Daily P&L** | Profit & Loss dashboards, consumption reports, item trends |

## Key Features

- **POS & Billing** — Role-based access, multi-cashier, shift management, cash reconciliation
- **Menu Management** — Centralized menus with outlet-level control, BOM, combos, modifiers
- **Table Orders** — Mobile-first order taking with live kitchen sync and real-time inventory checks
- **Kitchen Display** — Multi-kitchen support, live status updates, printer routing, delay tracking
- **Alerts & Red Flags** — Delayed orders, unclosed bills, excessive cancellations, real-time alerts
- **Reports & Analytics** — Daily P&L, shortage/excess, staff performance, branch comparisons

For a full feature list, see [FEATURES.md](FEATURES.md).

---

## Getting Started

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [Frappe/ERPNext](https://frappeframework.com/docs/user/en/install) (for backend)
- Docker (optional, for dev stack)

### Installation

1. Follow the [URY Installation Guide](INSTALLATION.md)
2. Set up your restaurant with [URY Setup Instructions](SETUP.md)

### Other Versions

Use branch `v1` for URY v0.1.0 (separate POS/Mosaic/Pulse apps).

---

## Developer Guide

### Quick Start

```bash
# Clone
git clone https://github.com/markec12345678/ury.git
cd ury

# Install
npm install

# Start POS dev server (port 3000)
npm --prefix pos run dev

# Start Storybook (port 6006)
npx storybook dev -p 6006
```

### Docker Development

```bash
# Start full dev stack
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop
docker compose -f docker-compose.dev.yml down
```

| Service | Port | URL |
|---------|------|-----|
| POS Dashboard | 3000 | http://localhost:3000 |
| Storybook | 6006 | http://localhost:6006 |
| PostgreSQL 16 | 5432 | `postgresql://ury:ury_dev_2024@localhost:5432/ury_dashboard` |
| Redis 7 | 6379 | `redis://localhost:6379` |
| Adminer | 8080 | http://localhost:8080 |

### Project Structure

```
ury/
├── .github/
│   ├── workflows/          # CI/CD (Fork CI, CI, Release, Chromatic, Labeler, Stale)
│   ├── ISSUE_TEMPLATE/     # Bug reports, feature requests, questions
│   ├── CODEOWNERS          # Code review routing
│   ├── dependabot.yml      # Weekly dependency updates
│   └── labeler.yml         # Auto-label PRs by path
├── .storybook/             # Storybook 10 config
├── packages/
│   ├── ui/                 # @ury/ui — React components (26 components, 108 stories)
│   │   └── src/components/ # Button, Card, Badge, Input, Textarea, Loader, Spinner, Dialog,
│   │                       # Select, Toast, Tooltip, Switch, Checkbox, Tabs, Separator,
│   │                       # Avatar, Progress, Skeleton, Empty State, DropdownMenu,
│   │                       # Accordion, Drawer, Popover, Command, Alert, Breadcrumb
│   └── core/               # @ury/core — Frappe SDK, storage, formatting, hooks, validators
├── pos/                    # POS v2 (Vite + React + Zustand)
├── urypos/                 # POS v1 (legacy)
├── URYMosaic/              # Kitchen Display System (Vue)
├── ury/                    # Frappe/ERPNext backend (Python)
├── scripts/                # Admin setup, branch protection, upstream PR
├── docker-compose.dev.yml  # Docker dev stack
├── Dockerfile.dev          # Node 22 Alpine dev image
├── Makefile                # Convenience commands
└── .env.dev                # Development environment variables
```

### Make Commands

| Command | Description |
|---------|-------------|
| `make dev-up` | Start Docker dev stack |
| `make dev-down` | Stop Docker containers |
| `make dev-logs` | Tail container logs |
| `make dev-restart` | Restart all containers |
| `make storybook` | Start Storybook on port 6006 |
| `make build-storybook` | Build static Storybook site |
| `make lint` | Run ESLint |
| `make test` | Run unit tests |
| `make build` | Production build |
| `make typecheck` | TypeScript check (UI package) |
| `make format` | Format code with Prettier |
| `make format-check` | Check formatting without writing |
| `make check-all` | Run all checks (lint + typecheck + format + test) |
| `make clean` | Remove build artifacts and cache |
| `make install` | Install all dependencies |

### CI/CD Pipelines

| Workflow | Trigger | Description |
|----------|---------|-------------|
| **Fork CI** | Push/PR to develop | Lint, Storybook build, Build verification |
| **CI** | Push/PR to develop/main | Lint, Unit tests, Build, E2E |
| **Release** | Tag push (v*) | Validate build, changelog, GitHub release, Docker push |
| **Fork Sync** | Cron (weekly Mon 07:00) / Manual | Sync upstream changes into fork |
| **Chromatic** | Push to develop | Storybook visual regression |
| **Labeler** | PR opened | Auto-label by changed paths |
| **Stale** | Cron (daily) | Close inactive issues/PRs (60d/30d) |
| **Dependabot** | Cron (weekly) | Check for dependency updates |

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Key points:

1. Create a feature branch from `develop`
2. Make changes and add tests
3. Submit a PR — CI will run automatically
4. Get a code review before merging

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. See [CHANGELOG.md](CHANGELOG.md) for release history.

### Storybook Components

| Component | Stories | Description |
|-----------|---------|-------------|
| Button | 5 | Primary, secondary, destructive, disabled, POS actions |
| Card | 2 | Default, menu card |
| Badge | 3 | Default, all variants, order status badges |
| Input | 3 | Default, disabled, POS inputs |
| Textarea | 3 | Default, disabled, with error |
| Loader | 3 | Default, full page, custom label |
| Spinner | 2 | Default, inline usage |
| Dialog | 4 | Default, large, no close button, custom size |
| Select | 7 | Default, preselected, error, small, large, disabled, many options |
| Toast | 4 | Success, error, info, all types |
| Tooltip | 5 | Default, all sides, all variants, alignment, rich content |
| Switch | 6 | Default, checked, disabled, all sizes, controlled, form example |
| Checkbox | 7 | Default, checked, with description, disabled, all sizes, all variants, form example |
| Tabs | 7 | Default, outline, pill, all sizes, disabled tab, with icons, controlled |
| Separator | 5 | Default, all variants, labeled, vertical, in context |
| Avatar | 7 | Default, all sizes, with image, all colors, with status, shapes, avatar group |
| Progress | 6 | Default, all variants, all sizes, with label, indeterminate, kitchen queue |
| Skeleton | 7 | Default, all variants, animation variants, menu card, dashboard card, table row, chart |
| Empty State | 5 | Default, all sizes, with action, no data, search empty |
| DropdownMenu | 4 | Default, all alignments, with disabled items, controlled |
| Accordion | 5 | Default, outline, card, multiple open, controlled |
| Drawer | 5 | Default, left side, top side, bottom side, all sides |
| Popover | 4 | Default, all alignments, top position, controlled |
| Command | 5 | Default, ghost, with keywords, with disabled items, controlled |

---

## About

URY is developed by [Tridz Technologies Pvt Ltd](https://tridz.com) and supported by [Frappe](http://frappe.io).

## Terms and Conditions

By using URY, you agree to use it responsibly and in compliance with applicable laws. URY is built on open-source technology and is provided for your convenience to manage restaurant operations. While we strive to keep the app reliable, it is provided "as is" without any guarantees, and we are not responsible for any misuse or resulting issues.

[Read More](TERMS.md)
