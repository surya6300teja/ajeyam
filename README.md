# Ajeyam - Indian History Blogging Platform

Ajeyam is a full-stack blogging platform focused on Indian history, built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

This is a monorepo containing both frontend and backend code:

- `/` - React frontend application
- `/server` - Express backend API

## Features

- User authentication and authorization
- Content creation with rich text editor
- Category-based organization
- Comments and interactions
- Admin dashboard for content moderation
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB database

### Frontend Setup

1. Install dependencies:
```bash
cd ajeyam-new
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string and other settings.

5. Start the development server:
```bash
npm run dev
```

The API will be available at http://localhost:5000

## Development

### Frontend Technologies

- React for the UI components
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Axios for API requests

### Backend Technologies

- Express.js for the API
- Mongoose for MongoDB interactions
- JWT for authentication
- Multer for file uploads
- Express middleware for security

## Deployment

### Frontend

Build the frontend for production:
```bash
cd ajeyam-new
npm run build
```

### Backend

Start the production server:
```bash
cd server
npm start
```

## Documentation

- Frontend documentation: See [/README.md](./README.md)
- Backend documentation: See [/server/README.md](./server/README.md)

## License

This project is licensed under the MIT License.

## Acknowledgements

- Contributors who have dedicated their time to this project
- Open-source libraries that made this project possible 