FROM python:3.11-slim

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    BACKEND_DATA_DIR=/app/data \
    DISABLE_TORCH=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt

COPY . .

RUN mkdir -p /app/data /app/models

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["python3", "start.py"]
