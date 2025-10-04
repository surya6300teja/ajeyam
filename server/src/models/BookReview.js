const mongoose = require('mongoose');

const bookReviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  bookAuthor: { type: String, required: true },
  coverImage: { type: String }, // URL or base64
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  summary: { type: String },
  review: { type: String, required: true },
  status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BookReview', bookReviewSchema);