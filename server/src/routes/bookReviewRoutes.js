const express = require('express');
const router = express.Router();
const bookReviewController = require('../controllers/bookReviewController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public
router.get('/', bookReviewController.getReviews); // ?status=published
router.get('/stats', protect, restrictTo('admin'), bookReviewController.getStats);

// User
router.post('/', protect, bookReviewController.createReview);

// Admin
router.get('/pending', protect, restrictTo('admin'), bookReviewController.getPendingReviews);
router.put('/:id/approve', protect, restrictTo('admin'), bookReviewController.approveReview);
router.put('/:id/reject', protect, restrictTo('admin'), bookReviewController.rejectReview);
router.delete('/:id', protect, restrictTo('admin'), bookReviewController.deleteReview);

module.exports = router;
