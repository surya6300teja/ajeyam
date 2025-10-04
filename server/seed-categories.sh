#!/bin/bash

# Script to seed categories to the database
# Usage: ./seed-categories.sh [--force]
# The --force flag will delete existing categories before adding new ones

echo "=== Ajeyam Blog - Category Seeding Script ==="
echo "This script will add predefined categories to the database."

# Check if Node.js is installed
if ! command -v node > /dev/null 2>&1; then
  echo "Error: Node.js is not installed."
  exit 1
fi

# Determine script directory and change to server directory
SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR"

# Check if MONGO_URI is set in the .env file
if [ ! -f .env ]; then
  echo "Error: .env file not found in the server directory."
  exit 1
fi

if ! grep -q "MONGO_URI" .env; then
  echo "Error: MONGO_URI is not set in the .env file."
  exit 1
fi

# Run the seeding script
echo "Running seeding script..."
if [ "$1" = "--force" ]; then
  echo "Force flag detected. Will override existing categories."
  node src/scripts/seed-categories.js --force
else
  node src/scripts/seed-categories.js
fi

# Check if the script executed successfully
if [ $? -eq 0 ]; then
  echo "Category seeding completed successfully."
else
  echo "Error: Category seeding failed."
  exit 1
fi

echo "=== Seeding completed ===" 