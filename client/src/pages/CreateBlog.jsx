import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BlogEditor from '../components/blog/BlogEditor';

const DRAFT_STORAGE_KEY = 'blog_draft';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit'); // null = create mode, string = edit mode
  const { isAuthenticated, currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBlog, setEditBlog] = useState(null); // holds blog data when in edit mode

  // Fetch categories and (if editing) the existing blog
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const catRes = await api.categories.getAllCategories();
        const fetchedCategories = catRes.data.data.categories || [];

        if (fetchedCategories.length === 0) {
          try {
            const mockCategory = {
              name: 'Ancient India',
              description: 'History of ancient India from prehistoric times to the medieval period',
              imageUrl: 'https://example.com/ancient-india.jpg',
              isActive: true
            };
            const createResponse = await api.categories.createCategory(mockCategory);
            const newResponse = await api.categories.getAllCategories();
            setCategories(newResponse.data.data.categories || []);
          } catch (createError) {
            setCategories([]);
          }
        } else {
          setCategories(fetchedCategories);
        }

        // If edit mode, fetch the existing blog
        if (editId) {
          const blogRes = await api.blogs.getBlog(editId);
          const blog = blogRes.data.data.blog;
          setEditBlog(blog);
        }
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [editId]);

  const handleSave = async (blogData) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (!isAuthenticated || !currentUser) {
        throw new Error('You must be logged in to create a blog post');
      }

      if (!blogData.title || !blogData.content || !blogData.excerpt || !blogData.featuredImage || !blogData.category) {
        throw new Error('Please fill in all required fields');
      }

      const blogPayload = {
        title: blogData.title,
        content: blogData.content,
        summary: blogData.excerpt,
        coverImage: blogData.featuredImage,
        tags: blogData.tags,
        author: currentUser._id,
        status: 'pending',
      };

      // Resolve category
      if (blogData.category && categories.length > 0) {
        const selectedCategory = categories.find(cat =>
          cat._id === blogData.category ||
          cat._id.toString() === blogData.category
        );
        if (selectedCategory) {
          blogPayload.category = selectedCategory._id;
        } else if (categories.length > 0) {
          blogPayload.category = categories[0]._id;
        }
      } else if (categories.length > 0) {
        blogPayload.category = categories[0]._id;
      } else {
        throw new Error('Please select a valid category');
      }

      let response;
      if (editId) {
        // UPDATE existing blog
        response = await api.blogs.updateBlog(editId, blogPayload);
      } else {
        // CREATE new blog
        response = await api.blogs.createBlog(blogPayload);
      }

      setIsSubmitting(false);
      try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch { }

      const blog = response.data?.data?.blog;
      if (blog) {
        navigate(`/blogs/${blog.slug || blog._id}`);
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      if (error.response) {
        setErrorMessage(error.response.data?.message || 'Failed to save blog. Please try again.');
      } else if (error.request) {
        setErrorMessage('Network error. Please check your connection and try again.');
      } else {
        setErrorMessage(error.message || 'An error occurred while saving your blog. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="space-y-3 mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
            {editId ? 'Edit Blog' : 'Create New Blog'}
          </h1>
          <p className="text-gray-600 text-base">
            {editId ? 'Update your blog post below.' : 'Share your knowledge and insights about Indian history.'}
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-8 rounded-lg bg-red-50 p-4 border border-red-200" role="alert" aria-live="assertive">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Authentication Check */}
        {!isAuthenticated ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                You need to be logged in to create a blog post.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors"
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Sign up
                </a>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12" role="status" aria-live="polite">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" aria-label="Loading"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <BlogEditor
              onSave={handleSave}
              errorMessage={errorMessage}
              categories={categories.map(cat => ({
                id: cat._id,
                name: cat.name
              }))}
              initialData={editBlog ? {
                title: editBlog.title || '',
                content: editBlog.content || '',
                excerpt: editBlog.summary || editBlog.excerpt || '',
                featuredImage: editBlog.coverImage || '',
                category: editBlog.category?._id || editBlog.category || '',
                tags: Array.isArray(editBlog.tags) ? editBlog.tags.join(', ') : (editBlog.tags || ''),
              } : null}
            />
          </div>
        )}

        {/* Submission Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50" role="status" aria-live="polite">
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-sm w-full mx-4">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium text-gray-900">
                  {editId ? 'Updating your blog...' : 'Publishing your blog...'}
                </p>
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" aria-label="Loading"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateBlog;