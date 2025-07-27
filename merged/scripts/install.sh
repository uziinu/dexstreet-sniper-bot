#!/bin/bash

echo "🔧 Installing DexStreet Sniper Bot..."
sleep 1

# Update system and install dependencies
apt-get update -y
apt-get install -y curl git nodejs npm mongodb

# Set working directory
mkdir -p /opt/dexstreet-sniper-bot
cd /opt/dexstreet-sniper-bot

# Clone full repo (placeholder for now, assume files will be extracted later)
echo "📦 Extracting project files..."
unzip /mnt/data/dexstreet-sniper-bot-full.zip -d .

# Install backend
echo "📡 Setting up backend..."
cd backend
npm install
pm2 start index.js --name dexstreet-backend

# Install frontend
echo "💻 Setting up frontend..."
cd ../frontend
npm install
npm run build
npm install -g serve
pm2 start "serve -s dist" --name dexstreet-frontend

# MongoDB setup
echo "🛢️ Setting up MongoDB..."
systemctl start mongodb
systemctl enable mongodb

echo "✅ DexStreet Sniper Bot deployed successfully."
