import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Comments = ({ blogId, initialCount = 0 }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(initialCount);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Fix the issue with isAuthenticated not being a function
  const userIsAuthenticated = typeof isAuthenticated === 'function' 
    ? isAuthenticated() 
    : !!isAuthenticated;
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        console.log('Fetching comments for blog:', blogId);
        
        const response = await api.comments.getComments(blogId);
        console.log('Comments response:', response.data);
        
        // Handle different possible response formats
        let commentsData = [];
        let count = 0;
        let totalPages = 1;
        
        if (response.data && response.data.data && response.data.data.comments) {
          commentsData = response.data.data.comments;
          count = response.data.data.count || commentsData.length;
          totalPages = response.data.data.totalPages || 1;
        } else if (response.data && Array.isArray(response.data)) {
          commentsData = response.data;
          count = commentsData.length;
        } else if (response.data && response.data.comments) {
          commentsData = response.data.comments;
          count = response.data.count || commentsData.length;
          totalPages = response.data.totalPages || 1;
        } else {
          console.warn('Unexpected comments response format:', response.data);
        }
        
        console.log('Processed comments data:', { commentsData, count, totalPages });
        setComments(commentsData);
        setCommentCount(count);
        setHasMore(totalPages > 1);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again later.');
        setLoading(false);
      }
    };
    
    if (blogId) {
      fetchComments();
    }
  }, [blogId]);
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Call API to submit comment
      const response = await api.comments.createComment(blogId, { 
        content: newComment.trim() 
      });
      
      console.log('Comment submitted:', response.data);
      
      // Extract the new comment from the response
      let newCommentData;
      if (response.data && response.data.data && response.data.data.comment) {
        newCommentData = response.data.data.comment;
      } else if (response.data && response.data.comment) {
        newCommentData = response.data.comment;
      } else {
        console.warn('Unexpected comment creation response format:', response.data);
        // Create a fallback comment object using current user data
        newCommentData = {
          _id: `temp-${Date.now()}`,
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
          likesCount: 0,
          user: currentUser
        };
      }
      
      // Add the new comment to the comments list
      setComments(prevComments => [newCommentData, ...prevComments]);
      setCommentCount(prevCount => prevCount + 1);
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLikeComment = async (commentId) => {
    if (!userIsAuthenticated) {
      alert('Please sign in to like comments');
      return;
    }
    
    try {
      // Optimistic UI update
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            const newLikesCount = comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1;
            return {
              ...comment,
              likesCount: newLikesCount,
              isLiked: !comment.isLiked,
            };
          }
          return comment;
        })
      );
      
      // Call API to toggle like
      const response = await api.comments.toggleLike(blogId, commentId);
      console.log('Comment like toggled:', response.data);
      
      // Extract updated comment data from the response
      let updatedComment;
      let liked = false;
      
      if (response.data && response.data.data) {
        updatedComment = response.data.data.comment;
        liked = response.data.data.liked;
      } else if (response.data) {
        updatedComment = response.data.comment || {};
        liked = response.data.liked;
      }
      
      if (updatedComment) {
        // Update with actual data from server
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId ? {
              ...comment,
              likesCount: updatedComment.likesCount || comment.likesCount,
              isLiked: liked
            } : comment
          )
        );
      }
    } catch (err) {
      console.error('Error toggling comment like:', err);
      
      // Revert optimistic update on error
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            const newLikesCount = comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1;
            return {
              ...comment,
              likesCount: newLikesCount,
              isLiked: !comment.isLiked,
            };
          }
          return comment;
        })
      );
    }
  };
  
  const loadMoreComments = async () => {
    try {
      const nextPage = page + 1;
      const response = await api.comments.getComments(blogId, { page: nextPage });
      console.log('Load more comments response:', response.data);
      
      // Handle different possible response formats
      let newComments = [];
      let hasMorePages = false;
      
      if (response.data && response.data.data && response.data.data.comments) {
        newComments = response.data.data.comments;
        hasMorePages = response.data.data.page < response.data.data.totalPages;
      } else if (response.data && Array.isArray(response.data)) {
        newComments = response.data;
        hasMorePages = newComments.length > 0;
      } else if (response.data && response.data.comments) {
        newComments = response.data.comments;
        hasMorePages = response.data.page < response.data.totalPages;
      }
      
      if (newComments.length > 0) {
        setComments(prevComments => [...prevComments, ...newComments]);
        setPage(nextPage);
        setHasMore(hasMorePages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more comments:', err);
      alert('Failed to load more comments. Please try again.');
    }
  };
  
  return (
    <div>
      <h3 className="text-xl font-bold font-serif mb-6">
        Comments ({commentCount})
      </h3>
      
      {/* Comment Form */}
      {userIsAuthenticated ? (
        <div className="mb-8">
          <form onSubmit={handleCommentSubmit}>
            <div className="mb-4">
              <textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="4"
                required
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-primary text-black rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 bg-gray-50 p-4 rounded-md text-center">
          <p className="text-gray-700 mb-2">
            Please sign in to join the discussion.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Sign in
            </Link>
            <span className="text-gray-500">or</span>
            <Link
              to="/signup"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Create an account
            </Link>
          </div>
        </div>
      )}
      
      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <img
                src={comment.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'}
                alt={comment.user?.name || 'User'}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-grow">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      to={`/authors/${comment.user?._id || ''}`}
                      className="font-medium text-text hover:text-primary"
                    >
                      {comment.user?.name || 'Anonymous'}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      className={`flex items-center gap-1 text-sm ${
                        comment.isLiked ? 'text-primary' : 'text-gray-500 hover:text-primary'
                      }`}
                      onClick={() => handleLikeComment(comment._id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={comment.isLiked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      <span>{comment.likesCount || 0}</span>
                    </button>
                    {userIsAuthenticated && (
                      <button className="text-sm text-gray-500 hover:text-primary">
                        Reply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && hasMore && (
        <div className="text-center mt-8">
          <button 
            className="text-primary hover:text-primary-dark font-medium"
            onClick={loadMoreComments}
          >
            Load More Comments
          </button>
        </div>
      )}
    </div>
  );
};

export default Comments; 