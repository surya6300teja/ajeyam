import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import '../styles/blog.css';
import { useAuth } from '../context/AuthContext';

// const defaultCategories = [
//   'All Categories',
//   'Ancient India',
//   'Medieval India',
//   'Colonial Era',
//   'Independence Movement',
//   'Modern History',
// ];

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('for-you');
  const { currentUser } = useAuth();
  const [followingAuthors, setFollowingAuthors] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingError, setFollowingError] = useState(null);
  const [categoryTabs, setCategoryTabs] = useState(['All Categories']); // start with 'All Categories'
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch blogs
        const blogsResponse = await api.axios.get('/blogs');
        const fetchedBlogs = blogsResponse.data.data.blogs || [];
        setBlogs(fetchedBlogs);

        // Fetch categories
        const categoriesResponse = await api.categories.getAllCategories();
        let fetchedCategories = [];
        if (categoriesResponse.data && categoriesResponse.data.data) {
          fetchedCategories = categoriesResponse.data.data.categories.map(c => c.name);
        } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          fetchedCategories = categoriesResponse.data.map(c => c.name);
        } else if (categoriesResponse.data && categoriesResponse.data.categories) {
          fetchedCategories = categoriesResponse.data.categories.map(c => c.name);
        }

        // Merge with "All Categories" and set tabs
        setCategoryTabs(['All Categories', ...fetchedCategories]);

      } catch (err) {
        console.error('Failed to fetch blogs or categories:', err);
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Parse category from query params and preselect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
      setActiveTab(cat.toLowerCase().replace(/\s+/g, '-'));
      // Add it temporarily if not in tabs
      setCategoryTabs((prev) =>
        prev.includes(cat) ? prev : ['All Categories', cat, ...prev.filter(c => c !== 'All Categories')]
      );
    }
  }, [location.search]);

  // Following tab logic
  useEffect(() => {
    if (activeTab === 'following' && currentUser?._id) {
      setFollowingLoading(true);
      setFollowingError(null);
      api.users.getFollowingAuthors()
        .then(res => setFollowingAuthors(res.data.data.following || []))
        .catch(() => setFollowingError('Failed to load following authors.'))
        .finally(() => setFollowingLoading(false));
    }
  }, [activeTab, currentUser]);

  // Filter blogs based on search and category
  const filteredBlogs = blogs
    .filter(blog => {
      if (activeTab === 'following') {
        if (followingLoading || followingError) return false;
        if (!followingAuthors.length) return false;
        return followingAuthors.some(author => author._id === blog.author?._id);
      }
      const blogCategoryName = typeof blog.category === 'string' ? blog.category : (blog.category?.name || '');
      return (
        (selectedCategory === 'All Categories' || blogCategoryName.toLowerCase() === selectedCategory.toLowerCase()) &&
        (blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (blog.summary || '').toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-amber-50/40 via-white to-amber-50/40">
        <div className="text-center">
          <div className="typewriter-container">
            <div className="typewriter">
              <div className="typewriter-text">ajeyam.in</div>
            </div>
            <div className="typewriter-cursor"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12">Error: {error}</div>;
  }

  if (activeTab === 'following' && followingLoading) {
    return <div className="text-center py-12">Loading blogs from authors you follow...</div>;
  }
  if (activeTab === 'following' && followingError) {
    return <div className="text-center py-12 text-red-500">{followingError}</div>;
  }
  if (activeTab === 'following' && !followingAuthors.length) {
    return <div className="text-center py-12">You are not following any authors yet.</div>;
  }

  // Function to render a single blog item
  const renderBlogItem = (blog) => (
    <article key={blog._id} className="flex flex-col md:flex-row gap-4 md:gap-8 py-6 border-b border-gray-100">
      {/* Mobile author info (shown only on mobile) */}
      <div className="flex items-center mb-3 md:hidden">
        <div className="w-6 h-6 bg-amber-700 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden">
          {blog.author?.avatar ? (
            <img 
              src={blog.author.avatar} 
              alt={blog.author?.name || 'Author'} 
              className="w-full h-full object-cover"
            />
          ) : (
            blog.author?.name?.charAt(0) || 'A'
          )}
        </div>
        <span className="text-sm font-medium">
          {blog.author?.name || 'Unknown Author'}
        </span>
        <span className="mx-1 text-gray-400">·</span>
        <span className="text-sm text-gray-500">
          {new Date(blog.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>
      
      {/* Content and image in a consistent layout */}
      <div className="flex w-full gap-4">
        <div className="flex-1">
          {/* Desktop author info (hidden on mobile) */}
          <div className="hidden md:flex items-center mb-2">
            <img 
              src={blog.author?.avatar || 'https://via.placeholder.com/40'} 
              alt={blog.author?.name || 'Author'} 
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm font-medium">
              {blog.author?.name || 'Unknown Author'}
            </span>
            {blog.category && (
              <>
                <span className="mx-1 text-gray-400">·</span>
                <span className="text-sm text-gray-500">
                  {typeof blog.category === 'string' ? blog.category : blog.category.name}
                </span>
              </>
            )}
          </div>
          
          <Link to={`/blogs/${blog.slug || blog._id}`} className="block group">
            <h2 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-amber-900 transition-colors line-clamp-3 md:line-clamp-2">
              {blog.title}
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-3 line-clamp-2">
              {blog.summary}
            </p>
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              {/* Date shown on desktop, hidden on mobile (since moved to top) */}
              <span className="hidden md:inline">{new Date(blog.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}</span>
              <span className="hidden md:inline mx-1">·</span>
              <span>{blog.readTime || 5} min read</span>
              {/* Show category on mobile, tags on desktop */}
              <div className="md:hidden">
                {blog.category && (
                  <>
                    <span className="mx-1">·</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                      {typeof blog.category === 'string' ? blog.category : blog.category.name}
                    </span>
                  </>
                )}
              </div>
              <div className="hidden md:block">
                {blog.tags && blog.tags.length > 0 && (
                  <>
                    <span className="mx-1">·</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      {blog.tags[0]}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {blog.coverImage && (
          <div className="w-20 h-20 md:w-56 md:h-32 rounded-sm md:rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={blog.coverImage} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </article>
  );

  // Function to render a trending item
  const renderTrendingItem = (blog, index) => (
    <div key={blog._id} className="flex items-start gap-3 md:gap-4">
      <span className="text-2xl md:text-3xl font-bold text-gray-200">0{index + 1}</span>
      <div className="flex-1">
        <div className="flex items-center mb-2">
          {/* Mobile avatar with fallback */}
          <div className="w-5 h-5 bg-amber-700 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden md:hidden">
            {blog.author?.avatar ? (
              <img 
                src={blog.author.avatar} 
                alt={blog.author?.name || 'Author'} 
                className="w-full h-full object-cover"
              />
            ) : (
              blog.author?.name?.charAt(0) || 'A'
            )}
          </div>
          {/* Desktop avatar */}
          <img 
            src={blog.author?.avatar || 'https://via.placeholder.com/40'} 
            alt={blog.author?.name || 'Author'} 
            className="hidden md:block w-5 h-5 rounded-full mr-2"
          />
          <span className="text-xs font-medium">
            {blog.author?.name || 'Unknown Author'}
          </span>
        </div>
        <Link to={`/blogs/${blog.slug || blog._id}`} className="block group">
          <h3 className="font-bold text-gray-900 group-hover:text-amber-900 transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>
        <div className="text-xs text-gray-500 mt-1">
          <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}</span>
          <span className="mx-1">·</span>
          <span>{blog.readTime || 5} min read</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF7F3' }}>
      {/* Top Navigation
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-serif font-bold text-amber-900">
              Ajeyam.in
            </Link>
          </div>
        </div>
      </header> */}

      <main className="max-w-3xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="w-full h-10 sm:h-12 px-4 sm:px-5 pr-10 rounded-full bg-gray-100 border border-gray-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm"
            />
            <div className="absolute right-3 top-2.5 sm:top-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6 sm:mb-8 -mx-2 sm:-mx-4 md:mx-0 px-2 sm:px-4 md:px-0">
          <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap py-2 gap-3 sm:gap-4 md:gap-8">
            <button 
              onClick={() => {
                setActiveTab('for-you');
                setSelectedCategory('All Categories');
              }}
              className={`px-1 py-2 font-medium text-sm ${activeTab === 'for-you' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'}`}
            >
              For you
            </button>
            <button 
              onClick={() => {
                setActiveTab('following');
                setSelectedCategory('All Categories');
              }}
              className={`px-1 py-2 font-medium text-sm ${activeTab === 'following' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'}`}
            >
              Following
            </button>
            {categoryTabs.map((category, index) => (
              <button 
                key={`${category}-${index}`}
                onClick={() => {
                  setSelectedCategory(category);
                  setActiveTab(category.toLowerCase().replace(/\s+/g, '-'));
                }}
                className={`px-1 py-2 font-medium text-sm ${activeTab === category.toLowerCase().replace(/\s+/g, '-') ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Section */}
        {(activeTab === 'for-you' || activeTab === 'following') && (
          <div className="mb-8 sm:mb-10">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="24" height="14" viewBox="0 0 24 14" id="trending">
                    <g id="Page-1" fill="none" fill-rule="evenodd" stroke="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1">
                      <g id="Artboard" stroke="#000" stroke-width="2" transform="translate(-1753 -2066)">
                        <g id="trending-up" transform="translate(1754 2067)">
                          <path id="Shape" d="M22 0l-9.5 9.5-5-5L0 12"></path>
                          <path id="Shape" d="M16 0h6v6"></path>
                        </g>
                      </g>
                    </g>
              </svg>
              Trending on ajeyam
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {blogs.slice(0, 4).map((blog, index) => renderTrendingItem(blog, index))}
            </div>
          </div>
        )}
          
        {/* All Articles */}
        <div className="space-y-4 md:space-y-8">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map(blog => renderBlogItem(blog))
          ) : (
            <div className="text-center py-8 sm:py-12 bg-white/50 rounded-lg">
              <h3 className="text-base sm:text-lg font-medium mb-1">No Historical Records Found</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlogList;
