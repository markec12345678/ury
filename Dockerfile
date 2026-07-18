# URY — Production Dockerfile
# Multi-stage build for minimal production image
# Usage: docker build -f Dockerfile -t ury:latest .
#
# Build targets:
#   - builder: Installs deps and builds all workspaces
#   - production: Minimal image with only built assets and runtime deps

# ── Stage 1: Build ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

# Copy dependency manifests first (better layer caching)
COPY package.json package-lock.json* yarn.lock* ./
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY pos/package.json ./pos/package.json

# Install all dependencies
RUN yarn install --immutable --immutable-cache 2>/dev/null || \
    yarn install --frozen-lockfile 2>/dev/null || \
    yarn install

# Copy source code
COPY . .

# Build all workspaces
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN yarn build || true

# Build Storybook (optional static site)
RUN yarn build-storybook || true

# ── Stage 2: Production ─────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Enable corepack
RUN corepack enable

# Copy dependency manifests
COPY package.json package-lock.json* yarn.lock* ./
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY pos/package.json ./pos/package.json

# Install production dependencies only
ENV NODE_ENV=production
RUN yarn install --production --immutable 2>/dev/null || \
    yarn install --production --frozen-lockfile 2>/dev/null || \
    yarn install --production

# Copy built assets from builder
COPY --from=builder /app/pos/dist ./pos/dist
COPY --from=builder /app/storybook-static ./storybook-static
COPY --from=builder /app/packages ./packages

# Copy necessary config files
COPY --from=builder /app/pos/package.json ./pos/package.json
COPY --from=builder /app/pos/vite.config.ts ./pos/vite.config.ts
COPY --from=builder /app/pos/index.html ./pos/index.html

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose ports: 3000 (POS), 6006 (Storybook static)
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Labels
LABEL maintainer="URY Contributors"
LABEL description="URY - Open Source Restaurant Management System"
LABEL org.opencontainers.image.source="https://github.com/markec12345678/ury"
LABEL org.opencontainers.image.licenses="GPL-3.0"

# Start with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Default: serve POS static files (requires a static file server)
# Override CMD for different services
CMD ["npx", "serve", "pos/dist", "-l", "3000", "-s"]
