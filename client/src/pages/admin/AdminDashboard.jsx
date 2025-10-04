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
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
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
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Try /blogs/pending first, fallback to /blogs?status=pending if 404
        let pendingBlogsResponse;
        try {
          pendingBlogsResponse = await api.axios.get('/blogs/pending', { headers });
        } catch (err) {
          if (err.response && err.response.status === 404) {
            // Fallback to query param method
            pendingBlogsResponse = await api.axios.get('/blogs?status=pending', { headers });
          } else {
            throw err;
          }
        }
        console.log('Full pendingBlogsResponse:', pendingBlogsResponse.data);
        // Filter client-side to ensure only status === 'pending'
        const filteredPending = (pendingBlogsResponse.data.data.blogs || []).filter(blog => blog.status === 'pending');
        setPendingBlogs(filteredPending);
        // Debug: Log only the titles of the blogs returned for pending
        if (filteredPending && Array.isArray(filteredPending)) {
          console.log('Filtered Pending Blogs Titles:', filteredPending.map(blog => blog.title));
        } else {
          console.log('Filtered Pending Blogs is not an array:', filteredPending);
        }

        // Fetch published blogs
        const publishedBlogsResponse = await api.axios.get('/blogs?status=published', { headers });
        setPublishedBlogs(publishedBlogsResponse.data.data.blogs);

        // Fetch users
        const usersResponse = await api.axios.get('/users', { headers });
        setRegisteredUsers(usersResponse.data.data.users);

        // Calculate stats
        const activeUsers = usersResponse.data.data.users.filter(user => user.active).length;
        setStats({
          totalUsers: usersResponse.data.data.users.length,
          activeUsers,
          totalBlogs: publishedBlogsResponse.data.data.blogs.length,
          pendingBlogs: pendingBlogsResponse.data.data.blogs.length,
          totalViews: publishedBlogsResponse.data.data.blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
          totalLikes: publishedBlogsResponse.data.data.blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0),
          totalComments: publishedBlogsResponse.data.data.blogs.reduce((sum, blog) => sum + (blog.comments || 0), 0),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const handleBlockUser = async (id) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await api.axios.put(`/users/${id}`, {
        active: false
      }, { headers });
      
      // Update user status in the state
      setRegisteredUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === id ? { ...user, active: false } : user
        )
      );
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleActivateUser = async (id) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await api.axios.put(`/users/${id}`, {
        active: true
      }, { headers });
      
      // Update user status in the state
      setRegisteredUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === id ? { ...user, active: true } : user
        )
      );
    } catch (error) {
      console.error('Error activating user:', error);
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
                className={`${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('pending-blogs')}
                className={`${
                  activeTab === 'pending-blogs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Pending Blogs
              </button>
              <button
                onClick={() => setActiveTab('published-blogs')}
                className={`${
                  activeTab === 'published-blogs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Published Blogs
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                User Management
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold font-serif mb-6">Dashboard Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Users</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">{stats.totalUsers}</span>
                    <span className="text-sm text-gray-500">{stats.activeUsers} active</span>
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
          {activeTab === 'pending-blogs' && (
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
          {activeTab === 'published-blogs' && (
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
                          {blog.likes.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link 
                            to={`/blogs/${blog._id}`}
                            className="text-primary hover:text-primary-dark mr-3"
                          >
                            View
                          </Link>
                          <Link 
                            to={`/edit-blog/${blog._id}`}
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
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold font-serif mb-6">User Management</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blogs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registeredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.blogsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.active ? (
                            <button 
                              onClick={() => handleBlockUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Block
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivateUser(user.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 