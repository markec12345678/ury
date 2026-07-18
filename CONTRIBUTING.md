# Contributing to URY

Thank you for your interest in contributing to URY! This guide covers everything you need to get started.

## Quick Start

### Prerequisites

- **Node.js** 22+ (LTS recommended)
- **npm** or **Yarn** 1.22+
- **Docker** & Docker Compose (optional, for containerized dev)
- **Python** 3.10+ (for Frappe backend)

### Setup with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/markec12345678/ury.git
cd ury

# Start the full dev stack
make dev-setup

# View logs
make dev-logs
```

This starts:
- **URY POS** on http://localhost:3000
- **Storybook** on http://localhost:6006
- **PostgreSQL 16** on localhost:5432
- **Redis 7** on localhost:6379
- **Adminer** (DB GUI) on http://localhost:8080

### Setup without Docker

```bash
# Install dependencies
npm install

# Build all workspaces
npm run build

# Start POS development server
make dev
```

### Production Docker Build

```bash
# Build production image
docker build -t ury:latest .

# Run production container
docker run -p 3000:3000 ury:latest
```

## Repository Structure

```
ury/
├── packages/ui/          # @ury/ui — Shared React component library
│   └── src/
│       ├── components/    # 16 components: Button, Card, Badge, Input, Textarea, Loader,
│       │                  # Spinner, Dialog, Select, Toast, Tooltip, Switch, Checkbox,
│       │                  # Tabs, Separator, Avatar
│       ├── __stories__/   # Storybook stories (16 components, 75 stories)
│       ├── styles/        # Theme CSS, Tailwind preset
│       └── lib/           # Utilities (cn, etc.)
├── packages/core/         # @ury/core — Frappe SDK, storage, formatting, validators, constants
├── pos/                   # POS v2 (Vite + React + Zustand)
├── ury/                   # Frappe backend app (Python)
├── urypos/                # Legacy POS (Frappe)
├── URYMosaic/             # Kitchen Display System (Vue)
├── .github/               # CI/CD, branch protection, CODEOWNERS
├── .storybook/            # Storybook 10 configuration
├── scripts/               # Admin setup, branch protection, upstream PR
├── docker-compose.dev.yml # Docker dev stack
├── Dockerfile.dev         # Node 22 Alpine dev image
└── Makefile               # Convenience commands
```

## Development Workflow

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feat/<description>` | `feat/kitchen-display` |
| Bug fix | `fix/<description>` | `fix/order-total-calc` |
| Infrastructure | `infra/<description>` | `infra/ci-pipeline` |
| POS | `pos/<description>` | `pos/thermal-printing` |

### Creating a Pull Request

1. Create a feature branch from `develop`
2. Make your changes with clear, descriptive commits
3. Push and create a PR to `develop`
4. Ensure CI checks pass (Lint, Storybook, Build)
5. Get the required approval (1 for develop, 2 for main)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(pos): add thermal printer support
fix(dashboard): resolve order total rounding error
docs: update CONTRIBUTING.md
chore(deps): bump react to 19.1
```

## Code Quality

### Linting

```bash
make lint
```

### Formatting

```bash
# Format code with Prettier
make format

# Check formatting without writing
make format-check
```

### Type Checking

```bash
make typecheck
```

### Testing

```bash
make test
```

### Run All Checks

```bash
# Lint + type-check + format-check + test in one command
make check-all
```

### Storybook

```bash
# Start Storybook dev server
make storybook

# Build static Storybook
make build-storybook
```

Storybook runs on http://localhost:6006 with all `@ury/ui` component stories.

## Component Development

When adding new components to `@ury/ui`:

1. Create the component in `packages/ui/src/components/`
2. Add a corresponding `.stories.tsx` file in `packages/ui/src/components/__stories__/`
3. Use CVA (class-variance-authority) for variant management
4. Follow existing patterns (see Button, Card, Badge for reference)
5. Export from `packages/ui/src/index.ts`

### Story Example

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyComponent } from "../my-component";

const meta: Meta<typeof MyComponent> = {
  title: "UI/MyComponent",
  component: MyComponent,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: { children: "Hello" },
};
```

## Branch Protection

| Branch | Approvals | Code Owners | Linear History | Enforce Admins |
|--------|-----------|-------------|----------------|----------------|
| `main` | 2 | Required | Yes | Yes |
| `develop` | 1 | Required | No | No |

## CI/CD Workflows

| Workflow | Trigger | Jobs |
|----------|---------|------|
| **Fork CI** | Push/PR to develop | Lint, Storybook Build, Build Verification |
| **CI** | Push/PR to develop/main | Lint, Unit Tests, Build, E2E |
| **Release** | Tag push (v*) | Docker build + push to GHCR |
| **Chromatic** | Push to develop | Visual regression testing |
| **Labeler** | PR opened | Auto-label by path |
| **Stale** | Daily | Close inactive issues/PRs (60d/30d) |
| **Fork Sync** | Manual | Create PR from fork to upstream |

## Need Help?

- Open a [GitHub Issue](https://github.com/markec12345678/ury/issues)
- Check existing [Pull Requests](https://github.com/markec12345678/ury/pulls)
- Refer to `FEATURES.md` for project context
