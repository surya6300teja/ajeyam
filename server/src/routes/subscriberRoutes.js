const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public — anyone can subscribe from the footer
router.post('/', subscriberController.subscribe);

// Admin — list subscribers
router.get('/', protect, restrictTo('admin'), subscriberController.listSubscribers);

module.exports = router;
