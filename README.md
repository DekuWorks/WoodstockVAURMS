# Woodstock VAURMS (Utility Analytics and Rate Management System)

A comprehensive utility analytics and rate management system for municipal utilities, designed to streamline data analysis, forecasting, and rate optimization processes.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Git
- Modern web browser

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd WoodstockVAURMS
```

2. **Run the setup script:**
```bash
python setup.py
```

3. **Or manually setup:**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create uploads directory
mkdir uploads

# Run the application
python run.py
```

4. **Access the application:**
- Frontend: http://localhost:5000
- API: http://localhost:5000/api

### Demo Credentials
- **Admin**: admin@vaurms.com / admin123
- **Analyst**: analyst@vaurms.com / analyst123  
- **Viewer**: viewer@vaurms.com / viewer123

## 🏗️ Architecture

### Frontend
- **Static HTML pages** with modular ES6 JavaScript
- **BEM CSS methodology** for maintainable styles
- **Chart.js** for interactive visualizations
- **Progressive enhancement** approach
- **Responsive design** for all devices

### Backend
- **Flask REST API** with JSON responses
- **JWT authentication** with role-based access control
- **SQLAlchemy ORM** with PostgreSQL/SQLite support
- **Modular blueprint structure** for scalability

### Storage
- **PostgreSQL** (production) / **SQLite** (development)
- **File uploads** stored to disk or cloud storage (S3/Azure Blob)
- **Audit logging** for compliance and security

## 📊 Features

### 🔐 Authentication & Authorization
- Secure JWT-based authentication
- Role-based access control (Admin/Analyst/Viewer)
- Session management with refresh tokens
- Audit logging for security compliance

### 📈 Analytics Dashboard
- **KPI Overview**: Revenue, collection rates, customer count, coverage ratios
- **Interactive Charts**: Revenue trends, consumption by customer class
- **Real-time Data**: Live updates from uploaded datasets
- **Responsive Design**: Works on desktop, tablet, and mobile

### 📁 Data Management
- **File Upload**: Drag-and-drop interface for CSV/XLSX/XLS files
- **Schema Validation**: Automatic column detection and validation
- **Data Profiling**: Null analysis, range detection, outlier identification
- **Dataset Management**: Version control and activation

### 🔮 Forecasting
- **Financial Projections**: Revenue, expenses, and fund balance forecasting
- **Scenario Modeling**: Multiple assumption sets for comparison
- **Assumption Management**: Reusable parameter sets
- **Results Visualization**: Interactive charts and tables

### 💰 Rate Management
- **Rate Structure Modeling**: Tiered rates, fixed charges, seasonal pricing
- **Bill Impact Analysis**: Customer class impact assessment
- **Optimization Engine**: Constraint-based rate optimization
- **Coverage Analysis**: Revenue adequacy and reserve requirements

### 👥 User Management
- **User Administration**: Create, edit, and manage user accounts
- **Role Assignment**: Granular permission control
- **Audit Trail**: Complete action logging
- **System Monitoring**: Job status and performance metrics

## 🛠️ Development

### Project Structure
```
WoodstockVAURMS/
├── public/                 # Static frontend assets
│   ├── css/               # BEM-styled CSS
│   │   ├── base.css       # Reset and typography
│   │   ├── layout.css     # Grid and layout
│   │   └── components.css # UI components
│   ├── js/                # Frontend JavaScript modules
│   │   ├── api/           # API client and endpoints
│   │   ├── auth/          # Authentication and guards
│   │   ├── charts/        # Chart.js visualizations
│   │   └── features/      # Feature-specific modules
│   ├── index.html         # Dashboard
│   ├── login.html         # Authentication
│   └── upload.html        # File upload interface
├── server/                # Flask backend
│   ├── api/               # API endpoints
│   ├── models/            # Database models
│   ├── config/            # Configuration
│   └── app.py             # Main application
├── requirements.txt       # Python dependencies
├── run.py                 # Development server
├── setup.py               # Setup script
└── README.md             # This file
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

#### Data Management
- `GET /api/datasets` - List datasets
- `POST /api/datasets/upload` - Upload new dataset
- `GET /api/datasets/:id/profile` - Dataset profiling
- `POST /api/datasets/:id/commit` - Activate dataset

#### Analytics
- `GET /api/analytics/kpis` - Key performance indicators
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/cohorts` - Cohort analysis

#### Forecasting
- `POST /api/forecast/run` - Run financial forecasts
- `GET /api/forecast/:id` - Get forecast results

#### Rate Management
- `POST /api/rates/model` - Model rate structures
- `POST /api/rates/optimise` - Optimize rates

#### Administration
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `GET /api/admin/audit` - Audit log (Admin only)
- `GET /api/admin/jobs` - Job statuses (Admin only)

### Database Schema

#### Core Tables
- **users**: User accounts and roles
- **datasets**: Uploaded data files and metadata
- **bills**: Individual bill records
- **assumptions**: Forecast parameters
- **forecasts**: Financial projections
- **rate_structures**: Rate models and optimization results
- **audit**: System audit trail

### Frontend Conventions

#### JavaScript
- **ES6 modules** with strict mode
- **Modular architecture** with clear separation of concerns
- **Error handling** with user-friendly messages
- **Progressive enhancement** for accessibility

#### CSS
- **BEM methodology** for maintainable styles
- **CSS custom properties** for theming
- **Mobile-first responsive design**
- **Accessible focus states and keyboard navigation**

## 🚀 Deployment

### Development
```bash
python run.py
```

### Production
```bash
# Set environment variables
export FLASK_ENV=production
export DATABASE_URL=postgresql://user:pass@localhost/vaurms
export SECRET_KEY=your-secure-secret-key
export JWT_SECRET_KEY=your-secure-jwt-key

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 server.app:app
```

### Docker (Coming Soon)
```bash
docker build -t vaurms .
docker run -p 5000:5000 vaurms
```

## 🔧 Configuration

### Environment Variables
```bash
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Database
DATABASE_URL=sqlite:///vaurms.db

# File Upload
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=104857600

# Cloud Storage (Optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name

# Redis (Optional)
REDIS_URL=redis://localhost:6379/0
```

## 🧪 Testing

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests
pytest

# Run with coverage
pytest --cov=server
```

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── fixtures/       # Test data
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- **Python**: Follow PEP 8 with Black formatting
- **JavaScript**: Use ESLint with Prettier
- **CSS**: Follow BEM methodology
- **Git**: Conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core authentication and user management
- ✅ Basic analytics dashboard
- ✅ File upload and data management
- ✅ Simple forecasting capabilities

### Phase 2 (Next)
- 🔄 Advanced forecasting algorithms
- 🔄 Rate optimization engine
- 🔄 Advanced analytics and reporting
- 🔄 API documentation and SDK

### Phase 3 (Future)
- 📋 Machine learning integration
- 📋 Real-time data processing
- 📋 Mobile application
- 📋 Multi-tenant architecture

---

**Built with ❤️ for municipal utilities**