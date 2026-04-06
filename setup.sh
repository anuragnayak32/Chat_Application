#!/bin/bash

# Chat App - Quick Setup Script
# Run this to get everything set up quickly

set -e  # Exit on error

echo "🚀 Chat App Setup Script"
echo "========================"

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 16+"
  exit 1
fi
echo "✓ Node.js $(node --version) found"

if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install npm"
  exit 1
fi
echo "✓ npm $(npm --version) found"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please edit backend/.env with your MongoDB URI"
fi

echo "Installing backend dependencies..."
npm install
echo "✓ Backend dependencies installed"

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd ../frontend

if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example..."
  cp .env.example .env.local
fi

echo "Installing frontend dependencies..."
npm install
echo "✓ Frontend dependencies installed"

# Final instructions
echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your MongoDB URI (if using remote)"
echo "2. Start MongoDB (if local): mongod"
echo "3. Start backend: cd backend && npm run dev"
echo "4. In another terminal, start frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Documentation:"
echo "- README.md: Quick start and overview"
echo "- DEPLOYMENT.md: Production deployment guide"
echo "- ARCHITECTURE.md: Design decisions and notes"
echo ""
