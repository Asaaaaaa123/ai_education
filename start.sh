#!/bin/bash

echo "🚀 Starting SpecialCare Connect - Comprehensive Support for Special Children & Families"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "📦 Building and starting services..."
echo ""

# Build and start all services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo ""
echo "🔍 Checking service status..."

# Check frontend
if curl -s http://localhost:3333 > /dev/null; then
    echo "✅ Frontend is running at http://localhost:3333"
else
    echo "⚠️  Frontend is starting up... Please wait a moment and refresh"
fi

# Check backend
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Backend API is running at http://localhost:8080"
else
    echo "⚠️  Backend is starting up... Please wait a moment"
fi

# Check database
if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is running"
else
    echo "⚠️  Database is starting up... Please wait a moment"
fi

echo ""
echo "🎉 SpecialCare Connect is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3333"
echo "🔧 Backend API: http://localhost:8080"
echo "📊 API Documentation: http://localhost:8080/docs"
echo ""
echo "💡 To stop the services, run: docker-compose down"
echo "💡 To view logs, run: docker-compose logs -f"
echo ""
echo "🫂 Every child deserves special care and support 💙" 