FROM node:22 AS builder

# Set working directory
WORKDIR /app

# Copy and build Angular frontend
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build


# Create final image
FROM node:22-alpine
WORKDIR /app

# Copy built backend
COPY --from=builder /app/frontend/dist/frontend/browser ./client
COPY backend .
RUN npm install && npm run build
# Expose port and run application
EXPOSE 3000
CMD ["node", "dist/main.js"]
