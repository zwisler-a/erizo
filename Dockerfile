FROM node:22-alpine
WORKDIR /app

# Copy built backend
COPY ./migration-client ./client
COPY backend .
RUN npm install && npm run build
# Expose port and run application
EXPOSE 3000
CMD ["node", "dist/main.js"]

