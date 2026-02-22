const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

// Get all blogs with filters, sorting, and pagination
exports.getAllBlogs = async (req, res) => {
  try {
    // Build query
    let query = {};

    // Status filter - only published blogs for regular users
    if (req.user && req.user.role === 'admin') {
      // Admin can see blogs with any status
      if (req.query.status) {
        // Support comma-separated status values
        if (req.query.status.includes(',')) {
          query.status = { $in: req.query.status.split(',') };
        } else {
          query.status = req.query.status;
        }
      }
    } else {
      // Regular users can only see published blogs
      query.status = 'published';
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Author filter
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Tag filter
    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Execute query with pagination and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let sortBy = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortBy[field.substring(1)] = -1;
        } else {
          sortBy[field] = 1;
        }
      });
    } else {
      // Default sort by publishedAt in descending order
      sortBy = { publishedAt: -1 };
    }

    // Execute query — exclude heavy fields for list view
    const blogs = await Blog.find(query)
      .select('-content -likes')
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Blog.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      pagination: {
        page,
        limit,
        totalResults: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      data: { blogs }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single blog by ID or slug
exports.getBlog = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Build query based on identifier type
    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { slug: identifier };

    // Atomically increment view count and return updated doc
    const blog = await Blog.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar bio')
      .populate('category', 'name')
      .lean();

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found'
      });
    }

    // Process content to ensure proper formatting
    if (blog.content) {
      blog.content = blog.content
        .replace(/<p(?![^>]*class=)>/g, '<p class="my-6">')
        .replace(/<img(?![^>]*class=)(?![^>]*data-alignment)([^>]*?)(?=\s*\/?>)/g, '<img class="my-8 rounded-xl shadow-lg max-w-full mx-auto"$1');
    }

    res.status(200).json({
      status: 'success',
      data: { blog }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    // Set the author to the current user
    req.body.author = req.user.id;

    // For non-admin users, set initial status to 'pending'
    if (req.user.role !== 'admin') {
      req.body.status = 'pending';
    }

    const newBlog = await Blog.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { blog: newBlog }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a blog
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found'
      });
    }

    // Check if user is author or admin
    if (blog.author.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only edit your own blogs'
      });
    }

    // For non-admin users updating published blog, set status back to pending
    if (req.user.role !== 'admin' && blog.status === 'published') {
      req.body.status = 'pending';
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { blog: updatedBlog }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found'
      });
    }

    // Check if user is author or admin
    if (blog.author.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own blogs'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    // Delete all comments associated with the blog
    await Comment.deleteMany({ blog: req.params.id });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Like or unlike a blog
exports.toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found'
      });
    }

    const updatedBlog = await blog.toggleLike(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        blog: updatedBlog,
        liked: updatedBlog.isLikedByUser(req.user.id),
        likesCount: updatedBlog.likesCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get featured blogs
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;

    const featuredBlogs = await Blog.find({
      isFeatured: true,
      status: 'published'
    })
      .select('-content -likes')
      .populate('author', 'name avatar bio')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      results: featuredBlogs.length,
      data: { blogs: featuredBlogs }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get related blogs
exports.getRelatedBlogs = async (req, res) => {
  try {
    // Only fetch category and tags for the lookup
    const blog = await Blog.findById(req.params.id)
      .select('category tags')
      .lean();

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found'
      });
    }

    const limit = parseInt(req.query.limit, 10) || 3;

    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      status: 'published',
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags || [] } }
      ]
    })
      .select('-content -likes')
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      results: relatedBlogs.length,
      data: { blogs: relatedBlogs }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get blogs by author
exports.getBlogsByAuthor = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({
      author: req.params.authorId,
      status: 'published'
    })
      .select('-content -likes')
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments({
      author: req.params.authorId,
      status: 'published'
    });

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      pagination: {
        page,
        limit,
        totalResults: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      data: { blogs }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Change blog status (for admin only)
exports.changeBlogStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['draft', 'pending', 'published', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found'
      });
    }

    blog.status = status;

    // Set rejectionReason if status is 'rejected'
    if (status === 'rejected') {
      blog.rejectionReason = rejectionReason || 'Blog was rejected by admin';
    } else {
      blog.rejectionReason = undefined;
    }

    // Set publishedAt if status is 'published' and publishedAt is not set
    if (status === 'published' && !blog.publishedAt) {
      blog.publishedAt = Date.now();
    }

    await blog.save();

    res.status(200).json({
      status: 'success',
      data: { blog }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Debug route to list all featured blogs directly
exports.debugFeaturedBlogs = async (req, res) => {
  try {
    console.log('Debug route: Directly fetching featured blogs');

    // Direct query without population to keep it simple
    const featuredBlogs = await Blog.find({
      isFeatured: true,
      status: 'published'
    }).lean();

    console.log(`Debug found ${featuredBlogs.length} featured blogs`);

    // Simple output of key fields for debugging
    const simplifiedBlogs = featuredBlogs.map(blog => ({
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      summary: blog.summary,
      content: blog.content,
      coverImage: blog.coverImage,
      author: blog.author,
      category: blog.category,
      isFeatured: blog.isFeatured,
      status: blog.status,
      createdAt: blog.createdAt,
      publishedAt: blog.publishedAt
    }));

    res.status(200).json({
      status: 'success',
      count: featuredBlogs.length,
      data: simplifiedBlogs
    });
  } catch (error) {
    console.error('Error in debugFeaturedBlogs:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get pending blogs (for admin)
exports.getPendingBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const pendingBlogs = await Blog.find({ status: 'pending' })
      .select('-content -likes')
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments({ status: 'pending' });
    console.log(`Fetched ${pendingBlogs.length} blogs, Total matching: ${total}`);
    res.status(200).json({
      status: 'success',
      results: pendingBlogs.length,
      pagination: {
        page,
        limit,
        totalResults: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      data: { blogs: pendingBlogs }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get published blogs
exports.getPublishedBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const publishedBlogs = await Blog.find({ status: 'published' })
      .select('-content -likes')
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments({ status: 'published' });

    res.status(200).json({
      status: 'success',
      results: publishedBlogs.length,
      pagination: {
        page,
        limit,
        totalResults: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      data: { blogs: publishedBlogs }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Approve a blog
exports.approveBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found'
      });
    }

    // Check if blog is in pending status
    if (blog.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Only pending blogs can be approved'
      });
    }

    // Update blog status to published and set publishedAt
    blog.status = 'published';
    blog.publishedAt = Date.now();
    await blog.save();

    res.status(200).json({
      status: 'success',
      data: { blog }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Reject a blog
exports.rejectBlog = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required'
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found'
      });
    }

    // Check if blog is in pending status
    if (blog.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Only pending blogs can be rejected'
      });
    }

    // Update blog status to rejected and set rejection reason
    blog.status = 'rejected';
    blog.rejectionReason = rejectionReason;
    await blog.save();

    res.status(200).json({
      status: 'success',
      data: { blog }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 