#!/bin/bash
set -e

echo "🚀 Installing frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "🚀 Installing backend..."
cd backend
npm ci
npx ncc build index.js -o dist
cd ..

echo "✅ DexStreet Sniper Bot is built and ready."
