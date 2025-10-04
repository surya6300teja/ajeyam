import React, { useState } from 'react';
import api from '../services/api';
import BookReviewForm from '../components/bookReview/BookReviewForm';
import { useNavigate, Link } from 'react-router-dom';

const CreateBookReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.bookReviews.create(formData);
      setSuccess(true);
      setTimeout(() => navigate('/book-reviews'), 1500);
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">Submit a Book Review</h1>
            <p className="text-gray-600 text-base">Share your thoughts and help others discover great reads.</p>
          </div>
          <Link to="/book-reviews" className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-gray-900 border border-gray-300 hover:bg-gray-50">Back</Link>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800" role="status" aria-live="polite">
            Review submitted for approval!
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <BookReviewForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>

        {/* Footer actions (mobile back) */}
        <div className="mt-6 sm:hidden">
          <Link to="/book-reviews" className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-gray-900 border border-gray-300 hover:bg-gray-50 w-full justify-center">Back to Book Reviews</Link>
        </div>
      </div>
    </div>
  );
};

export default CreateBookReview; 