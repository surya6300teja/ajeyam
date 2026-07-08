const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'An email is required to subscribe'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // How this subscriber joined: footer newsletter form, account signup,
    // or the contact form.
    source: {
      type: String,
      enum: ['footer', 'signup', 'contact'],
      default: 'footer',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscriber', SubscriberSchema);
