const Subscriber = require('../models/Subscriber');
const Blog = require('../models/Blog');
const { sendNewBlogNotification } = require('./emailService');

// Notify all subscribers that a blog was published. Registered users are
// auto-added to the subscriber list on signup, so this single list covers
// everyone and also respects anyone who has unsubscribed.
// Fire-and-forget: callers should not await this in the request path.
exports.notifyNewBlogPublished = async (blog) => {
  try {
    // Atomically claim the send: this only succeeds if the article has never
    // been announced before. Guarantees exactly one blast per article, even if
    // it is unpublished and re-published, approved twice, or double-clicked.
    const claimed = await Blog.findOneAndUpdate(
      {
        _id: blog._id,
        $or: [{ notificationSentAt: { $exists: false } }, { notificationSentAt: null }],
      },
      { $set: { notificationSentAt: new Date() } },
      { new: true }
    ).lean();

    if (!claimed) {
      console.log(`Blog notification already sent for "${blog.title}" — skipping duplicate.`);
      return;
    }

    const subs = await Subscriber.find({ isActive: true }).select('email').lean();

    const emails = [...new Set(
      subs
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
    // Deliberately fail closed: the claim above is NOT released. A partial
    // failure mid-blast must never cause the whole list to be emailed again.
    console.error(`notifyNewBlogPublished failed for "${blog.title}":`, e.message);
  }
};
