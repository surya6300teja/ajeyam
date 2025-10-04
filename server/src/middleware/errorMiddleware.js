// Custom error class for operational errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler for development environment
const sendErrorDev = (err, res) => {
  console.log('=== DETAILED ERROR INFO (DEV) ===');
  console.log('Error Name:', err.name);
  console.log('Error Message:', err.message);
  console.log('Error Status Code:', err.statusCode);
  console.log('Stack Trace:', err.stack);
  console.log('Is Operational:', err.isOperational);
  console.log('Additional Properties:', Object.keys(err).filter(key => 
    !['name', 'message', 'stack', 'statusCode', 'status', 'isOperational'].includes(key)
  ));
  
  if (err.code === 11000) {
    console.log('Duplicate Key Error - Fields:', err.keyValue);
  }
  
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

// Error handler for production environment
const sendErrorProd = (err, res) => {
  // Log the error for server monitoring
  console.error('=== PRODUCTION ERROR ===');
  console.error('Error Name:', err.name);
  console.error('Error Message:', err.message);
  console.error('Error Status Code:', err.statusCode);
  console.error('Is Operational:', err.isOperational);
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('Stack Trace:', err.stack);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// Handle MongoDB cast errors (invalid ID format)
const handleCastErrorDB = err => {
  console.log('Cast Error - Invalid data format:', { path: err.path, value: err.value });
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle MongoDB duplicate key error
const handleDuplicateFieldsDB = err => {
  let value = '';
  let field = '';
  
  // Different error formats between MongoDB versions
  if (err.keyValue) {
    value = Object.values(err.keyValue)[0];
    field = Object.keys(err.keyValue)[0];
  } else if (err.errmsg && err.errmsg.includes('duplicate key error')) {
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
    value = match ? match[0] : 'unknown';
    field = err.errmsg.includes('index:') ? 
      err.errmsg.split('index:')[1].split('_')[0].trim() : 'unknown';
  }
  
  console.log('Duplicate Key Error:', { field, value });
  const message = `Duplicate field value: ${value} for field ${field}. Please use another value!`;
  return new AppError(message, 400);
};

// Handle MongoDB validation errors
const handleValidationErrorDB = err => {
  console.log('Validation Error - Invalid fields:', 
    Object.keys(err.errors).map(field => ({ 
      field, 
      message: err.errors[field].message,
      value: err.errors[field].value 
    }))
  );
  
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () => {
  console.log('JWT Error - Invalid token');
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  console.log('JWT Error - Token expired');
  return new AppError('Your token has expired! Please log in again.', 401);
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.log('=== ERROR HANDLER ENTRY ===');
  console.log('Original URL:', req.originalUrl);
  console.log('Method:', req.method);
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, res);
  }
};

// Not found middleware
const notFound = (req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  const error = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  notFound
}; 