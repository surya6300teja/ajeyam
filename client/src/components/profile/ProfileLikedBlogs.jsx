import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfileLikedBlogs = () => {
  const { currentUser } = useAuth();
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikedBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.blogs.getAllBlogs({ limit: 100 });
        const blogs = response.data.data.blogs || [];
        // Filter blogs liked by current user
        const liked = blogs.filter(blog =>
          Array.isArray(blog.likes) && blog.likes.includes(currentUser?._id)
        );
        setLikedBlogs(liked);
      } catch (err) {
        setError('Failed to load liked blogs.');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?._id) {
      fetchLikedBlogs();
    }
  }, [currentUser]);

  if (loading) {
    return <div className="text-center py-8 text-[#111]">Loading liked blogs...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-[#111]">{error}</div>;
  }
  if (!likedBlogs.length) {
    return <div className="text-center py-8 text-[#111]">You haven't liked any blogs yet.</div>;
  }

  return (
    <div className="space-y-6">
      {likedBlogs.map(blog => (
        <div key={blog._id} className="bg-[#FAF7F3]  rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:space-x-6">
          <div className="flex-1">
            <div className="text-lg font-semibold text-[#992E01] mb-1">{blog.title}</div>
            <div className="text-sm text-[#111] mb-2">by {blog.author?.name || 'Unknown Author'}</div>
            <div className="text-[#111] dark:text-[#111] line-clamp-2 mb-2">{blog.summary || blog.content?.slice(0, 120) + '...'}</div>
            <a
              href={`/blogs/${blog.slug || blog._id}`}
              className="inline-block mt-2 text-[#992E01] hover:underline text-sm font-medium"
            >
              Read More
            </a>
          </div>
          <div className="flex-shrink-0 mt-4 md:mt-0">
            <div className="text-xs text-[#111]">{new Date(blog.createdAt).toLocaleDateString()}</div>
            <div className="text-xs text-[#111]">{blog.likesCount || 0} Likes</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileLikedBlogs; 