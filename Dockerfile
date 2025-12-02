# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies (prefer pnpm if lock file exists)
RUN npm install -g pnpm || true
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copy source files
COPY . .

# Build the Vite app (outputs to /app/dist)
RUN if [ -f pnpm-lock.yaml ]; then pnpm run build; else npm run build; fi

# Stage 2: Production server
FROM nginx:alpine AS runner

# Copy built static files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /assets { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
