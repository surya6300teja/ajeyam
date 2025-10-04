import axios from 'axios';

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

console.log('API URL configured as:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and refresh tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
const authAPI = {
  register: (userData) => {
    // Validate all required fields are present
    if (!userData || !userData.name || !userData.email || !userData.password || !userData.passwordConfirm) {
      return Promise.reject(new Error('Missing required fields for registration'));
    }
    // Ensure data is formatted correctly
    const requestData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      passwordConfirm: userData.passwordConfirm
    };
    // Use a timeout of 30 seconds for registration requests
    return api.post('/auth/register', requestData, { timeout: 30000 })
      .then(response => {
        return response;
      })
      .catch(error => {
        // Network or connection error
        if (error.code === 'ECONNABORTED') {
          throw new Error('Connection timed out. Please check your internet connection and try again.');
        }
        // Server returned an error
        if (error.response) {
          throw error;
        }
        // Network error (no response)
        if (error.request) {
          throw new Error('No response from server. Please check your internet connection and try again.');
        }
        // Other errors
        throw error;
      });
  },
  login: (credentials) => {
    console.log('Login attempt with email:', credentials.email);
    return api.post('/auth/login', credentials);
  },
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, passwords) => api.post(`/auth/reset-password/${token}`, passwords),
  getCurrentUser: () => api.get('/auth/me'),
};

// Blog API calls
const blogAPI = {
  getAllBlogs: (params) => api.get('/blogs', { params }),
  getFeaturedBlogs: (limit = 3) => {
    console.log('Calling getFeaturedBlogs with limit:', limit);
    return api.get('/blogs/featured', { 
      params: { limit }
    });
  },
  getBlog: (identifier) => api.get(`/blogs/${identifier}`),
  getBlogBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
  getRelatedBlogs: (id, limit = 3) => api.get(`/blogs/${id}/related`, { params: { limit } }),
  createBlog: (blogData) => api.post('/blogs', blogData),
  updateBlog: (id, blogData) => api.patch(`/blogs/${id}`, blogData),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  toggleLike: (id) => api.post(`/blogs/${id}/like`),
  getBlogsByCategory: (categoryId, params) => api.get(`/categories/${categoryId}/blogs`, { params }),
  getBlogsByAuthor: (authorId, params) => api.get(`/users/${authorId}/blogs`, { params }),
  getBlogsByTag: (tag, params) => api.get(`/blogs/tags/${tag}`, { params }),
  searchBlogs: (query, params) => api.get(`/blogs/search`, { params: { query, ...params } }),
};

const bookReviewAPI = {
  create: (data) => api.post('/reviews', data),
  getAll: (params) => api.get('/reviews', { params }),
  getPending: () => api.get('/reviews/pending'),
  approve: (id) => api.put(`/reviews/${id}/approve`),
  reject: (id, reason) => api.put(`/reviews/${id}/reject`, { rejectionReason: reason }),
  delete: (id) => api.delete(`/reviews/${id}`),
  getStats: () => api.get('/reviews/stats'),
  update: (id, data) => api.patch(`/reviews/${id}`, data),
};

// Comment API calls
const commentAPI = {
  getComments: (blogId, params) => api.get(`/blogs/${blogId}/comments`, { params }),
  getComment: (blogId, commentId) => api.get(`/blogs/${blogId}/comments/${commentId}`),
  createComment: (blogId, commentData) => api.post(`/blogs/${blogId}/comments`, commentData),
  updateComment: (blogId, commentId, commentData) => api.patch(`/blogs/${blogId}/comments/${commentId}`, commentData),
  deleteComment: (blogId, commentId) => api.delete(`/blogs/${blogId}/comments/${commentId}`),
  toggleLike: (blogId, commentId) => api.post(`/blogs/${blogId}/comments/${commentId}/like`),
  getReplies: (blogId, commentId, params) => api.get(`/blogs/${blogId}/comments/${commentId}/replies`, { params }),
  createReply: (blogId, commentId, replyData) => api.post(`/blogs/${blogId}/comments/${commentId}/replies`, replyData),
};

// Category API calls
const categoryAPI = {
  getAllCategories: (params) => api.get('/categories', { params }),
  getMainCategoriesWithSubs: () => api.get('/categories/main-with-subs'),
  getCategory: (identifier) => api.get(`/categories/${identifier}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.patch(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// User API calls
const userAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  updateProfile: (userData) => api.patch('/users/update-me', userData),
  updatePassword: (passwordData) => api.patch('/users/update-password', passwordData),
  deleteAccount: () => api.delete('/users/delete-me'),
  getAllUsers: () => api.get('/users'), // Admin only
  updateUser: (id, userData) => api.patch(`/users/${id}`, userData), // Admin only
  deleteUser: (id) => api.delete(`/users/${id}`), // Admin only
  // Save/unsave a blog
  toggleSaveBlog: (blogId) => api.post(`/users/save-blog/${blogId}`),
  // Follow/unfollow an author
  toggleFollowAuthor: (userId) => api.post(`/users/follow/${userId}`),
  // Get saved blogs
  getSavedBlogs: () => api.get('/users/saved-blogs'),
  // Get following authors
  getFollowingAuthors: () => api.get('/users/following'),
};

// Health check
const systemAPI = {
  healthCheck: () => api.get('/health'),
};

// Export the API
export default {
  auth: authAPI,
  blogs: blogAPI,
  comments: commentAPI,
  categories: categoryAPI,
  users: userAPI,
  system: systemAPI,
  bookReviews: bookReviewAPI,
  // Direct access to the axios instance
  axios: api,
}; 