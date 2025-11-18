# SpecialCare Connect - Comprehensive Support for Special Children & Families

## Project Overview

SpecialCare Connect is a compassionate and comprehensive support platform designed specifically for special children and their families. We bring together qualified teachers, therapists, psychologists, and family support specialists to provide personalized care, education, and emotional support for children with diverse needs and their families.

## 🏗️ Architecture

This project is built with a modern, scalable architecture:

### Frontend (React)
- **Technology**: React 18 with React Router
- **Styling**: CSS3 with custom pink theme
- **Deployment**: Nginx container
- **Port**: 3000

### Backend (FastAPI)
- **Technology**: Python FastAPI
- **Database**: PostgreSQL
- **Caching**: Redis
- **Port**: 8000

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Caching**: Redis 7
- **Network**: Custom Docker network

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed
- At least 4GB of available RAM

### Installation & Startup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai_eduaction
   ```

2. **Start all services**
   ```bash
   # Make the start script executable
   chmod +x start.sh
   
   # Run the start script
   ./start.sh
   ```

   Or manually:
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Access specific service
docker-compose exec frontend sh
docker-compose exec backend sh
docker-compose exec db psql -U postgres -d specialcare
```

## 📁 Project Structure

```
ai_eduaction/
├── docker-compose.yml          # Main Docker Compose configuration
├── start.sh                    # Startup script
├── README.md                   # Project documentation
├── frontend/                   # React frontend application
│   ├── Dockerfile             # Frontend container configuration
│   ├── nginx.conf             # Nginx configuration
│   ├── package.json           # Node.js dependencies
│   ├── public/                # Static assets
│   └── src/                   # React source code
│       ├── components/        # React components
│       ├── App.js            # Main App component
│       ├── App.css           # App styles
│       └── index.js          # React entry point
├── backend/                    # FastAPI backend application
│   ├── Dockerfile             # Backend container configuration
│   ├── requirements.txt       # Python dependencies
│   └── main.py               # FastAPI application
└── .gitignore                 # Git ignore file
```

## 🎨 Design System

### Color Palette
- **Primary Pink**: #e53e3e
- **Primary Pink Dark**: #c53030
- **Primary Pink Light**: #fed7d7
- **Primary Pink Lighter**: #feb2b2
- **Text Dark**: #2d3748
- **Text Medium**: #4a5568
- **Text Light**: #718096

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

## 🔧 API Endpoints

### Assessment Endpoints
- `POST /api/assessment` - Create new assessment
- `GET /api/assessment/{id}` - Get specific assessment
- `GET /api/assessments` - List all assessments

### Health Check
- `GET /health` - Service health status
- `GET /` - API root information

## 🧪 Testing

### Frontend Testing
```bash
# Run frontend tests
docker-compose exec frontend npm test
```

### Backend Testing
```bash
# Run backend tests
docker-compose exec backend pytest
```

## 📊 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### Health Checks
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/health
- Database: `docker-compose exec db pg_isready -U postgres`

## 🔒 Security

### Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/specialcare
POSTGRES_PASSWORD=your-secure-password

# Backend
SECRET_KEY=your-secret-key-here
DEBUG=False

# Redis
REDIS_URL=redis://redis:6379
```

### Security Headers
- CORS configured for frontend domain
- Security headers in Nginx configuration
- Input validation with Pydantic models

## 🚀 Deployment

### Production Deployment
1. Update environment variables
2. Set `DEBUG=False` in backend
3. Configure production database
4. Set up SSL certificates
5. Configure domain names

### Environment-Specific Configurations
- **Development**: Hot reload enabled, debug mode
- **Staging**: Production-like environment
- **Production**: Optimized for performance and security

## 🛠️ Development

### Adding New Features

#### Frontend
1. Create new component in `frontend/src/components/`
2. Add routing in `App.js`
3. Update styles in component CSS file
4. Test with `npm test`

#### Backend
1. Add new endpoint in `backend/main.py`
2. Create Pydantic models for data validation
3. Add tests in `backend/tests/`
4. Update API documentation

### Database Migrations
```bash
# Create migration
docker-compose exec backend alembic revision --autogenerate -m "Description"

# Apply migration
docker-compose exec backend alembic upgrade head
```

## 📈 Performance

### Optimization Features
- **Frontend**: Code splitting, lazy loading
- **Backend**: Async operations, connection pooling
- **Database**: Indexed queries, optimized schemas
- **Caching**: Redis for session and data caching

### Monitoring
- Application performance metrics
- Database query optimization
- Frontend bundle analysis
- API response time monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- **Frontend**: ESLint, Prettier
- **Backend**: Black, Flake8
- **Git**: Conventional commits

## 📞 Support

### Emergency Support
- **24/7 Crisis Line**: +1 (555) 123-4567
- **Emergency Response**: Immediate support for urgent situations
- **Crisis Chat**: Online support available 24/7

### Technical Support
- **Email**: support@specialcare-connect.com
- **Documentation**: http://localhost:8000/docs
- **Issues**: GitHub Issues

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Emergency Resources

If you or someone you know is in crisis, please contact:

- **National Crisis Hotline**: 988 (US)
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911 (US)

*Remember: You are not alone, and help is always available.*

---

**SpecialCare Connect** - Every child deserves special care and support 💙

*Providing comprehensive support for special children and their families through qualified professionals, compassionate care, and coordinated services.* 