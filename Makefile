# URY Dashboard — Makefile
# Convenience commands for development and production

.PHONY: help dev build test test-unit test-e2e docker-build docker-up docker-down docker-logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Development ──────────────────────────────────────────
dev: ## Start development server
	npm run dev

build: ## Build Next.js for production
	npm run build

# ── Testing ──────────────────────────────────────────────
test: test-unit test-e2e ## Run all tests

test-unit: ## Run Vitest unit tests
	npm test

test-watch: ## Run Vitest in watch mode
	npm run test:watch

test-e2e: ## Run Playwright E2E tests
	npm run test:e2e

test-e2e-ui: ## Run Playwright E2E tests with UI
	npm run test:e2e:ui

# ── Docker ───────────────────────────────────────────────
docker-build: ## Build Docker image
	docker build -t ury-dashboard:latest .

docker-up: ## Start production stack (Caddy + Dashboard)
	docker compose -f docker-compose.prod.yml up -d

docker-down: ## Stop production stack
	docker compose -f docker-compose.prod.yml down

docker-logs: ## Follow dashboard logs
	docker compose -f docker-compose.prod.yml logs -f dashboard

docker-restart: ## Restart production stack
	docker compose -f docker-compose.prod.yml restart

docker-ps: ## Show running containers
	docker compose -f docker-compose.prod.yml ps

# ── Setup ────────────────────────────────────────────────
setup: ## First-time setup (install deps + build)
	npm ci
	npm run build
	@echo "✓ Setup complete. Run 'make dev' to start."

lint: ## Run ESLint
	npm run lint
