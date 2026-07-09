const Subscriber = require('../models/Subscriber');
const { sendSubscriptionWelcomeEmail } = require('./emailService');

// Idempotently add an email to the subscriber list.
// Returns { created, subscriber } — created=true only when a new record is made.
exports.addSubscriber = async (email, source = 'footer') => {
  const clean = (email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(clean)) return { created: false };
  try {
    const existing = await Subscriber.findOne({ email: clean });
    if (existing) return { created: false, subscriber: existing };
    const subscriber = await Subscriber.create({ email: clean, source });
    return { created: true, subscriber };
  } catch (err) {
    if (err.code === 11000) return { created: false };
    throw err;
  }
};

// Send the welcome email at most once per subscriber, recording delivery.
// Returns true when an email was actually sent.
exports.sendWelcomeEmailOnce = async (email) => {
  const clean = (email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(clean)) return false;

  const subscriber = await Subscriber.findOne({ email: clean });
  if (subscriber?.welcomeEmailSentAt) return false; // already welcomed

  await sendSubscriptionWelcomeEmail(clean);
  await Subscriber.updateOne({ email: clean }, { $set: { welcomeEmailSentAt: new Date() } });
  return true;
};
