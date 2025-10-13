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
- 🔒 **Role-based Access**: Admin and Security user roles with appropriate permissions

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
- **mkcert** (for HTTPS - required for mobile camera access)

### Option 1: Automated Setup (Linux/macOS/Git Bash)

```bash
# Clone the repository
git clone <your-repo-url>
cd CampusQR

# Make script executable and run
chmod +x setup.sh
./setup.sh
```

### Option 2: Automated Setup (Windows PowerShell)

```powershell
# Clone the repository
git clone <your-repo-url>
cd CampusQR

# Run PowerShell setup script
.\setup.ps1
```

### Option 3: Automated Setup (Windows Command Prompt)

```batch
REM Clone the repository
git clone <your-repo-url>
cd CampusQR

REM Run batch setup script
setup.bat
```

### Option 4: Manual Setup

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
   # Copy environment template
   cp server/.env.example server/.env
   # Edit server/.env with your database settings
   ```

3. **Initialize Database**
   ```bash
   cd server
   npm run db:setup
   ```

4. **Configure HTTPS** (See detailed instructions below)

5. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run server:dev  # Backend only
   npm run client:dev  # Frontend only
   ```

## 🔒 HTTPS Configuration (Required for Mobile Camera Access)

Mobile browsers require HTTPS to access the device camera. Follow these platform-specific instructions:

### Step 1: Find Your Network IP Address

#### On Windows:
```powershell
# PowerShell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"}

# OR Command Prompt
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

#### On macOS:
```bash
# Terminal
ifconfig | grep "inet " | grep -v 127.0.0.1

# OR
ipconfig getifaddr en0  # For Wi-Fi
ipconfig getifaddr en1  # For Ethernet
```

#### On Linux:
```bash
# Terminal
ip addr show | grep "inet " | grep -v 127.0.0.1

# OR
hostname -I
```

**Example IP addresses:**
- `192.168.1.100` (Home networks)
- `10.154.13.206` (Corporate networks)
- `172.16.0.50` (Private networks)

### Step 2: Install mkcert

#### On Windows:

**Option A: Using Chocolatey (Recommended)**
```powershell
# Install Chocolatey (if not installed)
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install mkcert
choco install mkcert

# Install local CA
mkcert -install
```

**Option B: Using Scoop**
```powershell
scoop bucket add extras
scoop install mkcert

# Install local CA
mkcert -install
```

**Option C: Manual Download**
1. Download from: https://github.com/FiloSottile/mkcert/releases
2. Rename to `mkcert.exe`
3. Add to PATH or use full path
4. Run: `mkcert -install`

#### On macOS:
```bash
# Using Homebrew
brew install mkcert

# Install local CA
mkcert -install
```

#### On Linux:
```bash
# Ubuntu/Debian
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
sudo chmod +x /usr/local/bin/mkcert

# Fedora
sudo dnf install nss-tools
sudo dnf install mkcert

# Arch Linux
sudo pacman -S mkcert

# Install local CA
mkcert -install
```

### Step 3: Generate SSL Certificates

Navigate to the `client` folder and generate certificates for your IP:

```bash
cd client

# Replace YOUR_IP with your actual IP address from Step 1
# Example: mkcert 192.168.1.100 localhost 127.0.0.1 ::1
mkcert YOUR_IP localhost 127.0.0.1 ::1
```

**Windows PowerShell:**
```powershell
cd client
mkcert 192.168.1.100 localhost 127.0.0.1 ::1
```

**This creates two files:**
- `YOUR_IP+3.pem` (Certificate)
- `YOUR_IP+3-key.pem` (Private Key)

### Step 4: Configure Environment Variables

#### Backend (.env in `server/` folder):

```bash
# server/.env
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=campusqr
DATABASE_USER=root
DATABASE_PASSWORD=your_password

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_change_in_production
ENCRYPTION_KEY=campusqr_secure_encryption_key_2025_do_not_share

# Network (use your actual IP)
FRONTEND_URL=https://192.168.1.100:5173

# Environment
NODE_ENV=development
```

#### Frontend (.env in `client/` folder):

```bash
# client/.env
# Replace with your actual IP address
VITE_API_URL=https://192.168.1.100:3001/api
```

### Step 5: Update vite.config.js

Edit `client/vite.config.js` to use your IP and certificates:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    https: {
      // Update these filenames to match your generated certificates
      key: fs.readFileSync(path.resolve(__dirname, '192.168.1.100+3-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '192.168.1.100+3.pem')),
    },
    proxy: {
      '/api': {
        target: 'https://192.168.1.100:3001', // Your backend URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

### Step 6: Update Backend HTTPS Configuration

The backend server (`server/index.js`) should already be configured for HTTPS. Verify it includes:

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');

// HTTPS configuration
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../client/192.168.1.100+3-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../client/192.168.1.100+3.pem'))
};

// Create HTTPS server
https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`🔒 HTTPS Server running on https://192.168.1.100:${PORT}`);
});
```

### Step 7: Configure Firewall

#### Windows Firewall:

**Option A: Using GUI**
1. Open "Windows Defender Firewall with Advanced Security"
2. Click "Inbound Rules" → "New Rule"
3. Select "Port" → Next
4. Select TCP, enter ports: `3001,5173` → Next
5. Select "Allow the connection" → Next
6. Apply to all profiles (Domain, Private, Public) → Next
7. Name it "CampusQR" → Finish

**Option B: Using PowerShell (as Administrator)**
```powershell
# Allow backend port
New-NetFirewallRule -DisplayName "CampusQR Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow

