const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');
const commentRoutes = require('./commentRoutes');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { uploadBlogImage } = require('../utils/fileUpload');

// =======================
// Admin-only routes
// =======================
router.get('/pending',protect, restrictTo('admin'), blogController.getPendingBlogs);
router.put('/:id/approve', protect, restrictTo('admin'), blogController.approveBlog);
router.put('/:id/reject', protect, restrictTo('admin'), blogController.rejectBlog);
router.patch('/:id/status', protect, restrictTo('admin'), blogController.changeBlogStatus);
router.patch('/:id/featured', protect, restrictTo('admin'), blogController.toggleFeatured);

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

// Upload a cover/inline image file, returns { url } to store on the blog
router.post('/upload-cover', uploadBlogImage, blogController.uploadCoverImage);
router.post('/', blogController.createBlog);
router.post('/:id/like', blogController.toggleLike);
router.patch('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;