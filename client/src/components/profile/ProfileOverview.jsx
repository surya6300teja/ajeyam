import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfileOverview = () => {
  const { currentUser, updateProfile, loading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile(form);
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  if (!currentUser) {
    return <div className="text-center py-8 text-red-500">User not found.</div>;
  }

  return (
    <div className="bg-[#FAF7F3] text-gray-800 min-h-screen p-6">
      <div className="flex items-center space-x-6 mb-6">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-24 h-24 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
        />
        <div>
          <div className="text-xl font-bold">{currentUser.name}</div>
          <div className="text-sm text-gray-500">{currentUser.email}</div>
          <div className="text-sm mt-2">{currentUser.bio || <span className="italic text-gray-400">No bio</span>}</div>
        </div>
      </div>
      {editMode ? (
        <form className="space-y-4 mt-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
              rows={3}
              maxLength={250}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Avatar URL</label>
            <input
              type="text"
              name="avatar"
              value={form.avatar}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
            />
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Or upload from your computer</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#F0ECE6] file:text-[#992E01] hover:file:bg-[#E0DAD1]"
              />
            </div>
            {form.avatar && (
              <div className="mt-2">
                <img
                  src={form.avatar}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-full object-cover border"
                />
              </div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#A06C4E] text-white rounded hover:bg-[#8C5F46] transition disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-[#E0DAD1] text-[#5A4A3F] rounded hover:bg-[#D6CFC7] transition"
              onClick={() => setEditMode(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-[#A06C4E] text-white rounded hover:bg-[#8C5F46] transition"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-[#F0ECE6] rounded p-4 text-center">
          <div className="text-2xl font-bold">{currentUser.blogsCount || 0}</div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Blogs</div>
        </div>
        <div className="bg-[#F0ECE6] rounded p-4 text-center">
          <div className="text-2xl font-bold">{new Date(currentUser.createdAt).toLocaleDateString()}</div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Joined</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview; 