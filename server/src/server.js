const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });


const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const utilRoutes = require('./routes/utilRoutes');
const bookReviewRoutes = require('./routes/bookReviewRoutes');

// Import error middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize express app
const app = express();

// Detailed CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow any origin to access our API and resources
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Place the error handler before the JSON middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({ 
      status: 'error',
      message: 'Invalid JSON format in request body. Please check your data format.',
      details: err.message
    });
  }
  next(err);
});

// Request body parsing middleware
app.use(express.json({ 
  limit: '10mb'
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan logging middleware
app.use(morgan('dev'));

// Custom request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Headers:', JSON.stringify(req.headers));
  
  // For debugging - log request body for non-GET requests
  if (req.method !== 'GET') {
    console.log('Request Body:', JSON.stringify(req.body));
  }
  
  // Capture response for logging
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`[${new Date().toISOString()}] Response Status: ${res.statusCode}`);
    if (res.statusCode >= 400) {
      console.log('Response Body:', body);
    }
    originalSend.call(this, body);
  };
  
  next();
});

// Serve static files from uploads directory with proper headers for sharing
app.use('/uploads', (req, res, next) => {
  // Set Cache-Control headers for static files
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
  
  // Set Cross-Origin headers specifically for images
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Serve public directory for open graph images and other public assets
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/utils', utilRoutes);
app.use('/api/v1/reviews', bookReviewRoutes);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

// Serve the React app for all other routes
// This needs to be AFTER API routes but BEFORE error handlers
app.get('*', (req, res, next) => {
  // Skip API routes (they're already handled)
  if (req.url.startsWith('/api/')) {
    return next();
  }
  
  // Skip serving static files (they're already handled)
  if (req.url.startsWith('/uploads/') || req.url.match(/\.(jpg|jpeg|png|gif|svg|css|js)$/i)) {
    return next();
  }
  
  // Try to serve from different locations based on environment
  const isDev = process.env.NODE_ENV === 'development';
  
  // First try the standard build directory
  const indexPath = path.join(__dirname, '../../ajeyam-new/dist/index.html');
  
  // Fallback to the development version if build doesn't exist
  const devIndexPath = path.join(__dirname, '../../ajeyam-new/index.html');
  
  // Use the appropriate path based on what exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (fs.existsSync(devIndexPath)) {
    // In development, redirect to the Vite dev server if available
    if (isDev) {
      res.redirect(`http://localhost:5173${req.originalUrl}`);
    } else {
      // Otherwise just serve the index.html file directly
      res.sendFile(devIndexPath);
    }
  } else {
    // If neither exists, show a friendly error
    res.status(404).send(`
      <html>
        <head><title>App Notb Built</title></head>
        <body>
          <h1>React App Not Built</h1>
          <p>The React application hasn't been built yet. Please run:</p>
          <pre>cd ajeyam-new && npm run build</pre>
          <p>Or start the development server:</p>
          <pre>cd ajeyam-new && npm run dev</pre>
        </body>
      </html>
    `);
  }
});

// Handle undefined routes with custom not found middleware
app.use(notFound);

// Global error handling middleware
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`API URL: http://localhost:${PORT}/api/v1`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app; // For testing purposes 