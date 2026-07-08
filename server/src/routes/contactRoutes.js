const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public — submit the contact form
router.post('/', contactController.submitMessage);

// Admin — manage messages
router.get('/', protect, restrictTo('admin'), contactController.listMessages);
router.patch('/:id/read', protect, restrictTo('admin'), contactController.markRead);
router.delete('/:id', protect, restrictTo('admin'), contactController.deleteMessage);

module.exports = router;
