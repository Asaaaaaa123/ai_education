FROM python:3.11-slim

WORKDIR /app

# Set non-interactive frontend for debconf to suppress warnings
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Reset DEBIAN_FRONTEND to default for runtime
ENV DEBIAN_FRONTEND=dialog

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory if it doesn't exist
RUN mkdir -p /app/data

# Expose port
EXPOSE 8001

# Run the application
CMD ["python", "start.py"] 