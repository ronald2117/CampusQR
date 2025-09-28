# CampusQR - Student Verification System 📱

A comprehensive QR code-based student verification system for campus security and access control built with Node.js, React, and MySQL.

## ✨ Features

- 🔐 **Secure QR Code Generation**: Unique encrypted QR codes for each student with 24-hour expiry
- 📱 **Real-time Scanning**: Mobile-friendly camera-based scanning interface
- 👥 **Student Management**: Full CRUD operations with photo uploads and status tracking
- 📊 **Admin Dashboard**: Real-time analytics, statistics, and system monitoring
- 📋 **Access Logging**: Complete audit trail with detailed reporting and CSV export
- ✏️ **Manual Verification**: Backup verification system for emergency access
- 🎨 **Modern UI**: Clean, responsive interface with pure CSS styling
- 🔒 **Role-based Access**: Admin, Security, and Staff user roles with appropriate permissions

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Pure CSS
- **Backend**: Node.js + Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT tokens with secure encryption
- **QR Codes**: qrcode library for generation, qr-scanner for reading
- **Security**: Helmet.js, rate limiting, input validation
- **File Upload**: Multer for photo handling

## 📁 Project Structure

```
CampusQR/
├── 📂 client/                 # React frontend application
│   ├── 📂 src/
│   │   ├── 📂 components/     # Reusable UI components
│   │   ├── 📂 contexts/       # React contexts (Auth, etc.)
│   │   ├── 📂 pages/         # Main page components
│   │   ├── 📂 services/      # API service functions
│   │   └── 📂 styles/        # CSS stylesheets
│   ├── 📂 public/            # Static assets
│   └── 📄 package.json
├── 📂 server/                # Express.js backend
│   ├── 📂 config/            # Database and app configuration
│   ├── 📂 middleware/        # Custom middleware (auth, etc.)
│   ├── 📂 routes/            # API route definitions
│   ├── 📂 scripts/           # Database setup scripts
│   ├── 📂 utils/             # Utility functions
│   └── 📄 package.json
├── 📄 docker-compose.yml     # Docker deployment configuration
├── 📄 Dockerfile             # Container configuration
└── 📄 setup.sh              # Automated setup script
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- MySQL 8.0+ server
- Modern web browser with camera support

### Option 1: Automated Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd CampusQR

# Run the setup script
./setup.sh
```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm run setup
   # or manually:
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Database Configuration**
   ```bash
   # Update server/.env with your MySQL credentials
   cp server/.env.example server/.env
   # Edit server/.env with your database settings
   ```

3. **Initialize Database**
   ```bash
   cd server
   npm run db:setup
   ```

4. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run server:dev  # Backend only
   npm run client:dev  # Frontend only
   ```

### Option 3: Docker Deployment

```bash
# Start with Docker Compose
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:80
# Backend: http://localhost:3001
```

## 🌐 Application Access

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🔑 Default Credentials

| Role     | Email                    | Password   |
|----------|--------------------------|------------|
| Admin    | admin@campusqr.com      | admin123   |
| Security | security@campusqr.com   | security123|

> ⚠️ **Security Notice**: Change default passwords before production deployment!

## 📖 User Guide

### For Administrators

1. **Student Management**
   - Add, edit, and delete student records
   - Upload student photos
   - Generate QR codes for students
   - Manage enrollment status

2. **System Monitoring**
   - View real-time dashboard statistics
   - Monitor access logs and reports
   - Export data in CSV format
   - Track system health and performance

### For Security Personnel

1. **QR Code Scanning**
   - Use camera-based scanner for real-time verification
   - Support for multiple camera devices
   - Instant access decision display

2. **Manual Verification**
   - Backup verification using student ID
   - Document reason for manual verification
   - Emergency access procedures

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User authentication
GET  /api/auth/verify         # Token validation
POST /api/auth/logout         # User logout
```

### Student Management
```
GET    /api/students          # List all students (paginated)
POST   /api/students          # Create new student
GET    /api/students/:id      # Get student details
PUT    /api/students/:id      # Update student
DELETE /api/students/:id      # Delete student (soft delete)
GET    /api/students/:id/qr   # Generate QR code
```

### Access Control & Logging
```
POST /api/scan/verify         # Verify QR code
POST /api/scan/manual-verify  # Manual verification
GET  /api/scan/logs           # Access logs with filters
```

### Dashboard & Analytics
```
GET /api/dashboard/stats      # System statistics
GET /api/dashboard/health     # System health check
```

## 🛡️ Security Features

- **Encrypted QR Codes**: All QR codes contain encrypted student data
- **Time-based Expiry**: QR codes automatically expire after 24 hours
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data validation and sanitization
- **Secure Headers**: Helmet.js for security headers
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permissions based on user roles

## 🚀 Deployment

### Production Environment Variables

```bash
# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=campusqr

# Security
JWT_SECRET=your-super-secure-jwt-secret
ENCRYPTION_KEY=your-32-character-encryption-key

# Application
NODE_ENV=production
PORT=3001
```

### Docker Production Deployment

1. Update `docker-compose.yml` with production settings
2. Configure SSL certificates in nginx configuration
3. Set strong passwords and secrets
4. Run: `docker-compose -f docker-compose.prod.yml up -d`

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test

# Run integration tests
npm run test:integration
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Image Optimization**: Compressed photo uploads with size limits
- **Caching**: Strategic caching for frequently accessed data
- **Lazy Loading**: Component-based code splitting
- **Connection Pooling**: Efficient database connection management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration for code style
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure mobile responsiveness

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL server is running
   - Check credentials in `.env` file
   - Ensure database exists

2. **Camera Not Working**
   - Grant camera permissions in browser
   - Use HTTPS in production for camera access
   - Check device compatibility

3. **QR Code Generation Fails**
   - Verify encryption key in `.env`
   - Check student data completeness
   - Ensure proper database connectivity

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| AUTH_001 | Invalid credentials | Check username/password |
| DB_001 | Database connection failed | Verify database configuration |
| QR_001 | QR code generation failed | Check encryption settings |
| CAM_001 | Camera access denied | Grant browser permissions |

## 📋 Roadmap

- [ ] **Multi-factor Authentication**: SMS/Email verification
- [ ] **Mobile Application**: Native iOS/Android apps
- [ ] **Biometric Verification**: Fingerprint/Face recognition integration
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **API Rate Limiting**: Enhanced security measures
- [ ] **Real-time Notifications**: WebSocket-based alerts
- [ ] **Multi-campus Support**: Distributed system architecture
- [ ] **Integration APIs**: Third-party system connectivity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:

1. 📧 Email: support@campusqr.com
2. 💬 Discord: [Join our community](https://discord.gg/campusqr)
3. 🐛 Issues: [GitHub Issues](https://github.com/ronald2117/CampusQR/issues)
4. 📖 Documentation: [Full Documentation](https://docs.campusqr.com)

## 🙏 Acknowledgments

- Icons from [Twemoji](https://twemoji.twitter.com/)
- QR Code generation powered by [qrcode](https://www.npmjs.com/package/qrcode)
- Scanner functionality by [qr-scanner](https://www.npmjs.com/package/qr-scanner)
- Built with ❤️ for educational institutions worldwide

---

**Made with 💻 and ☕ by [ronald2117](https://github.com/ronald2117)**

*Securing campuses, one QR code at a time* 🎓
