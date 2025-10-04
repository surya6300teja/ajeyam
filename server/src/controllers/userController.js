const User = require('../models/User');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');

// Helper function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get count of blogs by this user
    const blogCount = await Blog.countDocuments({ author: req.params.id });
    
    res.status(200).json({
      status: 'success',
      data: { 
        user,
        blogCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update current user profile
exports.updateMe = async (req, res) => {
  try {
    // Check if user is trying to update password
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'error',
        message: 'This route is not for password updates. Please use /update-password.'
      });
    }
    
    // Filter out fields that are not allowed to be updated
    const allowedFields = ['name', 'bio', 'avatar'];
    const filteredBody = {};
    Object.keys(req.body).forEach(field => {
      if (allowedFields.includes(field)) {
        filteredBody[field] = req.body[field];
      }
    });
    
    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, password, passwordConfirm } = req.body;
    
    // Check if all fields exist
    if (!currentPassword || !password || !passwordConfirm) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current password, new password and password confirmation'
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Your current password is incorrect'
      });
    }
    
    // Update password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    
    // Create new token
    const token = signToken(user._id);
    
    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete current user (deactivate)
exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Filter out password fields
    delete req.body.password;
    delete req.body.passwordConfirm;
    
    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if user has blogs
    const userBlogsCount = await Blog.countDocuments({ author: req.params.id });
    
    if (userBlogsCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: `User has ${userBlogsCount} blogs. Please reassign or delete these blogs before deleting the user.`
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user blogs
exports.getUserBlogs = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Query blogs by user
    const query = { author: req.params.id };
    
    // If not admin or not the user, only show published blogs
    if (!req.user || (req.user.role !== 'admin' && req.user.id !== req.params.id)) {
      query.status = 'published';
    }
    
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Blog.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: blogs.length,
      pagination: {
        page,
        limit,
        totalResults: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      data: { 
        user,
        blogs 
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Block user (admin only)
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Prevent blocking admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin users cannot be blocked'
      });
    }
    
    // Prevent blocking already blocked users
    if (!user.active) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already blocked'
      });
    }
    
    // Update user's active status to false
    const blockedUser = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: { user: blockedUser }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Activate user (admin only)
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Prevent activating already active users
    if (user.active) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already active'
      });
    }
    
    // Update user's active status to true
    const activatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { active: true },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: { user: activatedUser }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Toggle save/unsave a blog
exports.toggleSaveBlog = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const blogId = req.params.blogId;
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const index = user.savedBlogs.indexOf(blogId);
    if (index > -1) {
      user.savedBlogs.splice(index, 1); // Unsave
    } else {
      user.savedBlogs.push(blogId); // Save
    }
    await user.save();
    res.status(200).json({ status: 'success', data: { savedBlogs: user.savedBlogs } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get all saved blogs for current user
exports.getSavedBlogs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedBlogs');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: { savedBlogs: user.savedBlogs } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Toggle follow/unfollow an author
exports.toggleFollowAuthor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const authorId = req.params.userId;
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    if (user.following.includes(authorId)) {
      user.following.pull(authorId); // Unfollow
    } else {
      user.following.push(authorId); // Follow
    }
    await user.save();
    res.status(200).json({ status: 'success', data: { following: user.following } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get all following authors for current user
exports.getFollowingAuthors = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following', 'name avatar bio');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: { following: user.following } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
}; 