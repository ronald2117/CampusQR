#!/bin/bash

echo "🔍 CampusQR Diagnostic Test"
echo "=========================="
echo ""

# Test 1: Check if ENCRYPTION_KEY is set
echo "📋 Test 1: Check Environment Variables"
cd server
if grep -q "ENCRYPTION_KEY" .env; then
    echo "✅ ENCRYPTION_KEY found in .env"
    grep "ENCRYPTION_KEY" .env
else
    echo "❌ ENCRYPTION_KEY not found in .env"
fi
echo ""

# Test 2: Check if server is running
echo "📋 Test 2: Check Server Status"
if curl -k -s https://10.154.13.206:3001/api/health > /dev/null 2>&1; then
    echo "✅ Server is running"
    curl -k -s https://10.154.13.206:3001/api/health | head -n 1
else
    echo "❌ Server is not responding"
fi
echo ""

# Test 3: List students
echo "📋 Test 3: Check if students exist"
STUDENT_COUNT=$(curl -k -s -H "Authorization: Bearer YOUR_TOKEN" https://10.154.13.206:3001/api/students 2>/dev/null | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
if [ ! -z "$STUDENT_COUNT" ]; then
    echo "✅ Found $STUDENT_COUNT students in database"
else
    echo "⚠️  Could not fetch student count (may need to login first)"
fi
echo ""

echo "🔧 NEXT STEPS:"
echo "============="
echo ""
echo "1. Make sure you RESTARTED the backend server after adding ENCRYPTION_KEY"
echo "2. Generate a NEW QR code after server restart"
echo "3. The QR code must be generated AFTER the server has the ENCRYPTION_KEY"
echo ""
echo "📱 To test on mobile:"
echo "  1. Login to dashboard"
echo "  2. Go to Students page"
echo "  3. Click on a student"
echo "  4. Click 'Generate QR Code'"
echo "  5. This creates a NEW QR code with the correct encryption"
echo "  6. Try scanning this NEW QR code on mobile"
echo ""
