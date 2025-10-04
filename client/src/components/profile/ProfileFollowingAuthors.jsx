import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfileFollowingAuthors = () => {
  const { currentUser } = useAuth();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowingAuthors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.users.getFollowingAuthors();
        const following = response.data.data.following || [];
        setAuthors(following);
      } catch (err) {
        setError('Failed to load following authors.');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?._id) {
      fetchFollowingAuthors();
    }
  }, [currentUser]);

  const handleUnfollow = async (authorId) => {
    try {
      await api.users.toggleFollowAuthor(authorId);
      setAuthors((prev) => prev.filter((a) => a._id !== authorId));
    } catch (err) {
      alert('Failed to unfollow author. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading following authors...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  if (!authors.length) {
    return <div className="text-center py-8 text-[#111]">You are not following any authors yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {authors.map(author => (
        <div key={author._id} className="bg-[#FAF7F3] dark:bg-[#FAF7F3] rounded-lg shadow p-4 flex items-center space-x-4">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-14 h-14 rounded-full object-cover bg-[#FAF7F3] dark:bg-[#FAF7F3]"
          />
          <div className="flex-1">
            <div className="text-lg font-semibold text-[#992E01]">{author.name}</div>
            <div className="text-sm text-[#111]">{author.bio || <span className="italic text-[#111]">No bio</span>}</div>
          </div>
          <button
            className="px-3 py-1 bg-[#992E01] text-white rounded hover:bg-[#7a2300] transition text-sm"
            onClick={() => handleUnfollow(author._id)}
          >
            Unfollow
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProfileFollowingAuthors; 