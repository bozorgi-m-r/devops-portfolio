# Production-grade Dockerfile
# Combines multi-stage build, a non-root user, and a healthcheck.

# ---- Stage 1: build dependencies ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install --production

# ---- Stage 2: final runtime image ----
FROM node:20-alpine
WORKDIR /app

# Create a dedicated, unprivileged user instead of running as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Only bring over what's needed to run the app - not the build tools
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
COPY index.js .

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "index.js"]
