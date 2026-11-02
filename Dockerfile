# ==============================================================================
# Dockerfile (Repository Root): Render Container Deployment
# Three-Tier Architecture - Application Tier (Express.js REST API)
# ==============================================================================

FROM node:18-alpine

WORKDIR /app

# Copy dependency manifests from backend directory
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY backend/ .

# Expose port 5000
EXPOSE 5000

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start Express server
CMD ["node", "server.js"]
