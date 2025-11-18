# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using npm install instead of npm ci to handle lock file sync issues
# This will automatically resolve version conflicts and update the lock file
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the app
# Frontend calls backend via host port forwarding (localhost:8001)
ARG REACT_APP_API_URL=http://localhost:8001
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Production stage - use serve instead of nginx
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built app from build stage
COPY --from=build /app/build ./build

# Expose port 3000
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "build", "-l", "3000"] 