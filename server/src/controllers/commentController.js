const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

// Get all comments for a blog
exports.getAllComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    
    // Verify the blog exists
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found'
      });
    }
    
    // Get all root comments for the blog
    const comments = await Comment.getRootComments(blogId);
    
    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: { comments }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single comment by ID
exports.getComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate({
      path: 'replies',
      options: { sort: { createdAt: 1 } }
    });
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    // Set the user and blog IDs
    req.body.user = req.user.id;
    req.body.blog = req.params.blogId;
    
    // Check if comment is a reply
    if (req.body.parentComment) {
      // Verify parent comment exists and belongs to the same blog
      const parentComment = await Comment.findById(req.body.parentComment);
      
      if (!parentComment || parentComment.blog.toString() !== req.params.blogId) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid parent comment'
        });
      }
    }
    
    // Create the comment
    const newComment = await Comment.create(req.body);
    
    // Populate user details
    await newComment.populate('user', 'name avatar');
    
    res.status(201).json({
      status: 'success',
      data: { comment: newComment }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Check if user is the author of the comment
    if (comment.user.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only edit your own comments'
      });
    }
    
    // Update allowed fields only
    comment.content = req.body.content;
    comment.isEdited = true;
    
    // Save the updated comment
    await comment.save();
    
    res.status(200).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a comment (soft delete)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Check if user is the author of the comment or admin
    if (comment.user.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own comments'
      });
    }
    
    // Soft delete the comment
    await comment.softDelete();
    
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

// Like or unlike a comment
exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Toggle like status
    await comment.toggleLike(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        liked: comment.isLikedByUser(req.user.id),
        likesCount: comment.likesCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get replies to a comment
exports.getReplies = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Get replies
    await comment.populate({
      path: 'replies',
      options: { sort: { createdAt: 1 } }
    });
    
    res.status(200).json({
      status: 'success',
      results: comment.replies.length,
      data: { replies: comment.replies }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 