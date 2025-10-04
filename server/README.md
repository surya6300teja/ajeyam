# Ajeyam Server - Backend API

This is the backend server for Ajeyam, an Indian History Blogging Platform built with Node.js, Express, and MongoDB.

## Features

- RESTful API architecture
- JWT-based authentication
- Role-based authorization (admin, editor, user)
- Blog posts with categories, tags, and comments
- User management
- File uploads
- Error handling
- Documentation

## Prerequisites

- Node.js (v14 or later)
- MongoDB database
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the server directory
```bash
cd ajeyam-new/server
```

3. Install dependencies
```bash
npm install
```

4. Create a `.env` file based on the `.env.example`
```bash
cp .env.example .env
```

5. Update the `.env` file with your MongoDB connection string and other configuration values

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Documentation

The API is organized around REST. All data is sent and received as JSON.

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

Authentication is handled using JSON Web Tokens (JWT).

#### Register a new user
```
POST /auth/register
```

#### Login
```
POST /auth/login
```

#### Verify Email
```
GET /auth/verify-email/:token
```

#### Forgot Password
```
POST /auth/forgot-password
```

#### Reset Password
```
POST /auth/reset-password/:token
```

### Blogs

#### Get all blogs
```
GET /blogs
```

#### Get featured blogs
```
GET /blogs/featured
```

#### Get a single blog
```
GET /blogs/:id
```

#### Get related blogs
```
GET /blogs/:id/related
```

#### Create a new blog (authenticated)
```
POST /blogs
```

#### Update a blog (authenticated)
```
PATCH /blogs/:id
```

#### Delete a blog (authenticated)
```
DELETE /blogs/:id
```

#### Like/unlike a blog (authenticated)
```
POST /blogs/:id/like
```

### Comments

#### Get all comments for a blog
```
GET /blogs/:blogId/comments
```

#### Create a new comment (authenticated)
```
POST /blogs/:blogId/comments
```

#### Update a comment (authenticated)
```
PATCH /blogs/:blogId/comments/:id
```

#### Delete a comment (authenticated)
```
DELETE /blogs/:blogId/comments/:id
```

### Categories

#### Get all categories
```
GET /categories
```

#### Get main categories with subcategories
```
GET /categories/main-with-subs
```

#### Get a single category
```
GET /categories/:id
```

#### Get blogs in a category
```
GET /categories/:id/blogs
```

#### Create a category (admin only)
```
POST /categories
```

#### Update a category (admin only)
```
PATCH /categories/:id
```

#### Delete a category (admin only)
```
DELETE /categories/:id
```

### Users

#### Get user profile
```
GET /users/:id
```

#### Get user blogs
```
GET /users/:id/blogs
```

#### Update my profile (authenticated)
```
PATCH /users/update-me
```

#### Update my password (authenticated)
```
PATCH /users/update-password
```

#### Delete my account (authenticated)
```
DELETE /users/delete-me
```

#### Get all users (admin only)
```
GET /users
```

#### Update a user (admin only)
```
PATCH /users/:id
```

#### Delete a user (admin only)
```
DELETE /users/:id
```

## Project Structure

```
server/
├── src/
│   ├── controllers/      # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── server.js         # Server entry point
├── uploads/              # Uploaded files
├── .env                  # Environment variables
├── package.json          # Dependencies
└── README.md             # Documentation
```

## Error Handling

The API uses conventional HTTP response codes to indicate the success or failure of an API request:

- 2xx: Success
- 4xx: Client errors
- 5xx: Server errors

## Future Improvements

- Add rate limiting
- Implement caching with Redis
- Add search functionality
- Integrate email service for notifications
- Add analytics tracking
- Set up CI/CD pipeline

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 