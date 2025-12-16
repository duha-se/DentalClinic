# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm install --production

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Copy only the node_modules from the deps stage and application code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose the backend port
EXPOSE 5001

# Start the backend server
CMD ["node", "src/server.js"]