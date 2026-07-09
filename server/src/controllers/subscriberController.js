const Subscriber = require('../models/Subscriber');
const { addSubscriber, sendWelcomeEmailOnce } = require('../utils/subscribe');

// GET /api/v1/subscribe — admin: list all subscribers
exports.listSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort('-createdAt').lean();
    res.status(200).json({
      status: 'success',
      results: subscribers.length,
      data: { subscribers },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/v1/subscribe  — public
exports.subscribe = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Please provide a valid email address.' });
    }

    const { created } = await addSubscriber(email, 'footer');
    if (!created) {
      return res.status(200).json({
        status: 'success',
        message: 'You are already subscribed. Thank you!',
        alreadySubscribed: true,
      });
    }

    // Send the welcome email, but don't fail the request if email isn't configured/sending.
    try {
      await sendWelcomeEmailOnce(email);
    } catch (mailErr) {
      console.error('Subscription welcome email failed:', mailErr.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Thank you for subscribing to Ajeyam!',
    });
  } catch (error) {
    // Handle duplicate key race gracefully
    if (error.code === 11000) {
      return res.status(200).json({ status: 'success', message: 'You are already subscribed. Thank you!' });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};
