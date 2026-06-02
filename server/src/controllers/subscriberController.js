const Subscriber = require('../models/Subscriber');
const { sendSubscriptionWelcomeEmail } = require('../utils/emailService');

// POST /api/v1/subscribe  — public
exports.subscribe = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Please provide a valid email address.' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(200).json({
        status: 'success',
        message: 'You are already subscribed. Thank you!',
        alreadySubscribed: true,
      });
    }

    await Subscriber.create({ email });

    // Send the welcome email, but don't fail the request if email isn't configured/sending.
    try {
      await sendSubscriptionWelcomeEmail(email);
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
