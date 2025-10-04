import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Comments from '../components/blog/Comments';
import api from '../services/api';
// import { Helmet } from 'react-helmet-async';
import '../styles/blog.css';
import { useAuth } from '../context/AuthContext';

// Add this utility function to get absolute URL
const getAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  } else if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  } else {
    return `${window.location.origin}/${url}`;
  }
};

// Debugging component to display meta tags - remove in production
const MetaTagsDebug = ({ show }) => {
  if (!show) return null;
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <h3>Meta Tag Debugger</h3>
      <p>Open the page source to view the actual meta tags</p>
      <p>Current URL: {window.location.href}</p>
    </div>
  );
};

const BlogDetail = () => {
  const { id: identifier } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        console.log('Fetching blog with identifier:', identifier);
        
        // Modify this API call to try to get the blog by slug first
        let blogResponse;
        try {
          // First, try to fetch by slug
          blogResponse = await api.blogs.getBlogBySlug(identifier);
        } catch (slugError) {
          console.log('Could not find blog by slug, trying ID:', slugError);
          // If that fails, fallback to the original ID method
          blogResponse = await api.blogs.getBlog(identifier);
        }
        
        console.log('Blog data response:', blogResponse.data);
        
        // Process the blog response data
        let blogData = null;
        
        if (blogResponse.data && blogResponse.data.data && blogResponse.data.data.blog) {
          blogData = blogResponse.data.data.blog;
        } else if (blogResponse.data && blogResponse.data.blog) {
          blogData = blogResponse.data.blog;
        } else if (blogResponse.data && !blogResponse.data.status) {
          // Assume the data itself is the blog
          blogData = blogResponse.data;
        }
        
        if (!blogData) {
          throw new Error('Blog not found or invalid response format');
        }
        
        console.log('Processed blog data:', blogData);
        setBlog(blogData);
        setLikesCount(blogData.likesCount || 0);
        
        // Check if user has liked this blog (if authenticated)
        if (isAuthenticated && currentUser) {
          setIsLiked(currentUser.likedBlogs?.includes(blogData._id));
        }
        
        // Fetch related blogs
        try {
          const relatedResponse = await api.blogs.getRelatedBlogs(blogData._id, 3);
          console.log('Related blogs response:', relatedResponse.data);
          
          // Process the related blogs response
          let relatedBlogsData = [];
          
          if (relatedResponse.data && relatedResponse.data.data && relatedResponse.data.data.blogs) {
            relatedBlogsData = relatedResponse.data.data.blogs;
          } else if (relatedResponse.data && relatedResponse.data.blogs) {
            relatedBlogsData = relatedResponse.data.blogs;
          } else if (relatedResponse.data && Array.isArray(relatedResponse.data)) {
            relatedBlogsData = relatedResponse.data;
          }
          
          setRelatedBlogs(relatedBlogsData);
          console.log('Processed related blogs:', relatedBlogsData);
        } catch (relatedErr) {
          console.error('Error fetching related blogs:', relatedErr);
          // Non-critical error, continue with empty related blogs
          setRelatedBlogs([]);
        }
        
        // Set isSaved and isFollowing if authenticated
        if (isAuthenticated && currentUser) {
          setIsSaved(currentUser.savedBlogs?.includes(blogData._id));
          setIsFollowing(currentUser.following?.includes(blogData.author?._id));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog details:', err);
        setError(err.message || 'Failed to load blog details. Please try again later.');
        setLoading(false);
      }
    };
    

    if (identifier) {
      fetchBlog();
    }
  }, [identifier, isAuthenticated, currentUser]);

  // Add debugging
  useEffect(() => {
    if (blog && blog.coverImage) {
      console.log('Blog cover image URL:', blog.coverImage);
      console.log('Absolute cover image URL:', getAbsoluteUrl(blog.coverImage));
    }
  }, [blog]);

  // Add a key handler to toggle debug view with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const stripHtml = (html) => {
  return html.replace(/<[^>]+>/g, '');
};
  const handleLike = async () => {
    if (!blog || !blog._id) {
      console.error('Cannot like blog: missing blog ID');
      return;
    }
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        alert('Please sign in to like this blog');
        navigate('/login');
        return;
      }
      
      // Optimistic UI update
      if (isLiked) {
        setLikesCount(likesCount - 1);
      } else {
        setLikesCount(likesCount + 1);
      }
      setIsLiked(!isLiked);
      
      // Send like toggle request to API - must use blog ID, not slug
      const response = await api.blogs.toggleLike(blog._id);
      console.log('Like toggled:', response.data);
      
      // Process the response data
      let updatedLikesCount = likesCount;
      let updatedIsLiked = !isLiked;
      
      if (response.data && response.data.data) {
        updatedLikesCount = response.data.data.likesCount || response.data.data.blog.likesCount;
        updatedIsLiked = response.data.data.liked;
      } else if (response.data) {
        updatedLikesCount = response.data.likesCount || response.data.blog?.likesCount || likesCount;
        updatedIsLiked = response.data.liked !== undefined ? response.data.liked : !isLiked;
      }
      
      // Update with actual data from server
      setLikesCount(updatedLikesCount);
      setIsLiked(updatedIsLiked);
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert optimistic update on error
      if (isLiked) {
        setLikesCount(likesCount + 1);
      } else {
        setLikesCount(likesCount - 1);
      }
      setIsLiked(!isLiked);
    }
  };
  
  // Function to handle social sharing
  const handleShare = (platform) => {
    if (!blog) return;
    
    // Use direct URL for all sharing to avoid encoding issues
    const directUrl = window.location.href;
    const title = blog.title || 'Check out this blog post on Ajeyam.in';
    
    let shareUrl;
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(directUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case 'facebook':
        // Facebook sharing is simpler and more reliable with just the URL
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + directUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(directUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct sharing URL
        alert('To share on Instagram, please take a screenshot and share it on your story with the link in your bio.');
        return;
      case 'copy':
        navigator.clipboard.writeText(directUrl);
        alert('Link copied to clipboard!');
        return;
      case 'advanced':
        // Only use the special server-side sharing URL for "advanced" sharing option
        const serverShareUrl = getShareUrl();
        window.open(serverShareUrl, '_blank');
        return;
      default:
        return;
    }
    
    // Open share URL in a new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  const getShareUrl = () => {
    if (!blog) return window.location.href;
    
    try {
      // Get the API base URL from environment or use a default
      const origin = window.location.origin;
      const apiBaseUrl = import.meta.env.VITE_API_URL || `${origin}/api/v1`;
      
      // Create the base sharing URL with the blog ID
      const serverShareUrl = `${apiBaseUrl}/utils/share/${blog._id || identifier}`;
      
      // Create URL object for proper parameter encoding
      const url = new URL(serverShareUrl);
      
      // Add title (keep it short)
      const title = blog.title && blog.title.length > 100 
        ? blog.title.substring(0, 100) 
        : blog.title || 'Ajeyam.in Blog';
      url.searchParams.append('title', title);
      
      // Add a shorter description
      const description = blog.summary 
        ? blog.summary.substring(0, 150) 
        : 'Read this fascinating article on Ajeyam.in';
      url.searchParams.append('description', description);
      
      // Simplify image URL handling - just use the cover image if it's absolute
      // or a default image to avoid encoding issues
      let imageUrl = blog.coverImage;
      if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        // Use the absolute URL directly
        url.searchParams.append('image', imageUrl);
      } else {
        // Use a default image from the site
        url.searchParams.append('image', `${origin}/og-image.jpg`);
      }
      
      console.log("Generated share URL:", url.toString());
      return url.toString();
    } catch (error) {
      console.error('Error generating share URL:', error);
      // If anything fails, just return the direct URL
      return window.location.href;
    }
  };

  // Save/Unsave blog handler
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save this blog');
      navigate('/login');
      return;
    }
    if (!blog || !blog._id) return;
    try {
      setIsSaved((prev) => !prev); // Optimistic UI
      await api.users.toggleSaveBlog(blog._id);
      // Optionally, refetch user or saved blogs for accuracy
    } catch (err) {
      setIsSaved((prev) => !prev); // Revert on error
      alert('Failed to save/unsave blog. Please try again.');
    }
  };

  // Follow/Unfollow author handler
  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to follow authors');
      navigate('/login');
      return;
    }
    if (!blog?.author?._id) return;
    try {
      setIsFollowing((prev) => !prev); // Optimistic UI
      await api.users.toggleFollowAuthor(blog.author._id);
      // Optionally, refetch user or following for accuracy
    } catch (err) {
      setIsFollowing((prev) => !prev); // Revert on error
      alert('Failed to follow/unfollow author. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-amber-50/40">
        <div className="page-flip-container">
          <div className="book"></div>
          <div className="page page-back"></div>
          <div className="page page-front"></div>
        </div>
        <p className="text-gray-600 mt-2">Loading article...</p>
      </div>
    );
  }
  
  if (error || !blog) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-medium tracking-tight text-gray-900 mb-2">
            {error || "Blog not found"}
          </h2>
          <button 
            className="text-green-600 hover:text-green-700 tracking-wide text-sm font-medium"
            onClick={() => navigate('/blogs')}
          >
            Go back to all stories
          </button>
        </div>
      </div>
    );
  }
  
  const sanitizedBlog = {
    ...blog,
    title: blog.title || 'Untitled Blog',
    content: blog.content || '<p>No content available</p>',
    coverImage: ensureValidCoverImage(blog.coverImage),
    author: blog.author || { name: 'Unknown Author' },
    createdAt: blog.createdAt || new Date().toISOString(),
    readTime: blog.readTime || 5,
    tags: blog.tags || [],
    commentsCount: blog.commentsCount || 0
  };
  
  // Function to ensure the cover image is valid and accessible
  function ensureValidCoverImage(coverImage) {
    // First check if the cover image exists
    if (!coverImage) {
      console.warn('No cover image provided, using fallback image');
      return 'https://ajeyam.in/og-image.jpg';
    }
    
    // Check if the image is a valid URL format
    try {
      // If it starts with data:image/ it's a base64 image which is fine
      if (coverImage.startsWith('data:image/')) {
        return coverImage;
      }
      
      // If it's a valid absolute URL, use it
      if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
        return coverImage;
      }
      
      // Otherwise, make it an absolute URL
      return getAbsoluteUrl(coverImage);
    } catch (error) {
      console.error('Error processing cover image URL:', error);
      return 'https://ajeyam.in/og-image.jpg';
    }
  }
  
  return (
    <div className="min-h-screen bg-[#FBF7F4]">
      {/* Open Graph Meta Tags */}
      {/* <Helmet prioritizeSeoTags> */}
        <title>{sanitizedBlog.title} | Ajeyam.in</title>
        <meta name="description" content={sanitizedBlog.summary || stripHtml(sanitizedBlog.content).slice(0, 160)} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={sanitizedBlog.title} />
        <meta property="og:description" content={sanitizedBlog.summary || stripHtml(sanitizedBlog.content).slice(0, 160)} />
        <meta property="og:image" content={sanitizedBlog.coverImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Ajeyam.in" />
        <meta property="article:published_time" content={sanitizedBlog.createdAt} />
        {sanitizedBlog.author?.name && (
          <meta property="article:author" content={sanitizedBlog.author.name} />
        )}
        {sanitizedBlog.tags?.length > 0 && sanitizedBlog.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ajeyam_speaks" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={sanitizedBlog.title} />
        <meta name="twitter:description" content={sanitizedBlog.summary || stripHtml(sanitizedBlog.content).slice(0, 160)} />
        <meta name="twitter:image" content={sanitizedBlog.coverImage} />
        {sanitizedBlog.author?.name && (
          <meta name="twitter:creator" content={sanitizedBlog.author.name} />
        )}

        {/* Additional Tags for SEO and Social Sharing */}
        <link rel="canonical" href={window.location.href} />
      {/* </Helmet> */}
      
      {/* Add custom CSS for blog content */}
      <style jsx="true">{`
        .editor-image {
          margin: 2rem 0 !important;
          display: block !important;
          width: 100% !important;
        }
        .editor-image img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          margin: 0 auto;
        }
      `}</style>
      
      {/* Elegant Header Bar with pattern */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-amber-100 mb-8 relative">
        <div className="absolute inset-0 bg-[url('/patterns/kolam.svg')] opacity-5"></div>
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center relative z-10">
          <Link to="/" className="text-xl font-serif text-amber-900">{sanitizedBlog.title}</Link>
        </div>
      </header>

      {/* Main Article */}
      <article className="max-w-[744px] mx-auto px-4 pt-8 pb-20">
        {/* Article Category */}
        <div className="mb-6">
          <span className="text-xs font-medium text-amber-800 tracking-widest uppercase">
            {sanitizedBlog.category?.name || 'History'}
          </span>
        </div>

        {/* Article Title with gradient */}
        <h1 className="text-[2.5rem] font-serif leading-tight tracking-tight mb-6 font-bold bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
          {sanitizedBlog.title}
        </h1>

        {/* Subtitle/Description */}
        {/* <h2 className="text-xl text-gray-700 font-normal leading-relaxed mb-8 font-inter">
          {sanitizedBlog.subtitle || 'A deep dive into the subject matter'}
        </h2> */}

        {/* Author and Meta Info with enhanced styling */}
        <div className="flex items-center justify-between mb-12 border-b border-amber-100 pb-8">
          <div className="flex items-center">
            <img 
              src={sanitizedBlog.author?.avatar || 'https://source.unsplash.com/random/40x40'} 
              alt={sanitizedBlog.author?.name} 
              className="w-12 h-12 rounded-full mr-3 ring-2 ring-amber-50 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <Link 
                  to={`/authors/${sanitizedBlog.author?._id}`} 
                  className="font-medium text-amber-900 hover:text-amber-700"
                >
                  {sanitizedBlog.author?.name}
                </Link>
                <button 
                  className={`text-amber-600 text-sm font-medium hover:text-amber-700 transition-colors ${isFollowing ? 'opacity-60' : ''}`}
                  onClick={handleToggleFollow}
                  disabled={isFollowing}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1 space-x-2 font-inter">
                <span>{new Date(sanitizedBlog.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
                <span>·</span>
                <span>{sanitizedBlog.readTime} min read</span>
              </div>
            </div>
          </div>

          {/* Share Actions with enhanced styling */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleShare('copy')}
              className="p-2 hover:bg-amber-50 rounded-full transition-colors tooltip relative" 
              title="Copy link"
            >
              <svg className="w-5 h-5 text-amber-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </button>
            <button 
              onClick={() => handleShare('whatsapp')}
              className="p-2 hover:bg-amber-50 rounded-full transition-colors tooltip relative" 
              title="Share on WhatsApp"
            >
              <svg className="w-5 h-5 text-amber-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </button>
            <button 
              onClick={() => handleShare('twitter')}
              className="p-2 hover:bg-amber-50 rounded-full transition-colors tooltip relative" 
              title="Share on Twitter"
            >
              <svg className="w-5 h-5 text-amber-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button 
              onClick={() => handleShare('facebook')}
              className="p-2 hover:bg-amber-50 rounded-full transition-colors tooltip relative" 
              title="Share on Facebook"
            >
              <svg className="w-5 h-5 text-amber-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
              </svg>
            </button>
            <button 
              onClick={() => handleShare('linkedin')}
              className="p-2 hover:bg-amber-50 rounded-full transition-colors tooltip relative" 
              title="Share on LinkedIn"
            >
              <svg className="w-5 h-5 text-amber-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Cover Image with enhanced styling */}
        {sanitizedBlog.coverImage && (
          <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
            <img
              src={sanitizedBlog.coverImage}
              alt={sanitizedBlog.title}
              className="w-full h-[500px] object-cover transform hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        )}

        {/* Article Content with enhanced typography */}
        <div 
          className="prose prose-lg max-w-none 
            prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-amber-900 prose-headings:font-bold
            prose-h1:text-[2.25rem] prose-h1:mt-12 prose-h1:mb-6
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:tracking-normal prose-p:font-inter
            prose-p:my-6 prose-p:first-of-type:mt-0
            prose-a:text-amber-600 prose-a:no-underline prose-a:font-medium hover:prose-a:text-amber-700
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:max-w-full prose-img:mx-auto
            prose-blockquote:border-l-amber-600 prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-6
            prose-strong:text-amber-900 prose-strong:font-semibold
            prose-code:text-gray-900 prose-code:bg-amber-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:p-4
            prose-hr:my-8 prose-hr:border-amber-100"
          dangerouslySetInnerHTML={{ __html: sanitizedBlog.content }}
        />

        {/* Add global CSS to ensure editor content renders correctly */}
        <style jsx="true">{`
          .prose p {
            margin-top: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .prose .editor-image {
            margin: 2rem 0;
            display: block;
            width: 100%;
          }
          
          .prose .editor-image img {
            max-width: 100%;
            height: auto;
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin: 0 auto;
          }
          
          .prose .editor-image[data-alignment="center"] {
            text-align: center;
          }
          
          .prose .editor-image[data-alignment="right"] {
            text-align: right;
          }
          
          .prose .editor-image[data-alignment="left"] {
            text-align: left;
          }
          
          .prose h1, .prose h2, .prose h3 {
            font-weight: 700;
            color: #78350f;
            font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          }
          
          .prose h1 {
            font-size: 2.25rem;
            margin-top: 3rem;
            margin-bottom: 1.5rem;
          }
          
          .prose h2 {
            font-size: 1.5rem;
            margin-top: 3rem;
            margin-bottom: 1.5rem;
          }
          
          .prose h3 {
            font-size: 1.25rem;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
          }
          
          .prose blockquote {
            border-left-width: 4px;
            border-left-color: #92400e;
            padding-left: 1.5rem;
            font-style: italic;
            margin: 1.5rem 0;
          }
          
          .prose strong {
            color: #78350f;
            font-weight: 600;
          }
          
          .prose a {
            color: #92400e;
            text-decoration: none;
            font-weight: 500;
          }
          
          .prose a:hover {
            color: #78350f;
          }
          
          .prose ul, .prose ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
          }
          
          .prose li {
            margin: 0.5rem 0;
          }
          
          .prose hr {
            margin: 2rem 0;
            border-color: #fef3c7;
          }
        `}</style>

        {/* Tags with enhanced styling */}
        <div className="mt-12 flex flex-wrap gap-3">
          {sanitizedBlog.tags.map((tag, index) => (
            <Link
              key={index}
              to={`/tags/${tag.toLowerCase().replace(' ', '-')}`}
              className="px-3 py-1 bg-amber-50 text-sm text-amber-800 rounded-full hover:bg-amber-100 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Engagement Footer with enhanced styling */}
        <div className="mt-12 pt-8 border-t border-amber-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-2 group"
              >
                <svg className={`w-6 h-6 ${isLiked ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
                  fill={isLiked ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
                <span className="text-sm text-gray-600 group-hover:text-gray-900">{likesCount}</span>
              </button>
              <button className="flex items-center space-x-2 group">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
                <span className="text-sm text-gray-600 group-hover:text-gray-900">{sanitizedBlog.commentsCount}</span>
              </button>
              {/* Save/Bookmark Button */}
              <button 
                onClick={handleToggleSave}
                className={`flex items-center space-x-2 group ${isSaved ? 'text-amber-600' : 'text-gray-400 hover:text-amber-700'}`}
                title={isSaved ? 'Unsave' : 'Save'}
              >
                <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                <span className="text-sm">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-600" onClick={() => handleShare('copy')} title="Share">
                <svg  className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
<path d="M 15.990234 1.9902344 A 1.0001 1.0001 0 0 0 15.292969 3.7070312 L 17.585938 6 L 17 6 C 10.936593 6 6 10.936593 6 17 A 1.0001 1.0001 0 1 0 8 17 C 8 12.017407 12.017407 8 17 8 L 17.585938 8 L 15.292969 10.292969 A 1.0001 1.0001 0 1 0 16.707031 11.707031 L 20.707031 7.7070312 A 1.0001 1.0001 0 0 0 20.707031 6.2929688 L 16.707031 2.2929688 A 1.0001 1.0001 0 0 0 15.990234 1.9902344 z M 2.984375 7.9863281 A 1.0001 1.0001 0 0 0 2 9 L 2 19 C 2 20.64497 3.3550302 22 5 22 L 19 22 C 20.64497 22 22 20.64497 22 19 L 22 18 A 1.0001 1.0001 0 1 0 20 18 L 20 19 C 20 19.56503 19.56503 20 19 20 L 5 20 C 4.4349698 20 4 19.56503 4 19 L 4 9 A 1.0001 1.0001 0 0 0 2.984375 7.9863281 z"></path>
</svg>
              </button>
              
            </div>
          </div>
        </div>
      </article>

      {/* Author Section with enhanced styling */}
      <div className="max-w-[744px] mx-auto px-4 py-12 border-t border-amber-100">
        <div className="flex items-start gap-6">
          <img 
            src={sanitizedBlog.author?.avatar || 'https://source.unsplash.com/random/80x80'} 
            alt={sanitizedBlog.author?.name} 
            className="w-20 h-20 rounded-full ring-4 ring-amber-50 shadow-lg"
          />
          <div>
            <h3 className="text-xl font-bold text-amber-900 mb-2 font-serif">
              Written by {sanitizedBlog.author?.name}
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed font-inter">
              {sanitizedBlog.author?.bio || 'Writer and contributor at Ajeyam. Passionate about Indian history and culture.'}
            </p>
            <button 
              className={`px-6 py-2 bg-amber-900 text-white text-sm font-medium rounded-full hover:bg-amber-800 transition-colors ${isFollowing ? 'opacity-60' : ''}`}
              onClick={handleToggleFollow}
              disabled={isFollowing}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section with enhanced styling */}
      <div className="max-w-[744px] mx-auto px-4 py-12 border-t border-amber-100">
        <h3 className="text-2xl font-serif font-bold text-amber-900 mb-8">Responses ({sanitizedBlog.commentsCount})</h3>
        <Comments blogId={blog._id} initialCount={sanitizedBlog.commentsCount} />
      </div>
      {/* Follow Us section */}
      <div className="max-w-[744px] mx-auto px-4 py-8 border-t border-amber-100">
        <div className="text-center">
          <h3 className="text-xl font-serif font-bold text-amber-900 mb-2">Follow Us</h3>
          <p className="text-gray-600 mb-5 text-sm max-w-md mx-auto">Stay connected for more stories on Indian history and culture.</p>
          
          <div className="flex justify-center items-center space-x-6">
            {/* Instagram */}
            <a href="https://www.instagram.com/ajeyam_speaks?igsh=MXJueTV1bGF4eTVi" target="_blank" rel="noopener noreferrer" 
              className="group flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <span className="text-sm text-amber-900 font-medium">Instagram</span>
            </a>
            
            {/* Twitter/X */}
            <a href="https://x.com/ajeyam_speaks?s=21" target="_blank" rel="noopener noreferrer" 
              className="group flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-sm text-amber-900 font-medium">Twitter</span>
            </a>
            
            {/* Facebook */}
            <a href="https://www.facebook.com/AjeyamSpeaks?mibextid=wwXIfr&mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" 
              className="group flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
                </svg>
              </div>
              <span className="text-sm text-amber-900 font-medium">Facebook</span>
            </a>
          </div>
        </div>
      </div>

      {/* Related Articles with enhanced styling */}
      {relatedBlogs.length > 0 && (
        <div className="max-w-[744px] mx-auto px-4 py-12 border-t border-amber-100">
          <h3 className="text-2xl font-serif font-bold text-amber-900 mb-8">More from {sanitizedBlog.author?.name}</h3>
          <div className="space-y-12">
            {relatedBlogs.map((relatedBlog) => (
              <div key={relatedBlog._id} className="flex items-start gap-8 group">
                <div className="flex-1">
                  <Link 
                    to={`/blogs/${relatedBlog.slug || relatedBlog._id}`}
                    className="block"
                  >
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 mb-3 tracking-tight">
                      {relatedBlog.title}
                    </h4>
                    <p className="text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                      {relatedBlog.excerpt || stripHtml(relatedBlog.content).slice(0, 150)}...
                    </p>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span>{new Date(relatedBlog.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                      <span>·</span>
                      <span>{relatedBlog.readTime || 5} min read</span>
                    </div>
                  </Link>
                </div>
                {relatedBlog.coverImage && (
                  <div className="w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <img 
                      src={relatedBlog.coverImage} 
                      alt={relatedBlog.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      

      {/* Meta Tags Debugger - Press Ctrl+Shift+D to show/hide */}
      <MetaTagsDebug show={showDebug} />
    </div>
  );
};

export default BlogDetail; 