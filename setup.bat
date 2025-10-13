@echo off
REM ================================
REM CampusQR Setup Script (Windows)
REM ================================
echo.
echo ================================
echo CampusQR Setup Script (Windows)
echo ================================
echo.

REM Check Node.js installation
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js found: %NODE_VERSION%
echo.

REM Check npm installation
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed!
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo npm found: v%NPM_VERSION%
echo.

REM Check MySQL installation
echo Checking MySQL installation...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: MySQL not found in PATH
    echo Please ensure MySQL 8.0+ is installed
    echo Download from: https://dev.mysql.com/downloads/mysql/
    echo.
) else (
    for /f "tokens=*" %%i in ('mysql --version') do echo MySQL found: %%i
    echo.
)

REM Check mkcert installation
echo Checking mkcert installation...
mkcert -version >nul 2>&1
if errorlevel 1 (
    echo WARNING: mkcert not found!
    echo HTTPS certificates are required for mobile camera access.
    echo.
    echo To install mkcert:
    echo 1. Install Chocolatey: https://chocolatey.org/install
    echo 2. Run in PowerShell as Admin: choco install mkcert
    echo 3. Run: mkcert -install
    echo.
    echo OR use the Setup Wizard at: http://localhost:5173/setup-wizard
    echo.
) else (
    for /f "tokens=*" %%i in ('mkcert -version') do echo mkcert found: %%i
    echo.
)

REM Install root dependencies
echo Installing root dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install root dependencies
    echo.
    pause
    exit /b 1
)
echo Root dependencies installed successfully!
echo.

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    echo.
    cd ..
    pause
    exit /b 1
)
cd ..
echo Server dependencies installed successfully!
echo.

REM Install client dependencies
echo Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    echo.
    cd ..
    pause
    exit /b 1
)
cd ..
echo Client dependencies installed successfully!
echo.

REM Check for .env files
echo Checking configuration files...
if not exist "server\.env" (
    echo WARNING: server\.env not found!
    if exist "server\.env.example" (
        echo Creating server\.env from template...
        copy "server\.env.example" "server\.env" >nul
        echo Please edit server\.env with your database credentials
    ) else (
        echo Please create server\.env with your configuration
    )
    echo.
)

if not exist "client\.env" (
    echo WARNING: client\.env not found!
    echo Please create client\.env with VITE_API_URL
    echo Example: VITE_API_URL=https://localhost:3001/api
    echo.
)

REM Get local IP address
echo Detecting your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo Found IP: !IP!
)
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo.
echo 1. Configure Database:
echo    - Edit server\.env with your MySQL credentials
echo    - Run: cd server ^&^& npm run db:setup
echo.
echo 2. Setup HTTPS (Required for mobile camera access):
echo    - Install mkcert: choco install mkcert
echo    - Run: mkcert -install
echo    - Generate certificates: cd client ^&^& mkcert YOUR_IP localhost 127.0.0.1 ::1
echo.
echo 3. Start the application:
echo    - Run: npm run dev
echo.
echo 4. Access the Setup Wizard for detailed configuration:
echo    - http://localhost:5173/setup-wizard
echo.
echo For detailed HTTPS setup instructions, see README.md
echo.
pause
