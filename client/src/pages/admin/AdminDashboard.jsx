import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // State for storing API data
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAuthors: 0,
    totalSubscribers: 0,
    totalBlogs: 0,
    pendingBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  // Protect admin route
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch all data in parallel for speed
        const [pendingBlogsResponse, publishedBlogsResponse, authorsResponse, subscribersResponse] = await Promise.all([
          api.axios.get('/blogs/pending?limit=20', { headers }).catch(err => {
            if (err.response?.status === 404) {
              return api.axios.get('/blogs?status=pending&limit=20', { headers });
            }
            throw err;
          }),
          api.axios.get('/blogs?status=published&limit=20', { headers }),
          api.users.getAuthors(),
          api.subscribers.list(),
        ]);

        const filteredPending = (pendingBlogsResponse.data.data.blogs || []).filter(blog => blog.status === 'pending');
        const authorsList = authorsResponse.data.data.authors || [];
        const subscribersList = subscribersResponse.data.data.subscribers || [];
        setPendingBlogs(filteredPending);
        setPublishedBlogs(publishedBlogsResponse.data.data.blogs || []);
        setAuthors(authorsList);
        setSubscribers(subscribersList);

        // Calculate stats
        const blogs = publishedBlogsResponse.data.data.blogs || [];
        setStats({
          totalAuthors: authorsList.length,
          totalSubscribers: subscribersList.length,
          totalBlogs: blogs.length,
          pendingBlogs: filteredPending.length,
          totalViews: blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
          totalLikes: blogs.reduce((sum, blog) => sum + (blog.likesCount || 0), 0),
          totalComments: blogs.reduce((sum, blog) => sum + (blog.commentsCount || 0), 0),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin, token]);

  // Admin action handlers with API calls
  const handleApproveBlog = async (id) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await api.axios.put(`/blogs/${id}/approve`, {}, { headers });

      // Remove the approved blog from pending blogs
      setPendingBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== id));

      // Refetch published blogs
      const publishedResponse = await api.axios.get('/blogs?status=published', { headers });
      setPublishedBlogs(publishedResponse.data.data.blogs);
    } catch (error) {
      console.error('Error approving blog:', error);
    }
  };

  const handleRejectBlog = async (id) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await api.axios.put(`/blogs/${id}/reject`, {
        rejectionReason: 'Content does not meet our guidelines'
      }, { headers });

      // Remove the rejected blog from pending blogs
      setPendingBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== id));
    } catch (error) {
      console.error('Error rejecting blog:', error);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await api.axios.patch(`/blogs/${id}/featured`, {}, { headers });
      const updatedBlog = response.data.data.blog;

      setPublishedBlogs(prevBlogs =>
        prevBlogs.map(blog =>
          blog._id === id ? { ...blog, isFeatured: updatedBlog.isFeatured } : blog
        )
      );
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const handleDeleteBlog = async (id) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await api.axios.delete(`/blogs/${id}`, { headers });

      // Remove the deleted blog from published blogs
      setPublishedBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== id));
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  return (
    <div className="py-10 bg-background">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-text mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage blog content, users, and site settings.
          </p>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('pending-blogs')}
                className={`${activeTab === 'pending-blogs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Pending Blogs
              </button>
              <button
                onClick={() => setActiveTab('published-blogs')}
                className={`${activeTab === 'published-blogs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Published Blogs
              </button>
              <button
                onClick={() => setActiveTab('authors')}
                className={`${activeTab === 'authors'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Authors
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`${activeTab === 'subscribers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Subscribers
              </button>
              <Link
                to="/admin/book-reviews"
                className="ml-auto whitespace-nowrap py-4 px-6 text-sm font-medium text-primary hover:text-primary-dark"
              >
                Book Reviews →
              </Link>
              <Link
                to="/admin/categories"
                className="whitespace-nowrap py-4 px-6 text-sm font-medium text-primary hover:text-primary-dark"
              >
                Categories →
              </Link>
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Loading State */}
          {loading && (
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-50 p-6 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); }}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {!loading && !error && activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold font-serif mb-6">Dashboard Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Community</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">{stats.totalAuthors}</span>
                    <span className="text-sm text-gray-500">authors · {stats.totalSubscribers} subscribers</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Blogs</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">{stats.totalBlogs}</span>
                    <span className="text-sm text-gray-500">{stats.pendingBlogs} pending</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Engagement</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">views</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="border rounded-md">
                  <div className="bg-gray-50 p-4 border-b">
                    <h4 className="font-medium">Latest Blogs</h4>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {publishedBlogs.slice(0, 3).map((blog) => (
                      <li key={blog._id} className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <Link to={`/blogs/${blog._id}`} className="font-medium hover:text-primary">
                              {blog.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                              by {blog.author?.name || 'Unknown Author'}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Not published'}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Pending Blogs Tab */}
          {!loading && !error && activeTab === 'pending-blogs' && (
            <div>
              <h2 className="text-xl font-bold font-serif mb-6">Pending Blog Approvals</h2>

              {pendingBlogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingBlogs.map((blog) => (
                        <tr key={blog._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{blog.title}</div>
                            <div className="text-sm text-gray-500">
                              {blog.summary?.substring(0, 60) || blog.content?.substring(0, 60)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {blog.author?.name || 'Unknown Author'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'No date'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {blog.category?.name || blog.category || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {blog.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link
                              to={`/blogs/${blog._id}`}
                              className="text-primary hover:text-primary-dark mr-3"
                            >
                              View
                            </Link>
                          </td>


                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleApproveBlog(blog._id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectBlog(blog._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No pending blogs to approve.</p>
              )}
            </div>
          )}

          {/* Published Blogs Tab */}
          {!loading && !error && activeTab === 'published-blogs' && (
            <div>
              <h2 className="text-xl font-bold font-serif mb-6">Published Blogs</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {publishedBlogs.map((blog) => (
                      <tr key={blog._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{blog.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.author?.name || 'Unknown Author'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Not published'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.category?.name || blog.category || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.views || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {blog.likesCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleToggleFeatured(blog._id)}
                            className={`text-lg ${blog.isFeatured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'} transition-colors`}
                            title={blog.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            {blog.isFeatured ? '★' : '☆'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/blogs/${blog._id}`}
                            className="text-primary hover:text-primary-dark mr-3"
                          >
                            View
                          </Link>
                          <Link
                            to={`/create-blog?edit=${blog._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteBlog(blog._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {!loading && !error && activeTab === 'authors' && (
            <div>
              <h2 className="text-xl font-bold font-serif mb-6">
                Authors <span className="text-sm font-normal text-gray-500">({authors.length} contributors)</span>
              </h2>
              {authors.length === 0 ? (
                <p className="text-gray-500">No authors yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {authors.map((author) => (
                        <tr key={author._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img src={author.avatar || '/logo.png'} alt={author.name} className="w-8 h-8 rounded-full object-cover bg-amber-50" />
                              <Link to={`/authors/${author._id}`} className="font-medium text-gray-900 hover:text-amber-800">{author.name}</Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{author.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{author.publishedBlogs}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{author.totalBlogs}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{author.createdAt ? new Date(author.createdAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && !error && activeTab === 'subscribers' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-serif">
                  Subscribers <span className="text-sm font-normal text-gray-500">({subscribers.length})</span>
                </h2>
                {subscribers.length > 0 && (
                  <button
                    onClick={() => {
                      const csv = 'email,subscribed_at\n' + subscribers.map(s => `${s.email},${s.createdAt || ''}`).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = 'ajeyam-subscribers.csv';
                      a.click();
                    }}
                    className="text-sm px-4 py-2 border border-amber-900 text-amber-900 rounded-md hover:bg-amber-50"
                  >
                    Export CSV
                  </button>
                )}
              </div>
              {subscribers.length === 0 ? (
                <p className="text-gray-500">No subscribers yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscribers.map((sub) => (
                        <tr key={sub._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 