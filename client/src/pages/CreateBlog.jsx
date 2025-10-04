import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BlogEditor from '../components/blog/BlogEditor';

const DRAFT_STORAGE_KEY = 'blog_draft';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.categories.getAllCategories();
        const fetchedCategories = response.data.data.categories || [];
        console.log('Fetched categories:', fetchedCategories);
        
        // Create mock categories if none exist
        if (fetchedCategories.length === 0) {
          console.log('No categories found, creating mock categories');
          
          // Create a temporary category for testing
          try {
            const mockCategory = {
              name: 'Ancient India',
              description: 'History of ancient India from prehistoric times to the medieval period',
              imageUrl: 'https://example.com/ancient-india.jpg',
              isActive: true
            };
            
            const createResponse = await api.categories.createCategory(mockCategory);
            console.log('Created mock category:', createResponse.data);
            
            // Fetch again to get the created category
            const newResponse = await api.categories.getAllCategories();
            const newCategories = newResponse.data.data.categories || [];
            console.log('New categories after creation:', newCategories);
            setCategories(newCategories);
          } catch (createError) {
            console.error('Error creating mock category:', createError);
            setCategories([]);
          }
        } else {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleSave = async (blogData) => {
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !currentUser) {
        throw new Error('You must be logged in to create a blog post');
      }
      
      // Validate required fields
      if (!blogData.title || !blogData.content || !blogData.excerpt || !blogData.featuredImage || !blogData.category) {
        throw new Error('Please fill in all required fields');
      }
      
      // Ensure excerpt (summary) is at least 50 characters
      if (blogData.excerpt.length < 50) {
        throw new Error('Summary must be at least 50 characters long');
      }
      
      // Ensure content is at least 500 characters
      if (blogData.content.length < 500) {
        throw new Error('Blog content must be at least 500 characters long');
      }
      
      // Prepare the blog data for submission
      const blogPayload = {
        title: blogData.title,
        content: blogData.content,
        summary: blogData.excerpt, // Map excerpt to summary field
        coverImage: blogData.featuredImage, // Map featuredImage to coverImage
        tags: blogData.tags,
        author: currentUser._id,
        status: 'draft',
      };
      
      // Set the category ID directly if it's already an ID
      if (blogData.category && categories.length > 0) {
        console.log('Checking category:', blogData.category, typeof blogData.category);
        console.log('Available categories:', categories);
        
        // Find the category by ID
        const selectedCategory = categories.find(cat => {
          const catId = cat._id;
          console.log('Comparing:', catId, typeof catId, 'with', blogData.category, typeof blogData.category);
          
          // Try multiple comparison approaches
          return (
            catId === blogData.category || 
            catId.toString() === blogData.category ||
            (typeof catId === 'object' && catId.toString() === blogData.category)
          );
        });
        
        if (selectedCategory) {
          blogPayload.category = selectedCategory._id;
          console.log('Category found:', selectedCategory.name, selectedCategory._id);
        } else {
          // Fall back to using the first category if available
          console.error('Category not found with ID:', blogData.category);
          console.error('Available category IDs:', categories.map(c => c._id));
          
          // Use the first category as a fallback
          if (categories.length > 0) {
            const firstCategory = categories[0];
            console.log('Using fallback category:', firstCategory.name, firstCategory._id);
            blogPayload.category = firstCategory._id;
          } else {
            throw new Error('No categories available. Please create a category first.');
          }
        }
      } else {
        console.error('Missing category or no categories available');
        console.error('Category value:', blogData.category);
        console.error('Categories array length:', categories.length);
        
        // Use first category if available as a fallback
        if (categories.length > 0) {
          const firstCategory = categories[0];
          console.log('Using fallback category when none selected:', firstCategory.name, firstCategory._id);
          blogPayload.category = firstCategory._id;
        } else {
          throw new Error('Please select a valid category');
        }
      }
      
      console.log('Sending blog data to API:', blogPayload);
      
      // Call the API to save the blog
      const response = await api.blogs.createBlog(blogPayload);
      
      console.log('Blog saved successfully:', response.data);
      
      setIsSubmitting(false);
      
      // Clear local draft on successful publish
      try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
      
      // Redirect to the newly created blog
      if (response.data && response.data.data && response.data.data.blog) {
        const blogId = response.data.data.blog._id;
        navigate(`/blogs/${response.data.data.blog.slug || blogId}`);
      } else {
        // If we can't get the blog ID, redirect to blogs list
        navigate('/blogs');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      
      // Set appropriate error message
      if (error.response) {
        // Server returned an error
        setErrorMessage(error.response.data?.message || 'Failed to save blog. Please try again.');
      } else if (error.request) {
        // No response received
        setErrorMessage('Network error. Please check your connection and try again.');
      } else {
        // Other errors
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
            Create New Blog
          </h1>
          <p className="text-gray-600 text-base">
            Share your knowledge and insights about Indian history.
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
              categories={categories.map(cat => ({
                id: cat._id,
                name: cat.name
              }))} 
            />
          </div>
        )}
        
        {/* Submission Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50" role="status" aria-live="polite">
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-sm w-full mx-4">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium text-gray-900">
                  Publishing your blog...
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