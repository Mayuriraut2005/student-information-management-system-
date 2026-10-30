# ==============================================================================
# Dockerfile: Node.js Express REST API Container
# Application Tier for Student Information Management System
# ==============================================================================

# 1. Base Image: Lightweight official Alpine Linux with Node.js LTS
FROM node:18-alpine

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy dependency definitions
COPY package*.json ./

# 4. Install production dependencies
RUN npm ci --only=production

# 5. Copy backend source code into container
COPY . .

# 6. Expose Express application port
EXPOSE 5000

# 7. Default container environment variables
ENV NODE_ENV=production
ENV PORT=5000

# 8. Container Healthcheck (polled by Render load balancer)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# 9. Start command
CMD ["node", "server.js"]
