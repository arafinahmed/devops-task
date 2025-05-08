# Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files for caching
COPY package*.json ./

# Install build tools and dependencies, then clean up
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && npm ci --omit=dev \
    && apt-get remove -y python3 make g++ \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy source code
COPY src ./src

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S nodejs && adduser -S -u 1001 -G nodejs appuser

# Copy only necessary files from builder
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/src ./src

# Set permissions
USER appuser

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "src/index.js"]