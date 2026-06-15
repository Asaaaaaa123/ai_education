#!/bin/sh
set -e

# When BACKEND_UPSTREAM is set (e.g. backend:8080 in docker-compose), nginx proxies /api to it.
# When unset (Coolify / standalone frontend), serve static files only — set REACT_APP_API_URL at build time.
if [ -n "${BACKEND_UPSTREAM}" ]; then
    envsubst '${BACKEND_UPSTREAM}' < /etc/nginx/nginx.proxy.conf.template > /etc/nginx/nginx.conf
else
    cp /etc/nginx/nginx.static.conf /etc/nginx/nginx.conf
fi

exec nginx -g 'daemon off;'
