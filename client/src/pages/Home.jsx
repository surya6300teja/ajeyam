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
      {/* Hero Section */}
      <section className="relative overflow-hidden flex flex-col justify-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('/patterns/kolam.svg')] opacity-5 pattern-rotate"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-12 sm:pb-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 sm:mb-6">
              <span className="text-primary font-devanagari text-base sm:text-xl">||राष्ट्राय स्वाहा||</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-4 sm:mb-6 bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent leading-tight">
              CIVILIZATION. INVINCIBILITY. RESURGENCE.
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-10 font-serif leading-relaxed px-2 sm:px-0">
              Where forgotten stories emerge from the depths of time,
              weaving together the tapestry of our heritage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center">
              <Link
                to="/blogs"
                className="group relative rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base overflow-hidden border border-amber-900"
              >
                <span className="relative z-10 text-amber-900 font-medium group-hover:text-white transition-colors duration-100">
                  Begin Your Journey
                </span>
                <div className="absolute inset-0 bg-amber-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
              <span className="text-gray-400 hidden sm:inline">or</span>
              <Link
                to="/create-blog"
                className="text-gray-600 hover:text-amber-900 transition-colors duration-300 text-sm sm:text-base"
              >
                Reveal Untold Stories →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-10 sm:py-14 bg-gradient-to-b from-[#FBF7F4] to-transparent">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-amber-900 mb-10 sm:mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Authentic Research</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every article is backed by thorough research from credible historical sources and academic references.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Community Driven</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We welcome writers and history enthusiasts from all backgrounds to contribute and share their knowledge.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Accessible History</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We make Indian history engaging and accessible through compelling storytelling and modern presentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories Section - Clean & Minimal */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-3 sm:gap-0">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
      <section className="py-10 sm:py-16 bg-gradient-to-b from-transparent to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif text-amber-900 mb-8 sm:mb-12 text-center">Journey Through Time</h2>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
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
      <section className="py-10 sm:py-16 bg-amber-900 text-white relative overflow-hidden">
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