# Create final image
FROM node:22-alpine
WORKDIR /app

# Copy built backend
COPY backend .
RUN npm install && npm run build
# Expose port and run application
EXPOSE 3000
CMD ["node", "dist/main.js"]
