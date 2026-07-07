const Subscriber = require('../models/Subscriber');
const User = require('../models/User');
const { sendNewBlogNotification } = require('./emailService');

// Notify all subscribers + registered users that a blog was published.
// Fire-and-forget: callers should not await this in the request path.
exports.notifyNewBlogPublished = async (blog) => {
  try {
    const [subs, users] = await Promise.all([
      Subscriber.find({ isActive: true }).select('email').lean(),
      User.find({}).select('email').lean(),
    ]);

    const emails = [...new Set(
      [...subs, ...users]
        .map((x) => (x.email || '').toLowerCase().trim())
        .filter((e) => /^\S+@\S+\.\S+$/.test(e))
    )];

    if (!emails.length) return;

    // Batch BCC recipients to stay within provider limits.
    const CHUNK = 90;
    for (let i = 0; i < emails.length; i += CHUNK) {
      await sendNewBlogNotification(emails.slice(i, i + CHUNK), blog);
    }
    console.log(`New-blog notification sent to ${emails.length} recipients for "${blog.title}"`);
  } catch (e) {
    console.error('notifyNewBlogPublished failed:', e.message);
  }
};
