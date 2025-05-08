# Use Debian-based Node.js for better native module support
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install build tools and dependencies
RUN apk add --no-cache python3 make g++
RUN yarn install

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "src/index.js"]
