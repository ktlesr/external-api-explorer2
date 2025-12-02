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

# Build the Vite app (outputs to /app/dist) - use build:dev to skip tsc
RUN if [ -f pnpm-lock.yaml ]; then pnpm run build:dev; else npm run build:dev; fi

# Stage 2: Production server
FROM nginx:alpine AS runner

# Copy built static files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing with API proxy
RUN echo 'server { \
    listen 8080; \
    listen [::]:8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Disable access log for health checks \
    location = /health { \
        access_log off; \
        return 200 "healthy\\n"; \
        add_header Content-Type text/plain; \
    } \
    \
    # API Proxy - Forward to Supabase Edge Function \
    location /api/vertex { \
        # Handle CORS preflight \
        if ($request_method = OPTIONS) { \
            add_header Access-Control-Allow-Origin * always; \
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always; \
            add_header Access-Control-Allow-Headers "authorization, x-client-info, apikey, content-type" always; \
            add_header Access-Control-Max-Age 1728000; \
            add_header Content-Type "text/plain charset=UTF-8"; \
            add_header Content-Length 0; \
            return 204; \
        } \
        \
        # Proxy to Supabase Edge Function \
        proxy_pass https://zyxiznikuvpwmopraauj.supabase.co/functions/v1/vertex-chat; \
        proxy_http_version 1.1; \
        proxy_set_header Host zyxiznikuvpwmopraauj.supabase.co; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        \
        # Pass through headers \
        proxy_set_header Authorization $http_authorization; \
        proxy_set_header apikey $http_apikey; \
        proxy_set_header Content-Type $http_content_type; \
        \
        # Streaming support \
        proxy_buffering off; \
        proxy_cache off; \
        proxy_read_timeout 300s; \
        \
        # CORS headers for response \
        add_header Access-Control-Allow-Origin * always; \
    } \
    \
    # SPA routing - all routes go to index.html \
    location / { \
        try_files $uri $uri/ /index.html =404; \
    } \
    \
    # Cache static assets \
    location ~* ^/assets/.+\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
