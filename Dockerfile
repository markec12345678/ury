# URY Dashboard — Production Dockerfile
# Multi-stage build for minimal image size and security
# Supports: docker build -t ury-dashboard .

# ── Stage 1: Dependencies ────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* bun.lockb* ./

# Install production + dev dependencies (needed for build)
RUN npm ci --ignore-scripts

# ── Stage 2: Build ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# ── Stage 3: Production ─────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Labels for image metadata
LABEL maintainer="URY Team"
LABEL description="URY Restaurant Management Dashboard"
LABEL version="2.0"
LABEL org.opencontainers.image.source="https://github.com/ury-erp/ury"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only production-ready files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set correct ownership
USER nextjs

# Expose port
EXPOSE 3000

# Runtime environment variables (override with docker-compose/env)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Start the standalone Next.js server
CMD ["node", "server.js"]
