# ================================
# CampusQR Setup Script (PowerShell)
# ================================

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "CampusQR Setup Script (Windows)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Check npm installation
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm found: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not installed!" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Check MySQL installation
Write-Host "Checking MySQL installation..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "MySQL found: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "WARNING: MySQL not found in PATH" -ForegroundColor Yellow
    Write-Host "Please ensure MySQL 8.0+ is installed" -ForegroundColor Yellow
    Write-Host "Download from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
}
Write-Host ""

# Check mkcert installation
Write-Host "Checking mkcert installation..." -ForegroundColor Yellow
try {
    $mkcertVersion = mkcert -version
    Write-Host "mkcert found: $mkcertVersion" -ForegroundColor Green
} catch {
    Write-Host "WARNING: mkcert not found!" -ForegroundColor Yellow
    Write-Host "HTTPS certificates are required for mobile camera access." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install mkcert:" -ForegroundColor Yellow
    Write-Host "1. Install Chocolatey: https://chocolatey.org/install" -ForegroundColor Yellow
    Write-Host "2. Run in PowerShell as Admin: choco install mkcert" -ForegroundColor Yellow
    Write-Host "3. Run: mkcert -install" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OR use the Setup Wizard at: http://localhost:5173/setup-wizard" -ForegroundColor Cyan
}
Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install root dependencies" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Root dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Install server dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install server dependencies" -ForegroundColor Red
    Write-Host ""
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..
Write-Host "Server dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install client dependencies" -ForegroundColor Red
    Write-Host ""
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..
Write-Host "Client dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Check for .env files
Write-Host "Checking configuration files..." -ForegroundColor Yellow
if (-not (Test-Path "server\.env")) {
    Write-Host "WARNING: server\.env not found!" -ForegroundColor Yellow
    if (Test-Path "server\.env.example") {
        Write-Host "Creating server\.env from template..." -ForegroundColor Yellow
        Copy-Item "server\.env.example" "server\.env"
        Write-Host "Please edit server\.env with your database credentials" -ForegroundColor Yellow
    } else {
        Write-Host "Please create server\.env with your configuration" -ForegroundColor Yellow
    }
    Write-Host ""
}

if (-not (Test-Path "client\.env")) {
    Write-Host "WARNING: client\.env not found!" -ForegroundColor Yellow
    Write-Host "Please create client\.env with VITE_API_URL" -ForegroundColor Yellow
    Write-Host "Example: VITE_API_URL=https://localhost:3001/api" -ForegroundColor Yellow
    Write-Host ""
}

# Get local IP address
Write-Host "Detecting your IP address..." -ForegroundColor Yellow
try {
    $ipAddress = Get-NetIPAddress -AddressFamily IPv4 | 
                 Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | 
                 Select-Object -First 1 -ExpandProperty IPAddress
    if ($ipAddress) {
        Write-Host "Found IP: $ipAddress" -ForegroundColor Green
    } else {
        Write-Host "Could not auto-detect IP. Run 'ipconfig' to find it manually." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not auto-detect IP. Run 'ipconfig' to find it manually." -ForegroundColor Yellow
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure Database:" -ForegroundColor White
Write-Host "   - Edit server\.env with your MySQL credentials"
Write-Host "   - Run: cd server; npm run db:setup"
Write-Host ""
Write-Host "2. Setup HTTPS (Required for mobile camera access):" -ForegroundColor White
Write-Host "   - Install mkcert: choco install mkcert"
Write-Host "   - Run: mkcert -install"
Write-Host "   - Generate certificates: cd client; mkcert YOUR_IP localhost 127.0.0.1 ::1"
Write-Host ""
Write-Host "3. Start the application:" -ForegroundColor White
Write-Host "   - Run: npm run dev"
Write-Host ""
Write-Host "4. Access the Setup Wizard for detailed configuration:" -ForegroundColor White
Write-Host "   - http://localhost:5173/setup-wizard" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed HTTPS setup instructions, see README.md" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
