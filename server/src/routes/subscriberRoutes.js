const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');

// Public — anyone can subscribe from the footer
router.post('/', subscriberController.subscribe);

module.exports = router;
