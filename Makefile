# URY Dashboard — Development Makefile
# Convenience targets for common development tasks

.PHONY: help dev-up dev-down dev-logs dev-ps dev-restart dev-setup storybook protect fork-pr lint test build install

# ── Default ────────────────────────────────────────────────
help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Docker Development ────────────────────────────────────
dev-up: ## Start full dev stack (Dashboard + PostgreSQL + Redis)
	docker compose -f docker-compose.dev.yml up -d

dev-down: ## Stop all dev containers
	docker compose -f docker-compose.dev.yml down

dev-logs: ## Tail logs from all dev containers
	docker compose -f docker-compose.dev.yml logs -f

dev-ps: ## List running dev containers
	docker compose -f docker-compose.dev.yml ps

dev-restart: ## Restart all dev containers
	docker compose -f docker-compose.dev.yml restart

dev-setup: ## First-time setup: build images and start stack
	docker compose -f docker-compose.dev.yml up -d --build

# ── Yarn Workspaces ───────────────────────────────────────
install: ## Install all workspace dependencies
	yarn install

dev: ## Start POS dev server locally (no Docker)
	yarn --cwd pos dev

# ── Storybook ─────────────────────────────────────────────
storybook: ## Start Storybook dev server on port 6006
	yarn storybook

build-storybook: ## Build static Storybook site
	yarn build-storybook

# ── Branch Protection ─────────────────────────────────────
protect: ## Apply branch protection rules (requires GITHUB_TOKEN and REPO)
	GITHUB_TOKEN=$(GITHUB_TOKEN) REPO=$(REPO) node scripts/apply-branch-protection.mjs

# ── Fork PR ───────────────────────────────────────────────
fork-pr: ## Create PR from fork to upstream (requires gh CLI)
	bash scripts/create-upstream-pr.sh

# ── Quality ───────────────────────────────────────────────
lint: ## Run ESLint
	yarn lint

test: ## Run unit tests
	yarn test

build: ## Build for production
	yarn build

typecheck: ## TypeScript type check (UI package)
	yarn --cwd packages/ui typecheck
