# Production frontend — build React app, serve with nginx (proxies /api to backend)
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Empty REACT_APP_API_URL = same-origin requests via nginx proxy
ARG REACT_APP_API_URL=http://ut1emwku5ay9u42fqmtob001.46.62.247.146.sslip.io
ARG REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_aGVscGVkLWRvbmtleS0xMC5jbGVyay5hY2NvdW50cy5kZXYk
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_CLERK_PUBLISHABLE_KEY=$REACT_APP_CLERK_PUBLISHABLE_KEY

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.static.conf.template /etc/nginx/nginx.static.conf.template
COPY nginx.proxy.conf.template /etc/nginx/nginx.proxy.conf.template
COPY config.js.template /etc/nginx/config.js.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

# Coolify sets PORT from "Ports Exposes" (often 3000). Default 80 for docker-compose.
ENV PORT=80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD sh -c 'wget -q -O /dev/null http://127.0.0.1:${PORT:-80}/ || exit 1'

# BACKEND_UPSTREAM=backend:8080 enables /api proxy (docker-compose). Leave unset for Coolify standalone.
ENV BACKEND_UPSTREAM=

ENTRYPOINT ["/docker-entrypoint.sh"]
