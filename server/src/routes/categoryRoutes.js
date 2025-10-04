const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/main-with-subs', categoryController.getMainCategoriesWithSubs);
router.get('/:identifier', categoryController.getCategory);
router.get('/:identifier/blogs', categoryController.getBlogsByCategory);

// Protected routes - admin only
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Admin CRUD operations
router.post('/', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 