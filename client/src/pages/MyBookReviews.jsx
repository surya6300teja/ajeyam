import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const MyBookReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyReviews = async () => {
      setLoading(true);
      try {
        // Get all reviews, filter client-side for current user
        const res = await api.bookReviews.getAll();
        const userId = JSON.parse(localStorage.getItem('user'))?._id;
        const myReviews = (res.data.data.reviews || []).filter(r => r.reviewer?._id === userId);
        setReviews(myReviews);
      } catch (err) {
        setError('Failed to load your reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyReviews();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">My Book Reviews</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : reviews.length === 0 ? (
        <div>You haven't submitted any book reviews yet.</div>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review._id} className="p-4 bg-white rounded shadow flex flex-col md:flex-row gap-4">
              {review.coverImage && (
                <img src={review.coverImage} alt={review.title} className="w-24 h-32 object-cover rounded" />
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">{review.title}</h2>
                <div className="text-sm text-gray-600 mb-1">by {review.bookAuthor}</div>
                <div className="mb-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                <div className="mb-2 text-xs text-gray-500">Status: <span className={review.status === 'published' ? 'text-green-600' : review.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}>{review.status}</span></div>
                <Link to={`/book-reviews/${review._id}`} className="text-blue-600 hover:underline text-sm">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookReviews; 