 #!/bin/bash

# Exit on error
set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing Ajeyam Server...${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}Please update the .env file with your MongoDB connection string and other settings.${NC}"
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo -e "${GREEN}Creating uploads directory...${NC}"
    mkdir -p uploads/avatars
    mkdir -p uploads/blogs
    mkdir -p uploads/categories
fi

echo -e "${GREEN}Installation completed!${NC}"
echo -e "${YELLOW}To start the development server, run:${NC}"
echo -e "${GREEN}npm run dev${NC}"
echo ""
echo -e "${YELLOW}To start the production server, run:${NC}"
echo -e "${GREEN}npm start${NC}"

exit 0