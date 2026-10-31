# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Stage 2: Production Minimal Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for health check
RUN apk add --no-cache curl

# Copy runtime files from builder
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/src ./src

# Create storage directories and set permissions
RUN mkdir -p /app/uploads/excels /app/uploads/cv && chown -R node:node /app/uploads /app/public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

CMD ["node", "src/server.js"]