# Allow frontend port
New-NetFirewallRule -DisplayName "CampusQR Frontend" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow
```

#### macOS Firewall:
```bash
# System Preferences → Security & Privacy → Firewall → Firewall Options
# Click "+" and add Node.js
# Select "Allow incoming connections"
```

#### Linux Firewall:

**Ubuntu/Debian (UFW):**
```bash
sudo ufw allow 3001/tcp
sudo ufw allow 5173/tcp
sudo ufw reload
```

**Fedora/RHEL (firewalld):**
```bash
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --add-port=5173/tcp --permanent
sudo firewall-cmd --reload
```

### Step 8: Start the Application

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

## 📱 Mobile Access

### On Your Computer:
```
https://192.168.1.100:5173
```

### On Mobile Devices (same network):

1. **Accept Certificate Warning**
   - Open browser on mobile device
   - Navigate to: `https://YOUR_IP:5173`
   - You'll see a security warning
   - Click "Advanced" → "Proceed to site" (or similar)
   - Do the same for backend: `https://YOUR_IP:3001/api/health`

2. **iOS Safari:**
   - Go to Settings → General → About → Certificate Trust Settings
   - Enable full trust for the mkcert root certificate

3. **Android Chrome:**
   - Visit the site and accept the certificate warning
   - Alternatively, install the mkcert root CA certificate manually

### Troubleshooting Mobile Access

**Camera Permission Denied:**
- Ensure HTTPS is working (check the lock icon in browser)
- Grant camera permission when prompted
- Check browser settings → Site permissions

**Cannot Connect:**
- Verify mobile device is on the same WiFi network
- Check firewall settings
- Verify IP address hasn't changed (`ipconfig`/`ifconfig`)
- Ensure both frontend and backend servers are running

**Certificate Errors:**
- Accept certificates for both frontend and backend URLs
- Clear browser cache and try again
- Verify mkcert root CA is installed on the device

## 🌐 Network Configuration for Different Environments

### Scenario 1: Development on Single Computer (localhost)
```bash
# client/.env
VITE_API_URL=https://localhost:3001/api

# server/.env
FRONTEND_URL=https://localhost:5173

# Access at: https://localhost:5173
```

### Scenario 2: Testing on Mobile (same WiFi)
```bash
# Find your IP first (e.g., 192.168.1.100)

# client/.env
VITE_API_URL=https://192.168.1.100:3001/api

# server/.env
FRONTEND_URL=https://192.168.1.100:5173

# Access at: https://192.168.1.100:5173
```

### Scenario 3: Different WiFi Network
When you move to a new network:

1. Find new IP address
2. Generate new certificates with new IP:
   ```bash
   cd client
   mkcert NEW_IP localhost 127.0.0.1 ::1
   ```
3. Update `.env` files with new IP
4. Update `vite.config.js` certificate filenames
5. Update `server/index.js` certificate paths
6. Restart both servers

**Pro Tip:** Use the [Setup Wizard](/setup-wizard) to automatically generate configuration for new networks!

