# Docker deployment

Run the **frontend** (nginx + React) and **backend** (FastAPI) together for production or local development.

## Quick start (production)

```bash
# 1. Configure environment
cp .env.docker.example .env
# Edit .env — set CLERK_SECRET_KEY, REACT_APP_CLERK_PUBLISHABLE_KEY,
# and replace YOUR_SERVER_IP with your public IP or domain in ALLOWED_ORIGINS / CLERK_AUTHORIZED_PARTIES

# 2. Build and start
docker compose up -d --build

# 3. Open the app
# Frontend: http://localhost  (port 80)
# Backend:  http://localhost:8080/health
# API docs: http://localhost:8080/docs
```

## Services

| Service  | Image build        | Port (default) | Description                          |
|----------|--------------------|----------------|--------------------------------------|
| frontend | `frontend/Dockerfile` | 80          | nginx serves React; proxies `/api/*` to backend |
| backend  | `backend/Dockerfile`  | 8080        | FastAPI API; data in Docker volume   |

## Compose files

| File                    | Use case                                      |
|-------------------------|-----------------------------------------------|
| `docker-compose.yml`    | **Production deploy** (recommended)           |
| `docker-compose.prod.yml` | Same as above (explicit prod alias)         |
| `docker-compose.dev.yml`  | Dev with hot reload (frontend :3333, backend :8080) |

### Development

```bash
cp .env.docker.example .env
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:3333  
- Backend: http://localhost:8080  

## Environment variables

Set these in root `.env` (see `.env.docker.example`):

| Variable | Where used | Notes |
|----------|------------|-------|
| `CLERK_SECRET_KEY` | backend | JWT verification |
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | frontend build | Baked into React bundle at build time |
| `ALLOWED_ORIGINS` | backend CORS | Browser origins allowed to call API |
| `CLERK_AUTHORIZED_PARTIES` | backend Clerk | Must include your public app URL |
| `FRONTEND_PORT` | compose | Host port for nginx (default 80) |
| `BACKEND_PORT` | compose | Host port for API (default 8080) |

**Important:** After changing `REACT_APP_CLERK_PUBLISHABLE_KEY`, rebuild the frontend:

```bash
docker compose up -d --build frontend
```

## Data persistence

Backend JSON data (users, children, plans) is stored in the Docker volume `backend_data` at `/app/data` inside the container.

```bash
# Backup volume
docker run --rm -v ai_education-main_backend_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/backend-data-backup.tar.gz -C /data .

# List volumes
docker volume ls
```

## Common commands

```bash
docker compose logs -f
docker compose logs -f backend
docker compose restart backend
docker compose down
docker compose down -v   # ⚠️ deletes persisted backend data
```

## Deploy on a VPS

1. Clone the repo on the server.
2. Copy `.env.docker.example` → `.env` and set:
   - `ALLOWED_ORIGINS=http://YOUR_IP` or `https://your.domain`
   - `CLERK_AUTHORIZED_PARTIES` to the same URL(s)
   - Clerk keys from [dashboard.clerk.com](https://dashboard.clerk.com)
3. Open firewall ports **80** (and **8080** if you need direct API access).
4. Run `docker compose up -d --build`.

Users should open the app via the **frontend URL** (port 80). The nginx container proxies API calls so the browser does not need port 8080.

## Troubleshooting

**Frontend shows Clerk error** — Rebuild after setting `REACT_APP_CLERK_PUBLISHABLE_KEY` in `.env`.

**401 on API calls** — `CLERK_AUTHORIZED_PARTIES` must match the exact URL in the browser (including port).

**Backend unhealthy** — Check logs: `docker compose logs backend`. First start may take ~45s while dependencies load.

**Port in use** — Change in `.env`: `FRONTEND_PORT=8081` or `BACKEND_PORT=8082`.
