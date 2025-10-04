#!/bin/bash

# Exit on error
set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing Ajeyam - Indian History Blogging Platform...${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install frontend dependencies
echo -e "${GREEN}Installing frontend dependencies...${NC}"
cd ajeyam-new
npm install

# Check if frontend .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating frontend .env file from example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}Please update the frontend .env file with your settings.${NC}"
fi

# Install backend dependencies
echo -e "${GREEN}Installing backend dependencies...${NC}"
cd server
npm install

# Check if backend .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating backend .env file from example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}Please update the backend .env file with your MongoDB connection string and other settings.${NC}"
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo -e "${GREEN}Creating uploads directory...${NC}"
    mkdir -p uploads/avatars
    mkdir -p uploads/blogs
    mkdir -p uploads/categories
fi

echo -e "${GREEN}Installation completed!${NC}"
echo -e "${YELLOW}To start the frontend development server, run:${NC}"
echo -e "${GREEN}cd ajeyam-new && npm run dev${NC}"
echo ""
echo -e "${YELLOW}To start the backend development server, run:${NC}"
echo -e "${GREEN}cd ajeyam-new/server && npm run dev${NC}"

exit 0 