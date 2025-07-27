#!/bin/bash

echo "🚀 Installing DexStreet Super Sniper Bot..."

# System update and Node/npm/PM2 install
sudo apt update && sudo apt install -y curl git build-essential

if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
fi

echo "Installing PM2 globally..."
sudo npm install -g pm2

# Install backend
echo "📦 Setting up backend..."
cd backend
npm install
pm2 start index.js --name dexstreet-backend
cd ..

# Install frontend
echo "🌐 Setting up frontend..."
cd frontend
npm install
npm run build
pm2 serve dist 3000 --name dexstreet-frontend
cd ..

echo "✅ DexStreet Sniper Bot is LIVE at http://localhost:3000"
