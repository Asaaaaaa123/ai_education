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
    wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt

COPY . .

RUN mkdir -p /app/data /app/models

ENV PORT=8080
ENV CLERK_SECRET_KEY=sk_test_VpnWvWCD7oK4MGmIOJpUnqb8flwFLIzBX7t71dnCED
ENV ALLOWED_ORIGINS=http://mgwvmvamha6it0shfo8g0zgb.46.62.247.146.sslip.io,http://localhost:3333,http://127.0.0.1:3333
ENV CLERK_AUTHORIZED_PARTIES=http://mgwvmvamha6it0shfo8g0zgb.46.62.247.146.sslip.io,http://localhost:3333,http://127.0.0.1:3333

EXPOSE 8080

# Coolify uses wget; PORT may be overridden by the platform (e.g. 8001).
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD sh -c 'wget -q -O /dev/null http://127.0.0.1:${PORT:-8080}/health || curl -fsS http://127.0.0.1:${PORT:-8080}/health || exit 1'

CMD ["python3", "start.py"]
