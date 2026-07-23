# Multi-stage Dockerfile for Homelab IPAM & Entity Manager (SvelteKit + Node Adapter)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project source files
COPY . .

# Build SvelteKit production bundle
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node modules and built application
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Start production server
CMD ["node", "build"]
