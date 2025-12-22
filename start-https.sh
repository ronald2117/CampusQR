#!/bin/bash

echo "🚀 Starting CampusQR with HTTPS..."
echo ""
echo "📋 Configuration:"
echo "   IP Address: 10.91.103.206"
echo "   Frontend: https://10.91.103.206:5173"
echo "   Backend: https://10.91.103.206:3001"
echo "   Mobile Access: https://10.91.103.206:5173"
echo ""
echo "⚠️  You'll need to accept certificate warnings on first visit"
echo ""
echo "Starting backend server..."
cd server && npm start &
BACKEND_PID=$!

sleep 3

echo ""
echo "Starting frontend server..."
cd ../client && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers starting..."
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📱 Mobile Access: https://10.91.103.206:5173"
echo "💻 Desktop Access: https://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
