import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock } from 'react-feather';
import api from '../services/api';

const AuthorProfile = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api.blogs
      .getPublicAuthorBlogs(id, { limit: 50 })
      .then((res) => {
        if (!active) return;
        setAuthor(res.data.data.author || null);
        setBlogs(res.data.data.blogs || []);
      })
      .catch(() => active && setError('Could not load this author.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FBF7F4]">
        <div className="w-10 h-10 border-4 border-amber-900/20 border-l-amber-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FBF7F4] text-center px-4">
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/blogs" className="px-5 py-2 border border-amber-900 text-amber-900 rounded-full hover:bg-amber-50 text-sm font-medium">
          Browse Blogs
        </Link>
      </div>
    );
  }

  const name = author?.name || 'Author';

  return (
    <div className="min-h-screen bg-[#FBF7F4]">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-5">
          <img
            src={author?.avatar || '/logo.png'}
            alt={name}
            className="w-20 h-20 rounded-full ring-4 ring-white/20 bg-amber-50 object-cover flex-shrink-0"
          />
          <div>
            <h1 className="text-3xl font-serif font-bold">{name}</h1>
            {author?.bio && <p className="text-amber-100 mt-1 max-w-xl">{author.bio}</p>}
            <p className="text-amber-200 text-sm mt-2">
              {blogs.length} {blogs.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-serif font-bold text-amber-900 mb-6">Articles by {name}</h2>
        {blogs.length === 0 ? (
          <p className="text-gray-600">This author hasn’t published any articles yet.</p>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <article key={blog._id} className="flex flex-col sm:flex-row gap-4 border-b border-amber-100 pb-6">
                {blog.coverImage && (
                  <Link to={`/blogs/${blog.slug || blog._id}`} className="sm:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={blog.coverImage} alt={blog.title} loading="lazy" className="w-full h-full object-cover" />
                  </Link>
                )}
                <div className="flex-grow">
                  {blog.category?.name && (
                    <span className="text-xs text-amber-700">{blog.category.name}</span>
                  )}
                  <h3 className="font-serif text-lg mt-1">
                    <Link to={`/blogs/${blog.slug || blog._id}`} className="hover:text-amber-900">{blog.title}</Link>
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{blog.summary}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <time dateTime={blog.publishedAt || blog.createdAt}>
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>
                    <span className="mx-2">·</span>
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    <span>{blog.readTime || 5} min read</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorProfile;
