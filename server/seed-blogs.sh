#!/bin/bash

# Show commands being executed
set -x

# Change to script directory
cd "$(dirname "$0")"

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed. Please install Node.js to continue."
  exit 1
fi

# Run the seeding script
echo "Seeding featured blogs..."
node seed-blogs.js

echo "Done!" 