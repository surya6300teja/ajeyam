import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const BookReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const params = { status: 'published' };
        const res = await api.bookReviews.getAll(params);
        let reviews = res.data.data.reviews || [];
        if (sort === 'highest') {
          reviews = [...reviews].sort((a, b) => b.rating - a.rating);
        } else {
          reviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setReviews(reviews);
      } catch (err) {
        setError('Failed to load book reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [sort]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Book Reviews</h1>
      <div className="mb-4 flex gap-4">
        <button className={`btn ${sort==='recent' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSort('recent')}>Most Recent</button>
        <button className={`btn ${sort==='highest' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSort('highest')}>Highest Rated</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : reviews.length === 0 ? (
        <div>No book reviews found.</div>
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
                <div className="text-xs text-gray-500 mb-2">Reviewed by {review.reviewer?.name || 'Anonymous'}</div>
                <div className="mb-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                <div className="mb-2 text-gray-700 line-clamp-2">{review.summary || review.review.slice(0, 120) + '...'}</div>
                <Link to={`/book-reviews/${review._id}`} className="text-blue-600 hover:underline text-sm">Read Full Review</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookReviewsList; 