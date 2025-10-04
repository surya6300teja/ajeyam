#!/bin/bash

# Script to build the React app and start the server
echo "=== Building React App ==="
cd ajeyam-new
npm run build
if [ $? -ne 0 ]; then
  echo "❌ React build failed. Aborting."
  exit 1
fi
echo "✅ React build completed successfully"

echo "=== Starting Server ==="
cd ../server
if [ ! -f ".env" ]; then
  echo "⚠️ No .env file found in server directory. Copying from example..."
  cp .env.example .env
fi
npm start 