const Subscriber = require('../models/Subscriber');

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
