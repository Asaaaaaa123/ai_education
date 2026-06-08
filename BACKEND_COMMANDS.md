# Backend Build and Start Commands

Quick reference for building and starting the backend.

## Using npm scripts (Recommended)

### Install Backend Dependencies
```bash
npm run install:backend
```

### Start Backend (Python - Recommended)
```bash
npm run start:backend
```
This uses the `start.py` script which handles dependency checking and setup automatically.

### Start Backend (Direct uvicorn)
```bash
npm run start:backend:direct
```
Directly starts with uvicorn (faster, but doesn't check dependencies).

## Docker Commands

### Build Docker Image
```bash
npm run build:docker:backend:image
```
Or manually:
```bash
docker build -t ai-education-backend -f backend/Dockerfile backend/
```

### Start Backend in Docker (Foreground)
```bash
npm run start:backend:docker
```

### Start Backend in Docker (Background/Detached)
```bash
npm run start:backend:docker:detached
```

### Build and Start in One Command
```bash
npm run build:docker:backend:image && npm run start:backend:docker:detached
```

## Manual Commands

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Start with Python Script
```bash
cd backend
python start.py
```

### Start with uvicorn directly
```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

### Start with Windows Batch File
```bash
cd backend
start.bat
```

## Docker Manual Commands

### Build Image
```bash
docker build -t ai-education-backend -f backend/Dockerfile backend/
```

### Run Container (Foreground)
```bash
docker run -p 8001:8000 --name ai-education-backend ai-education-backend
```

### Run Container (Background)
```bash
docker run -d -p 8001:8000 --name ai-education-backend ai-education-backend
```

### Stop Container
```bash
docker stop ai-education-backend
```

### Remove Container
```bash
docker rm ai-education-backend
```

### View Logs
```bash
docker logs ai-education-backend
```

### Follow Logs
```bash
docker logs -f ai-education-backend
```

## Access Points

Once started, the backend will be available at:
- **API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## Notes

- The backend runs on port **8001** when started with Python
- The Docker container exposes port **8000** internally, mapped to **8001** on the host
- Use `--reload` flag for development (auto-reload on code changes)
- The `start.py` script automatically checks and installs missing dependencies


