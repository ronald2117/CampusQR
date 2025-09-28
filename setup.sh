#!/bin/bash

# CampusQR Setup Script
echo "🚀 Setting up CampusQR - Student Verification System"
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL not found. Please make sure MySQL is installed and running."
    echo "   You can install MySQL using:"
    echo "   - Ubuntu/Debian: sudo apt install mysql-server"
    echo "   - macOS: brew install mysql"
    echo "   - Or use Docker: docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -d mysql:8.0"
fi

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client && npm install && cd ..

echo ""
echo "🔧 Setting up environment..."

# Copy environment file if it doesn't exist
if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo "✅ Environment file created at server/.env"
    echo "⚠️  Please update the database credentials in server/.env"
else
    echo "ℹ️  Environment file already exists"
fi

echo ""
echo "🗄️  Database setup..."
echo "Before running the database setup, make sure:"
echo "1. MySQL server is running"
echo "2. You have updated the database credentials in server/.env"
echo ""
read -p "Do you want to setup the database now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd server && npm run db:setup
    if [ $? -eq 0 ]; then
        echo "✅ Database setup completed successfully!"
    else
        echo "❌ Database setup failed. Please check your MySQL configuration."
    fi
    cd ..
else
    echo "⏭️  Skipping database setup. Run 'npm run db:setup' in the server directory when ready."
fi

echo ""
echo "🎉 CampusQR setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update database credentials in server/.env (if not done)"
echo "2. Run database setup: cd server && npm run db:setup"
echo "3. Start the application: npm run dev"
echo ""
echo "🌍 Application URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🔑 Default login credentials:"
echo "   Admin:    admin@campusqr.com / admin123"
echo "   Security: security@campusqr.com / security123"
echo ""
echo "⚠️  Remember to change default passwords in production!"
