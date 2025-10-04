import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';

const BookReviewDetail = () => {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      try {
        const res = await api.bookReviews.getAll();
        const found = (res.data.data.reviews || []).find(r => r._id === id);
        setReview(found);
        if (!found) setError('Review not found.');
      } catch (err) {
        setError('Failed to load review.');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  if (loading) return <div className="py-10 text-center">Loading...</div>;
  if (error) return <div className="py-10 text-center text-red-500">{error}</div>;
  if (!review) return null;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link to="/book-reviews" className="text-blue-600 hover:underline text-sm">← Back to Book Reviews</Link>
      <div className="mt-4 p-6 bg-white rounded shadow">
        {review.coverImage && (
          <img src={review.coverImage} alt={review.title} className="w-32 h-44 object-cover rounded mb-4 mx-auto" />
        )}
        <h1 className="text-2xl font-bold mb-2">{review.title}</h1>
        <div className="text-gray-700 mb-1">by {review.bookAuthor}</div>
        <div className="text-xs text-gray-500 mb-2">Reviewed by {review.reviewer?.name || 'Anonymous'}</div>
        <div className="mb-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
        {review.summary && <div className="mb-2 text-gray-600 italic">{review.summary}</div>}
        <div className="mb-4 text-gray-800 whitespace-pre-line">{review.review}</div>
        {review.status !== 'published' && (
          <div className="text-xs text-yellow-700">Status: {review.status}{review.status === 'rejected' && review.rejectionReason ? ` (Reason: ${review.rejectionReason})` : ''}</div>
        )}
      </div>
    </div>
  );
};

export default BookReviewDetail; 