### Scenario 4: Production Deployment
Use proper SSL certificates from a trusted CA (Let's Encrypt, etc.) instead of mkcert.

### Option 3: Docker Deployment

```bash
# Start with Docker Compose
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:80
# Backend: http://localhost:3001
```

## 🌐 Application Access

### Local Development
- **Frontend**: https://localhost:5173
- **Backend API**: https://localhost:3001
- **Setup Wizard**: https://localhost:5173/setup-wizard (no login required)
- **API Health Check**: https://localhost:3001/api/health

### Mobile Access (Same Network)
Replace `localhost` with your computer's IP address:
- **Frontend**: https://192.168.1.100:5173
- **Backend API**: https://192.168.1.100:3001
- **Setup Wizard**: https://192.168.1.100:5173/setup-wizard

⚠️ **Important**: 
- Use HTTPS (not HTTP) for camera access on mobile
- Accept certificate warnings on first visit
- Ensure devices are on the same WiFi network

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
   - Verify MySQL server is running:
     - **Windows**: Check Services (Win + R → `services.msc`)
     - **macOS**: `brew services list`
     - **Linux**: `sudo systemctl status mysql`
   - Check credentials in `server/.env` file
   - Ensure database exists: `CREATE DATABASE campusqr;`
   - Test connection: `mysql -u root -p -h localhost campusqr`

2. **Camera Not Working**
   - **HTTPS Required**: Mobile browsers require HTTPS for camera access
   - Grant camera permissions in browser settings
   - Check for HTTPS (look for lock icon in address bar)
   - Accept certificate warnings on both frontend and backend URLs
   - Try different browser (Chrome recommended)
   - On iOS: Settings → Safari → Camera (ensure not blocked)
   - On Android: Browser → Settings → Site Settings → Camera

3. **QR Code Generation Fails**
   - Verify `ENCRYPTION_KEY` is set in `server/.env`
   - Key must remain constant (don't change after generating QR codes)
   - Check student data completeness (all required fields)
   - Ensure proper database connectivity

4. **Certificate Errors / HTTPS Not Working**
   - **Verify mkcert is installed**: Run `mkcert -version`
   - **Install root CA**: Run `mkcert -install`
   - **Generate certificates**: `cd client && mkcert YOUR_IP localhost 127.0.0.1 ::1`
   - **Check certificate files exist** in `client/` folder
   - **Update paths** in `vite.config.js` and `server/index.js`
   - **Restart servers** after certificate changes
   - **On Windows**: Run PowerShell as Administrator for `mkcert -install`

5. **Cannot Access from Mobile Device**
   - **Same Network**: Ensure mobile and computer are on same WiFi
   - **Find IP**: Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - **Firewall**: Check firewall allows ports 3001 and 5173
   - **Accept Certificates**: 
     - Visit `https://YOUR_IP:5173` and accept warning
     - Visit `https://YOUR_IP:3001/api/health` and accept warning
   - **Clear Cache**: Clear browser cache and cookies
   - **Try Different Browser**: Chrome works best

6. **"Mixed Content" Errors**
   - Ensure BOTH frontend and backend use HTTPS
   - Check `VITE_API_URL` in `client/.env` starts with `https://`
   - Verify backend is running with HTTPS certificates
   - Check browser console for exact error messages

7. **Port Already in Use**
   - **Windows**: 
     ```powershell
     # Find process using port 3001
     netstat -ano | findstr :3001
     # Kill process (replace PID)
     taskkill /PID <PID> /F
     ```
   - **macOS/Linux**:
     ```bash
     # Find and kill process on port 3001
     lsof -ti:3001 | xargs kill -9
     # Or for port 5173
     lsof -ti:5173 | xargs kill -9
     ```

8. **IP Address Changed**
   - Your IP may change when connecting to different networks
   - Find new IP: `ipconfig` / `ifconfig` / `ip addr`
   - Generate new certificates with new IP
   - Update `.env` files
   - Update `vite.config.js`
   - Restart servers
   - **Quick Fix**: Use the [Setup Wizard](/setup-wizard) to reconfigure

9. **Windows-Specific Issues**
   - **PowerShell Execution Policy**:
     ```powershell
     Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
     ```
   - **Path Issues**: Use forward slashes `/` in config files even on Windows
   - **Antivirus**: Temporarily disable antivirus if blocking connections
   - **Windows Firewall**: Create inbound rules for ports 3001 and 5173

10. **Module Not Found Errors**
    - Delete `node_modules` and reinstall:
      ```bash
      # In project root
      rm -rf node_modules package-lock.json
      rm -rf server/node_modules server/package-lock.json
      rm -rf client/node_modules client/package-lock.json
      npm install
      cd server && npm install
      cd ../client && npm install
      ```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| AUTH_001 | Invalid credentials | Check username/password |
| DB_001 | Database connection failed | Verify database configuration and MySQL is running |
| QR_001 | QR code generation failed | Check encryption settings in `.env` |
| CAM_001 | Camera access denied | Grant browser permissions and ensure HTTPS |
| CERT_001 | Certificate error | Install mkcert root CA with `mkcert -install` |
| NET_001 | Network unreachable | Check firewall and verify IP address |
| CORS_001 | CORS policy error | Verify `FRONTEND_URL` in backend `.env` matches frontend URL |

### Getting Help

If issues persist:

1. **Check Console Logs**:
   - Browser DevTools (F12) → Console tab
   - Backend terminal output
   - Look for red error messages

2. **Verify Configuration**:
   - All `.env` files have correct values
   - IP addresses match your actual network IP
   - Certificate files exist and paths are correct

3. **Use Setup Wizard**:
   - Navigate to `/setup-wizard`
   - Run connection tests
   - Download fresh configuration files

4. **Test Endpoints**:
   ```bash
   # Test backend health
   curl -k https://localhost:3001/api/health
   
   # Test from mobile (replace IP)
   curl -k https://192.168.1.100:3001/api/health
   ```

5. **Check Versions**:
   ```bash
   node --version  # Should be 16+
   npm --version
   mysql --version # Should be 8.0+
   mkcert -version
   ```

## 📋 Roadmap

- [ ] **Multi-factor Authentication**: SMS/Email verification
- [ ] **Mobile Application**: Native iOS/Android apps
- [ ] **Biometric Verification**: Fingerprint/Face recognition integration
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **API Rate Limiting**: Enhanced security measures
- [ ] **Real-time Notifications**: WebSocket-based alerts
- [ ] **Multi-campus Support**: Distributed system architecture
- [ ] **Integration APIs**: Third-party system connectivity

## 📚 Quick Reference

### Common Commands

```bash
# Install dependencies
npm run setup

# Initialize database
cd server && npm run db:setup

# Start development servers
npm run dev

# Start individually
npm run server:dev  # Backend only
npm run client:dev  # Frontend only

# Run in production
npm start
```

### Windows-Specific Commands

```powershell
# Find your IP address
ipconfig

# Check if ports are in use
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Kill process on port
taskkill /PID <PID> /F

# Open firewall ports (PowerShell as Admin)
New-NetFirewallRule -DisplayName "CampusQR Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
New-NetFirewallRule -DisplayName "CampusQR Frontend" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow

# Install mkcert (PowerShell as Admin)
choco install mkcert
mkcert -install
```

### macOS/Linux Commands

```bash
# Find your IP address
ifconfig | grep "inet "  # macOS
ip addr show             # Linux

# Check if ports are in use
lsof -i :3001
lsof -i :5173

# Kill process on port
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Install mkcert
brew install mkcert      # macOS
sudo apt install mkcert  # Ubuntu/Debian
mkcert -install
```

### HTTPS Certificate Commands

```bash
# Generate certificates (replace YOUR_IP)
cd client
mkcert 192.168.1.100 localhost 127.0.0.1 ::1

# List generated certificates
ls -la *.pem

# Verify mkcert installation
mkcert -version
mkcert -CAROOT  # Show CA root directory
```

### Database Commands

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE campusqr;

# Import schema
mysql -u root -p campusqr < server/database/schema.sql

# Check database exists
SHOW DATABASES;

# Show tables
USE campusqr;
SHOW TABLES;
```

### Testing Connections

```bash
# Test backend health (Linux/macOS)
curl -k https://localhost:3001/api/health

# Test backend health (Windows PowerShell)
Invoke-WebRequest -Uri https://localhost:3001/api/health -SkipCertificateCheck

# Test from mobile network
curl -k https://192.168.1.100:3001/api/health
```

### File Locations

```
CampusQR/
├── server/.env              ← Backend configuration
├── client/.env              ← Frontend configuration
├── client/vite.config.js    ← Frontend HTTPS settings
├── server/index.js          ← Backend HTTPS settings
├── client/*.pem             ← SSL certificates
└── server/database/         ← Database schemas
```

### Environment Variables

**server/.env:**
```bash
PORT=3001
DATABASE_HOST=localhost
DATABASE_NAME=campusqr
DATABASE_USER=root
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
FRONTEND_URL=https://YOUR_IP:5173
```

**client/.env:**
```bash
VITE_API_URL=https://YOUR_IP:3001/api
```

### Port Reference

| Port | Service | URL |
|------|---------|-----|
| 3001 | Backend API | https://YOUR_IP:3001 |
| 5173 | Frontend App | https://YOUR_IP:5173 |
| 3306 | MySQL Database | localhost:3306 |

### Useful Links

- **Setup Wizard**: https://YOUR_IP:5173/setup-wizard (No login required)
- **Admin Login**: https://YOUR_IP:5173
- **API Health**: https://YOUR_IP:3001/api/health
- **Database Setup**: [server/database/schema.sql](server/database/schema.sql)
- **HTTPS Guide**: [SETUP_WIZARD.md](SETUP_WIZARD.md)

### Browser Console Commands

```javascript
// Check current API URL
console.log(import.meta.env.VITE_API_URL)

// Test API connection
fetch('https://YOUR_IP:3001/api/health')
  .then(r => r.json())
  .then(console.log)

// Get current location
window.location.href

// Check local storage token
localStorage.getItem('token')
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## 🙏 Acknowledgments

- Icons from [Twemoji](https://twemoji.twitter.com/)
- QR Code generation powered by [qrcode](https://www.npmjs.com/package/qrcode)
- Scanner functionality by [qr-scanner](https://www.npmjs.com/package/qr-scanner)
- Built with ❤️ for educational institutions worldwide


*Securing campuses, one QR code at a time* 🎓
