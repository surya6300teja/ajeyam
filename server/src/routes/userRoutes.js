const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protected routes for current user (any authenticated user)
router.use(authController.protect);

router.get('/saved-blogs', userController.getSavedBlogs);
router.get('/following', userController.getFollowingAuthors);
router.patch('/update-me', userController.updateMe);
router.patch('/update-password', userController.updatePassword);
router.delete('/delete-me', userController.deleteMe);
router.post('/save-blog/:blogId', userController.toggleSaveBlog);
router.post('/follow/:userId', userController.toggleFollowAuthor);

// Accessible to owner OR admin — must be BEFORE the admin-only block
router.get('/:id/blogs', userController.getUserBlogs);

// Admin only routes
router.use(authController.restrictTo('admin'));

router.get('/', userController.getAllUsers);

// Parameterized routes LAST
router.get('/:id', userController.getUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/block', protect, restrictTo('admin'), userController.blockUser);
router.put('/:id/activate', protect, restrictTo('admin'), userController.activateUser);

module.exports = router;