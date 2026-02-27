import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PRIMARY = '#992E01';
const BG = '#FAF7F3';

const STATUS_CONFIG = {
    published: { label: 'Published', bg: '#d1fae5', color: '#065f46' },
    pending: { label: 'Under Review', bg: '#fef9c3', color: '#854d0e' },
    rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b' },
    draft: { label: 'Draft', bg: '#e5e7eb', color: '#374151' },
};

const SkeletonRow = () => (
    <div className="animate-pulse flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-[#FAF7F3] border border-[#f0e9e0]">
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-12 bg-gray-200 rounded" />
            <div className="h-6 w-12 bg-gray-200 rounded" />
        </div>
    </div>
);

const ProfileMyBlogs = () => {
    const { currentUser } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchMyBlogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.blogs.getBlogsByAuthor(currentUser._id, { limit: 100 });
            setBlogs(res.data.data.blogs || []);
        } catch (err) {
            setError('Failed to load your blogs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?._id) fetchMyBlogs();
    }, [currentUser]);

    const filtered = filter === 'all' ? blogs : blogs.filter(b => b.status === filter);

    const counts = {
        all: blogs.length,
        published: blogs.filter(b => b.status === 'published').length,
        pending: blogs.filter(b => b.status === 'pending').length,
        rejected: blogs.filter(b => b.status === 'rejected').length,
        draft: blogs.filter(b => b.status === 'draft').length,
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-600 mb-3">{error}</p>
                <button
                    onClick={fetchMyBlogs}
                    className="px-4 py-2 text-sm font-medium text-white rounded"
                    style={{ background: PRIMARY }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!blogs.length) {
        return (
            <div className="text-center py-12 flex flex-col items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-500 font-medium">You haven't written any blogs yet.</p>
                <Link
                    to="/create-blog"
                    className="px-5 py-2 text-sm font-semibold text-white rounded-full"
                    style={{ background: PRIMARY }}
                >
                    Write Your First Blog
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
                {Object.entries(counts).map(([key, count]) => {
                    if (count === 0 && key !== 'all') return null;
                    const labels = { all: 'All', published: 'Published', pending: 'Under Review', rejected: 'Rejected', draft: 'Draft' };
                    const isActive = filter === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border transition-all"
                            style={isActive
                                ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY }
                                : { background: '#fff', color: PRIMARY, borderColor: PRIMARY + '44' }
                            }
                        >
                            {labels[key]} <span className="ml-1 opacity-70">({count})</span>
                        </button>
                    );
                })}
            </div>

            {/* Blog list */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 text-sm">No blogs in this category.</p>
                ) : filtered.map(blog => {
                    const status = STATUS_CONFIG[blog.status] || STATUS_CONFIG.pending;
                    const canEdit = blog.status !== 'published';
                    return (
                        <div
                            key={blog._id}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-[#f0e9e0] hover:shadow-md transition-shadow"
                            style={{ background: BG }}
                        >
                            {/* Cover thumb */}
                            {blog.coverImage && (
                                <img
                                    src={blog.coverImage}
                                    alt={blog.title}
                                    className="w-full sm:w-16 h-24 sm:h-12 object-cover rounded-lg flex-shrink-0"
                                />
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm sm:text-base text-[#111] line-clamp-1">{blog.title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {blog.publishedAt
                                        ? `Published ${new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                        : `Submitted ${new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                    }
                                    {blog.category?.name && <span className="ml-2 text-gray-400">· {blog.category.name}</span>}
                                </p>
                            </div>

                            {/* Right side: status badge + actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Status badge */}
                                <span
                                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                                    style={{ background: status.bg, color: status.color }}
                                >
                                    {status.label}
                                </span>

                                {/* View */}
                                <Link
                                    to={`/blogs/${blog.slug || blog._id}`}
                                    className="px-3 py-1 text-xs font-medium border rounded transition-colors hover:bg-amber-50"
                                    style={{ color: PRIMARY, borderColor: PRIMARY + '44' }}
                                >
                                    View
                                </Link>

                                {/* Edit — only for pending/draft/rejected */}
                                {canEdit && (
                                    <Link
                                        to={`/create-blog?edit=${blog._id}`}
                                        className="px-3 py-1 text-xs font-semibold text-white rounded transition-opacity hover:opacity-80"
                                        style={{ background: PRIMARY }}
                                    >
                                        Edit
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfileMyBlogs;
