# Ajeyam - Indian History Blogging Platform

Ajeyam is a modern blogging platform focused on Indian history, allowing users to read, create, and interact with historical content.

## Features

- Responsive design for all devices
- User authentication (signup, login, profile management)
- Blog creation with rich text editor
- Categories for organizing content
- Comments and interactions
- Admin dashboard for content moderation
- Dark/light mode support

## Technology Stack

- React.js for the frontend UI
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Axios for API requests
- Node.js/Express backend
- MongoDB database

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Running backend server (see `/server` directory)

### Installation

1. Clone the repository
2. Navigate to the project directory
```bash
cd ajeyam-new
```

3. Install dependencies
```bash
npm install
```

4. Create a `.env` file based on `.env.example` and set your environment variables
```bash
cp .env.example .env
```

5. Start the development server
```bash
npm start
```

## Project Structure

```
ajeyam-new/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── utils/          # Helper functions and constants
│   ├── App.jsx         # Main App component
│   └── index.js        # Entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── README.md           # Documentation
```

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from create-react-app

### Folder Structure

#### Components

Common UI components are organized by functionality:

- `/components/layout` - Layout components like Header, Footer, etc.
- `/components/blog` - Blog-related components
- `/components/auth` - Authentication-related components
- `/components/common` - Shared UI components like buttons, inputs, etc.

#### Pages

Each page has its own component in the `/pages` directory:

- `Home.jsx` - Home page
- `BlogList.jsx` - Blog listing page
- `BlogDetail.jsx` - Individual blog page
- `CreateBlog.jsx` - Blog creation page
- `Login.jsx` - Login page
- `Signup.jsx` - Signup page

#### Context

React Context is used for global state management:

- `AuthContext.jsx` - Authentication state
- Other contexts as needed

## API Integration

The frontend communicates with the backend API using the Axios library. API service functions are organized in the `/services` directory.

## Deployment

To build the project for production:

```bash
npm run build
```

This will create an optimized build in the `build` directory, which can be deployed to any static hosting service.

## License

This project is licensed under the MIT License.

## Acknowledgements

- Images and content are used for educational purposes
- Libraries and packages used are listed in package.json
