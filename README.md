# 🌿 Nature Journal

A beautiful private digital nature journal for writing entries and attaching photos, with an optional community platform for sharing observations — inspired by iNaturalist and Instagram.

**Status:** Early development / major transition (2026)

> This project is currently being cleaned up and repurposed from a previous child assessment application into a nature journaling platform. Much of the old code is being removed.

## Current Stack (Subject to Change)

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + React Router + Clerk |
| Backend | FastAPI |
| Auth | Clerk |
| Data | Currently JSON files (planned: proper database) |

**Note:** We are in the middle of a major cleanup and architectural shift. The long-term stack may change (Next.js + better data layer is being considered).

## Current Status (2026)

This project is undergoing a **major cleanup and transformation**.

- Large amounts of legacy code from the previous "child developmental assessment" version have been removed.
- We are moving toward a clean, professional **private + community nature journaling** platform.
- The data layer is still file-based JSON (this will change).

## Quick Start (Temporary)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python start.py

# Frontend (in another terminal)
cd frontend
npm install
npm start

# Jupyter Notebook (for interactive Python / data exploration / AI experiments)
# From project root (after backend venv is set up via `npm run install:backend` or the manual venv steps):
npm run start:jupyter
# or for the full JupyterLab interface:
npm run start:jupyterlab
```

Make sure you have Clerk keys set in `frontend/.env` and `backend/.env`.

## Docker deployment (production)

```bash
cp .env.docker.example .env
# Edit .env with Clerk keys and your server URL
docker compose up -d --build
```

- **Frontend:** http://localhost (nginx, port 80)  
- **Backend:** http://localhost:8080  

See **[README_DOCKER.md](README_DOCKER.md)** for full deployment instructions.

## Goals for the New Version

- Beautiful writing experience for private nature journal entries
- Easy photo attachment
- Optional publishing of entries to a community feed
- Location + tagging support
- Clean, trustworthy, and delightful user experience

## Contributing / Development

This is currently an active rebuild. Many old routes and components are being removed or replaced.

See `NATURE_JOURNAL_RELEASE_CHECKLIST.md` for the current work plan.

## License / Disclaimer

This software is for personal and community nature journaling. Use responsibly, especially when sharing location data publicly.

---

**Note:** Much of the original documentation below this line is outdated and will be replaced as the new product takes shape.
