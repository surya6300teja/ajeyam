import React, { useState } from 'react';

const BookReviewForm = ({ onSubmit, loading }) => {
  const [title, setTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [rating, setRating] = useState(5);
  const [summary, setSummary] = useState('');
  const [review, setReview] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, bookAuthor, coverImage, rating, summary, review });
  };

  const baseInput = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-shadow';
  const baseLabel = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label className={baseLabel} htmlFor="title">Book Title</label>
        <input id="title" type="text" className={baseInput} value={title} onChange={e => setTitle(e.target.value)} required aria-required="true" />
      </div>
      <div>
        <label className={baseLabel} htmlFor="bookAuthor">Book Author</label>
        <input id="bookAuthor" type="text" className={baseInput} value={bookAuthor} onChange={e => setBookAuthor(e.target.value)} required aria-required="true" />
      </div>
      <div>
        <label className={baseLabel} htmlFor="coverImage">Cover Image URL</label>
        <input id="coverImage" type="url" className={baseInput} value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className={baseLabel} htmlFor="rating">Rating</label>
        <select id="rating" className={baseInput} value={rating} onChange={e => setRating(Number(e.target.value))} required aria-required="true">
          {[5,4,3,2,1].map(star => (
            <option key={star} value={star}>{star} Star{star > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={baseLabel} htmlFor="summary">Summary (optional)</label>
        <textarea id="summary" className={baseInput} value={summary} onChange={e => setSummary(e.target.value)} rows={3} />
      </div>
      <div>
        <label className={baseLabel} htmlFor="review">Detailed Review</label>
        <textarea id="review" className={baseInput} value={review} onChange={e => setReview(e.target.value)} rows={7} required aria-required="true" />
      </div>
      <button type="submit" className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading} aria-busy={loading}>
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
};

export default BookReviewForm; 