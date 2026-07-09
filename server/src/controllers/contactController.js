const ContactMessage = require('../models/ContactMessage');
const { addSubscriber, sendWelcomeEmailOnce } = require('../utils/subscribe');

// POST /api/v1/contact — public: submit a contact form message
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !message?.trim() || !/^\S+@\S+\.\S+$/.test(email || '')) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide your name, a valid email, and a message.',
      });
    }

    await ContactMessage.create({ name: name.trim(), email, message: message.trim() });

    // Contact-form senders also become subscribers + get the welcome mail
    // (best-effort — never block the contact submission on it).
    addSubscriber(email, 'contact')
      .then(() => sendWelcomeEmailOnce(email))
      .catch((err) => console.error('Contact auto-subscribe/welcome failed:', err.message));

    res.status(201).json({
      status: 'success',
      message: 'Thank you for your message! We will get back to you soon.',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/v1/contact — admin: list messages (newest first)
exports.listMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort('-createdAt').lean();
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: { messages },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/v1/contact/:id/read — admin: mark a message as read
exports.markRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ status: 'error', message: 'Message not found' });
    }
    res.status(200).json({ status: 'success', data: { message } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// DELETE /api/v1/contact/:id — admin: delete a message
exports.deleteMessage = async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
