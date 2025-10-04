const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/User');

// Helper function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper function to create and send token in response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Request body type:', typeof req.body);
    console.log('Request body:', req.body);
    
    // Safely extract data from request body
    let name, email, password, passwordConfirm;
    
    try {
      // Check if req.body is a string (incorrectly formatted JSON)
      if (typeof req.body === 'string') {
        const parsedBody = JSON.parse(req.body);
        name = parsedBody.name;
        email = parsedBody.email;
        password = parsedBody.password;
        passwordConfirm = parsedBody.passwordConfirm;
      } else {
        // Normal object
        name = req.body.name;
        email = req.body.email;
        password = req.body.password;
        passwordConfirm = req.body.passwordConfirm;
      }
    } catch (e) {
      console.error('Error parsing request body:', e);
      return res.status(400).json({
        status: 'error',
        message: 'Could not parse request data. Please ensure you are sending valid JSON.',
      });
    }
    
    // Check if all required fields are provided
    if (!name || !email || !password || !passwordConfirm) {
      console.log('Missing required fields:', {
        name: !name ? 'missing' : 'provided',
        email: !email ? 'missing' : 'provided',
        password: !password ? 'missing' : 'provided',
        passwordConfirm: !passwordConfirm ? 'missing' : 'provided'
      });
      
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields: name, email, password, passwordConfirm',
      });
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('Registration failed: Email already in use:', email);
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use. Please use a different email or login.',
      });
    }
    
    console.log('Creating new user with data:', { name, email });
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      // Generate verification token
      emailVerificationToken: crypto.randomBytes(32).toString('hex'),
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    
    console.log('User created successfully with ID:', newUser._id);
    
    // In a production app, send verification email here
    
    // Create token and send response
    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', JSON.stringify(error.errors));
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join('. '),
        details: error.errors
      });
    }
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({
        status: 'error',
        message: `Duplicate value: ${Object.keys(error.keyValue).join(', ')} already exists.`,
        field: Object.keys(error.keyValue)[0]
      });
    }
    
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }
    
    // Find user by email and include password in results
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }
    
    // Create token and send response
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Protect routes - middleware to check if user is authenticated
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.',
      });
    }
    
    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }
    
    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'User recently changed password. Please log in again.',
      });
    }
    
    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed. Please log in again.',
    });
  }
};

// Restrict certain actions to specific user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action',
      });
    }
    
    next();
  };
};

// Verify user email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });
    
    // Check if user exists and token is valid
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired',
      });
    }
    
    // Update user to verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      status: 'success',
      message: 'Email successfully verified. You can now log in.',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'There is no user with that email address',
      });
    }
    
    // Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // In a production app, send reset email here
    
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      resetToken, // In production, you would NOT send this in the response
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;
    
    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: crypto.createHash('sha256').update(token).digest('hex'),
      passwordResetExpires: { $gt: Date.now() },
    });
    
    // Check if token is valid and not expired
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired',
      });
    }
    
    // Update user password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get current user data
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}; 