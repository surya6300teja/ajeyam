const BookReview = require('../models/BookReview');

// Create a new book review (user)
exports.createReview = async (req, res) => {
  try {
    const { title, bookAuthor, coverImage, rating, summary, review } = req.body;
    const reviewer = req.user._id;
    const newReview = await BookReview.create({
      title,
      bookAuthor,
      coverImage,
      reviewer,
      rating,
      summary,
      review,
      status: 'pending',
    });
    res.status(201).json({ status: 'success', data: { review: newReview } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get all reviews (public, filter by status)
exports.getReviews = async (req, res) => {
  try {
    const status = req.query.status || 'published';
    const filter = { status };
    const reviews = await BookReview.find(filter)
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get all pending reviews (admin)
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await BookReview.find({ status: 'pending' })
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Approve a review (admin)
exports.approveReview = async (req, res) => {
  try {
    const review = await BookReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }
    if (review.status !== 'pending') {
      return res.status(400).json({ status: 'error', message: 'Only pending reviews can be approved' });
    }
    review.status = 'published';
    review.rejectionReason = undefined;
    review.updatedAt = Date.now();
    await review.save();
    res.status(200).json({ status: 'success', data: { review } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Reject a review (admin)
exports.rejectReview = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const review = await BookReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }
    if (review.status !== 'pending') {
      return res.status(400).json({ status: 'error', message: 'Only pending reviews can be rejected' });
    }
    review.status = 'rejected';
    review.rejectionReason = rejectionReason || 'Rejected by admin';
    review.updatedAt = Date.now();
    await review.save();
    res.status(200).json({ status: 'success', data: { review } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete a review (admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await BookReview.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get review stats (admin)
exports.getStats = async (req, res) => {
  try {
    const totalReviews = await BookReview.countDocuments();
    const pendingReviews = await BookReview.countDocuments({ status: 'pending' });
    const publishedReviews = await BookReview.countDocuments({ status: 'published' });
    const avgRatingAgg = await BookReview.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
    ]);
    const avgRating = avgRatingAgg[0]?.avgRating || 0;
    const totalRatings = avgRatingAgg[0]?.totalRatings || 0;
    // Optionally, get recent reviews
    const recentReviews = await BookReview.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title bookAuthor reviewer rating createdAt');
    res.status(200).json({
      status: 'success',
      data: {
        totalReviews,
        pendingReviews,
        publishedReviews,
        avgRating,
        totalRatings,
        recentReviews
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
