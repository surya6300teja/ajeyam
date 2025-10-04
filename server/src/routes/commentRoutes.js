const express = require('express');
const router = express.Router({ mergeParams: true }); // To access params from parent router
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');

// Get all comments for a blog (public)
router.get('/', commentController.getAllComments);

// Get a specific comment by ID (public)
router.get('/:id', commentController.getComment);

// Get replies to a comment (public)
router.get('/:id/replies', commentController.getReplies);

// Protected routes - require authentication
router.use(authController.protect);

// Create a new comment
router.post('/', commentController.createComment);

// Update a comment
router.patch('/:id', commentController.updateComment);

// Delete a comment
router.delete('/:id', commentController.deleteComment);

// Like/unlike a comment
router.post('/:id/like', commentController.toggleLike);

module.exports = router; 