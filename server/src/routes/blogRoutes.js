const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');
const commentRoutes = require('./commentRoutes');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// =======================
// Admin-only routes
// =======================
router.get('/pending',protect, restrictTo('admin'), blogController.getPendingBlogs);
router.put('/:id/approve', blogController.approveBlog);
router.put('/:id/reject', protect, restrictTo('admin'), blogController.rejectBlog);
router.patch('/:id/status', protect, restrictTo('admin'), blogController.changeBlogStatus);

// =======================
// Nested Comment Routes
// =======================
router.use('/:blogId/comments', commentRoutes);

// =======================
// Public Blog Routes (ordered carefully)
// =======================
router.get('/', blogController.getAllBlogs);
router.get('/published', blogController.getPublishedBlogs);
router.get('/featured', blogController.getFeaturedBlogs);
router.get('/author/:authorId', blogController.getBlogsByAuthor);
router.get('/:id/related', blogController.getRelatedBlogs);

// ⚠️ Dynamic route placed last to avoid conflicts
router.get('/:identifier', blogController.getBlog);

// =======================
// Protected Routes for Authenticated Users
// =======================
router.use(authController.protect);

router.post('/', blogController.createBlog);
router.post('/:id/like', blogController.toggleLike);
router.patch('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;