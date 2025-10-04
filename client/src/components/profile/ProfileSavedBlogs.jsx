import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfileSavedBlogs = () => {
  const { currentUser } = useAuth();
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.users.getSavedBlogs();
        const blogs = response.data.data.savedBlogs || [];
        setSavedBlogs(blogs);
      } catch (err) {
        setError('Failed to load saved blogs.');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?._id) {
      fetchSavedBlogs();
    }
  }, [currentUser]);

  if (loading) {
    return <div className="text-center py-8">Loading saved blogs...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  if (!savedBlogs.length) {
    return <div className="text-center py-8 text-[#111]">You haven't saved any blogs yet.</div>;
  }

  return (
    <div className="space-y-6">
      {savedBlogs.map(blog => (
        <div key={blog._id} className="bg-[#FAF7F3] dark:bg-[#FAF7F3] rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:space-x-6">
          <div className="flex-1">
            <div className="text-lg font-semibold text-[#992E01] mb-1">{blog.title}</div>
            <div className="text-sm text-[#111] mb-2">by {blog.author?.name || 'Unknown Author'}</div>
            <div className="text-[#111] line-clamp-2 mb-2">{blog.summary || blog.content?.slice(0, 120) + '...'}</div>
            <a
              href={`/blogs/${blog._id}`}
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

export default ProfileSavedBlogs; 