# Multi-stage build for production
FROM node:18-alpine AS builder

# Build stage
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy built application
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

# Create database directory
RUN mkdir -p server/database

# Expose port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start application
CMD ["node", "server/index.js"]

