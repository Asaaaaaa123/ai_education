# Deprecated backend entrypoints

Older experimental FastAPI apps (`main.py`, `api.py`) lived next to the `api/` **package** (routers) and caused confusion.

**The only supported application entrypoint is `app.py`**, launched via:

```bash
cd backend
python start.py
# or: python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

Historical copies were removed in the MVP cleanup. If you need legacy behavior, retrieve it from version control history.
