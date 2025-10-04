const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A blog must have a title'],
      trim: true,
      minlength: [10, 'Blog title must be at least 10 characters long'],
      maxlength: [100, 'Blog title cannot exceed 100 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    summary: {
      type: String,
      required: [true, 'Please provide a blog summary'],
      trim: true,
      minlength: [50, 'Summary must be at least 50 characters long'],
      maxlength: [300, 'Summary cannot exceed 300 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content'],
      minlength: [500, 'Blog content must be at least 500 characters long']
    },
    coverImage: {
      type: String,
      required: [true, 'A blog must have a cover image']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A blog must have an author']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'A blog must belong to a category']
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    readTime: {
      type: Number, // in minutes
      default: function() {
        // Calculate read time based on content length (average 200 words per minute)
        const wordsPerMinute = 200;
        const wordCount = this.content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
      }
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    publishedAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for comments - not stored in DB, but accessible in queries
BlogSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog'
});

// Create slug from title before saving
BlogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-6);
  }
  
  // Update likesCount from likes array length
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  
  // Set publishedAt date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  next();
});

// When a blog is queried, automatically populate author and category
BlogSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name avatar bio'
  }).populate({
    path: 'category',
    select: 'name'
  });
  
  next();
});

// Static method to calculate average read time of all blogs by a specific author
BlogSchema.statics.calcAverageReadTime = async function(authorId) {
  const stats = await this.aggregate([
    {
      $match: { author: authorId }
    },
    {
      $group: {
        _id: '$author',
        avgReadTime: { $avg: '$readTime' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0].avgReadTime : 0;
};

// Instance method to check if a user has liked this blog
BlogSchema.methods.isLikedByUser = function(userId) {
  return this.likes.some(like => like.toString() === userId.toString());
};

// Instance method to add or remove a like
BlogSchema.methods.toggleLike = function(userId) {
  if (this.isLikedByUser(userId)) {
    // User already liked the blog, so remove the like
    this.likes = this.likes.filter(like => like.toString() !== userId.toString());
  } else {
    // User hasn't liked the blog, so add the like
    this.likes.push(userId);
  }
  
  this.likesCount = this.likes.length;
  return this.save();
};

const Blog = mongoose.model('Blog', BlogSchema);

// Blog model verified

module.exports = Blog; 