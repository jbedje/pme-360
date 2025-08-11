# PME 360 Backend - Production Dockerfile
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="PME 360 Team <tech@pme360.com>"
LABEL description="PME 360 Backend API - Production Container"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    ca-certificates

# Create non-root user
RUN addgroup -g 1001 -S pme360 && \
    adduser -S pme360 -u 1001 -G pme360

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=pme360:pme360 /app/dist ./dist
COPY --from=builder --chown=pme360:pme360 /app/node_modules ./node_modules
COPY --from=builder --chown=pme360:pme360 /app/prisma ./prisma

# Copy environment file template
COPY --chown=pme360:pme360 .env.example .env.example

# Create necessary directories
RUN mkdir -p logs uploads temp && \
    chown -R pme360:pme360 logs uploads temp

# Switch to non-root user
USER pme360

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start command
CMD ["node", "dist/index.js"]