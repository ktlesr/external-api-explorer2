# Use the official Node.js 18.18.0 image as a base
FROM node:18.18.0-slim

# Set working directory
WORKDIR /app

# Display Node.js and npm versions to verify before starting
RUN node -v && npm -v

# Copy package files first for better layer caching
COPY package*.json ./
# Install ALL dependencies needed for build (consider `npm ci` if you have package-lock.json)
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application (creates the ./dist folder)
RUN npm run build # This runs `vite build`

# Expose port 3000 (We will tell `serve` to use this port)
EXPOSE 3000

# Start serving the static files from the 'dist' directory on port 3000
# -s indicates single-page app mode (routes requests to index.html)
# -l 3000 listens on port 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
