import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock } from 'react-feather';

const Home = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugging, setDebugging] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let blogsData = [];
      let categoriesData = [];
      
      try {
        // Try the debug route first if debugging is enabled
        if (debugging) {
          console.log('Using debug route for featured blogs');
          const debugResponse = await api.axios.get('/blogs/debug-featured');
          console.log('Debug featured blogs response:', debugResponse);
          
          if (debugResponse.data && debugResponse.data.data) {
            blogsData = debugResponse.data.data;
            console.log('Extracted debug data:', blogsData);
          }
        } else {
          // Use the normal featured blogs endpoint
          console.log('Using normal featured blogs route');
          const blogsResponse = await api.blogs.getFeaturedBlogs(3);
          console.log('Featured blogs response:', blogsResponse);
          
          // Check if the response data structure is what we expect
          if (blogsResponse.data && blogsResponse.data.data) {
            blogsData = blogsResponse.data.data.blogs || [];
            console.log('Extracted blogs data:', blogsData);
          } else if (blogsResponse.data && Array.isArray(blogsResponse.data)) {
            // Alternative API response format
            blogsData = blogsResponse.data;
            console.log('Alternative format - blogs array:', blogsData);
          } else if (blogsResponse.data && blogsResponse.data.blogs) {
            // Another possible format
            blogsData = blogsResponse.data.blogs;
            console.log('Alternative format - blogs direct property:', blogsData);
          } else {
            console.warn('Unexpected blog response format:', blogsResponse.data);
          }
        }
        
        if (!blogsData || blogsData.length === 0) {
          console.warn('No blogs found in the response');
        }
      } catch (blogsError) {
        console.error('Error fetching blogs:', blogsError);
        setError('Failed to load featured blogs. Please try again later.');
      }
      
      try {
        // Fetch categories
        const categoriesResponse = await api.categories.getAllCategories();
        console.log('Categories response:', categoriesResponse);
        
        // Similar checks for categories response format
        if (categoriesResponse.data && categoriesResponse.data.data) {
          categoriesData = categoriesResponse.data.data.categories || [];
        } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          categoriesData = categoriesResponse.data;
        } else if (categoriesResponse.data && categoriesResponse.data.categories) {
          categoriesData = categoriesResponse.data.categories;
        } else {
          console.warn('Unexpected categories response format:', categoriesResponse.data);
        }
      } catch (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        if (!error) {
          setError('Failed to load categories. Please try again later.');
        }
      }
      
      // Set the data in state
      console.log('Setting featuredBlogs state with:', blogsData);
      setFeaturedBlogs(blogsData);
      setCategories(categoriesData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching home page data:', err);
      setError('Failed to load data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Debug output for development
  console.log('Current featuredBlogs state:', featuredBlogs);
  console.log('Current categories state:', categories);

  const handleRefresh = () => {
    fetchData();
  };

  const toggleDebugMode = () => {
    setDebugging(!debugging);
    // Fetch data again with new mode
    setTimeout(fetchData, 100);
  };

  const goToBlogsWithCategory = (category) => {
    if (!category) return;
    navigate(`/blogs?category=${encodeURIComponent(category.name)}${category._id ? `&id=${category._id}` : ''}`);
  };

  return (
    <div className="bg-[#FBF7F4]">
      {/* Hero Section - Reimagined */}
      <section className="min-h-screen relative overflow-hidden flex flex-col justify-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('/patterns/kolam.svg')] opacity-5 pattern-rotate"></div>
        <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-10 sm:pb-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 sm:mb-8">
              <span className="text-primary font-devanagari text-lg sm:text-2xl">||राष्ट्राय स्वाहा||</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-7xl lg:text-6xl font-serif mb-6 sm:mb-8 bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent leading-tight">
              CIVILIZATION. INVINCIBILITY. RESURGENCE.
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-12 font-light leading-relaxed">
              Where forgotten stories emerge from the depths of time, 
              weaving together the tapestry of our heritage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link 
                to="/blogs" 
                className="group relative rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg overflow-hidden"
              >
                <span className="relative z-10 text-amber-900 font-medium group-hover:text-white transition-colors duration-100">
                  Begin Your Journey:
                </span>
                <div className="absolute inset-0 bg-amber-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
              <span className="text-gray-400">or</span>
              <Link 
                to="/create-blog" 
                className="text-gray-600 hover:text-amber-900 transition-colors duration-300 text-base sm:text-lg"
              >
                Reveal Untold Stories→
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories Section - Clean & Minimal */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 sm:mb-16 gap-4 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl font-serif text-amber-900">Featured Chronicles</h2>
            <Link to="/blogs" className="text-amber-900 hover:text-amber-700 transition-colors text-base sm:text-lg">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16 sm:py-20">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-amber-900/20 border-l-amber-900 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : featuredBlogs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No featured blogs available at the moment.</p>
              <p className="text-sm text-gray-400 mt-2">Please check the database or API configuration.</p>
              <button 
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
              {featuredBlogs.map((blog) => (
                <article 
                  key={blog._id || `blog-${Math.random()}`}
                  className="group space-y-4"
                >
                  <Link 
                    to={`/blogs/${blog.slug || blog._id}`}
                    className="block aspect-[16/10] overflow-hidden rounded-lg"
                  >
                    <img 
                      src={blog.coverImage || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=3000'} 
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="space-y-2 sm:space-y-3">
                    <button 
                      onClick={() => goToBlogsWithCategory({ name: blog.category?.name || blog.categoryName, _id: blog.category?._id })}
                      className="text-left text-xs sm:text-sm text-amber-700 hover:text-amber-800"
                    >
                      {blog.category?.name || blog.categoryName || 'Uncategorized'}
                    </button>
                    <h3 className="font-serif text-lg sm:text-xl">
                      <Link 
                        to={`/blogs/${blog.slug || blog._id}`}
                        className="hover:text-amber-900 transition-colors line-clamp-2"
                      >
                        {blog.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                      {blog.summary || blog.excerpt}
                    </p>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 pt-1 sm:pt-2">
                      <span>{blog.author?.name || blog.authorName || 'Unknown'}</span>
                      <span className="mx-2">·</span>
                      <time dateTime={blog.createdAt || blog.publishedAt}>
                        {new Date(blog.createdAt || blog.publishedAt).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        })}
                      </time>
                      <div className="ml-auto flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{blog.readingTime || 5} min read</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section - Reimagined as Timeline */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-transparent to-amber-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-amber-900 mb-10 sm:mb-16 text-center">Journey Through Time</h2>
          {loading ? (
            <div className="flex justify-center py-8 sm:py-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <p className="text-gray-500">No categories available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
              {categories.map((category) => (
                <button 
                  key={category._id || `category-${Math.random()}`}
                  onClick={() => goToBlogsWithCategory(category)}
                  className="group relative aspect-[3/4] overflow-hidden rounded-lg text-left"
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-500"></div>
                  <img 
                    src={category.imageUrl || `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=3000`}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
                    <div className="transform group-hover:translate-y-0 translate-y-2 sm:translate-y-4 transition-transform duration-500">
                      <h3 className="text-lg sm:text-2xl font-serif mb-1 sm:mb-2">{category.name}</h3>
                      <p className="text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {category.blogsCount || 0} Stories
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action - Reimagined */}
      <section className="py-12 sm:py-20 bg-amber-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/mandala.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif mb-6 sm:mb-8">
              Become a Guardian of History
            </h2>
            <p className="text-base sm:text-lg mb-8 sm:mb-12 text-amber-100">
              Every untold story deserves to be heard. Share your knowledge and research 
              about Indian history with our growing community of history enthusiasts.
            </p>
            <Link 
              to="/signup" 
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-amber-900 rounded-full hover:bg-amber-100 transition-colors duration-300 font-medium text-base sm:text-lg"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 