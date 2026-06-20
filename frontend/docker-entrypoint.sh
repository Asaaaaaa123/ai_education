#!/bin/sh
set -e

export PORT="${PORT:-80}"

# Defaults for Coolify deploy — override via container env if needed.
export REACT_APP_CLERK_PUBLISHABLE_KEY="${REACT_APP_CLERK_PUBLISHABLE_KEY:-pk_test_aGVscGVkLWRvbmtleS0xMC5jbGVyay5hY2NvdW50cy5kZXYk}"
export REACT_APP_API_URL="${REACT_APP_API_URL:-http://ut1emwku5ay9u42fqmtob001.46.62.247.146.sslip.io}"

envsubst '${REACT_APP_CLERK_PUBLISHABLE_KEY} ${REACT_APP_API_URL}' \
  < /etc/nginx/config.js.template > /usr/share/nginx/html/config.js

if [ -n "${BACKEND_UPSTREAM}" ]; then
    envsubst '${BACKEND_UPSTREAM} ${PORT}' < /etc/nginx/nginx.proxy.conf.template > /etc/nginx/nginx.conf
else
    envsubst '${PORT}' < /etc/nginx/nginx.static.conf.template > /etc/nginx/nginx.conf
fi

exec nginx -g 'daemon off;'
