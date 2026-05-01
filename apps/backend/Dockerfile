# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy monorepo root config
COPY package*.json ./
COPY turbo.json ./

# Copy packages and apps
COPY packages/algorithms ./packages/algorithms
COPY apps/backend ./apps/backend

# Install dependencies
RUN npm install

# Build the algorithms package first
RUN npm run build -w packages/algorithms

# Build the backend
RUN npm run build -w apps/backend

# Production Stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/packages/algorithms/dist ./node_modules/@votexa/algorithms

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 8080

CMD ["npm", "start"]
