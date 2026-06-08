# Docker Compose Setup

This project includes Docker Compose configurations for both development and production environments.

## Files

- `docker-compose.yml` - Main production-ready compose file (uses bind mount for data)
- `docker-compose.dev.yml` - Development environment with hot reload
- `docker-compose.prod.yml` - Production environment with Docker volumes

## Persistent Data Volumes

All configurations use persistent volumes for backend data files:
- **docker-compose.yml**: Binds to `./backend/data` directory (data accessible on host)
- **docker-compose.dev.yml**: Binds to `./backend/data` directory (data accessible on host)
- **docker-compose.prod.yml**: Uses Docker named volume (data managed by Docker)

## Quick Start

### Production Build
```bash
docker-compose up -d --build
```

### Development Build (with hot reload)
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## Services

### Backend
- **Port**: 8001
- **Health Check**: http://localhost:8001/health
- **API Docs**: http://localhost:8001/docs
- **Data Persistence**: `./backend/data` directory (mounted as volume)

### Frontend
- **Port**: 3000 (dev) or 80 (prod)
- **URL**: http://localhost:3000 (dev) or http://localhost (prod)
- **API URL**: Configured via `REACT_APP_API_URL` environment variable

## Persistent Volumes

The backend data files are stored in `./backend/data` directory and are mounted as a persistent volume. This ensures:
- User data persists across container restarts
- Data files are accessible on the host machine
- Easy backup and restore of data

### Data Files
- `users.json` - User accounts
- `sessions.json` - Active sessions
- `user_children.json` - Children data
- `user_plans.json` - Training plans
- `user_test_results.json` - Test results

## Environment Variables

### Backend
- `PYTHONUNBUFFERED=1` - Ensures Python output is not buffered
- `DEBUG=False` - Set to `True` for development

### Frontend
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8001)

## Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild services
```bash
docker-compose up -d --build
```

### Remove volumes (⚠️ deletes data)
```bash
docker-compose down -v
```

## Development

For development with hot reload:
```bash
docker-compose -f docker-compose.dev.yml up
```

This will:
- Mount source code for live updates
- Enable hot reload for both frontend and backend
- Use development-friendly settings

## Production

For production deployment:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

This will:
- Build optimized production images
- Use nginx for frontend serving
- Configure proper health checks
- Enable automatic restarts

## Troubleshooting

### Port already in use
If ports 8001 or 3000 are already in use, modify the port mappings in docker-compose.yml:
```yaml
ports:
  - "8002:8001"  # Change host port
```

### Data not persisting
Ensure the `./backend/data` directory exists and has proper permissions:
```bash
mkdir -p backend/data
chmod 755 backend/data
```

### Frontend can't connect to backend
Check that:
1. Both services are on the same network (`specialcare-network`)
2. Frontend uses `http://backend:8001` for internal communication
3. Environment variable `REACT_APP_API_URL` is set correctly

