# Create final image
FROM node:22-alpine AS builder
WORKDIR /app

# Copy built backend
COPY backend .
RUN npm install && npm run build


FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package* ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "dist/main.js"]
