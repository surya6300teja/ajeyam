const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      trim: true,
      minlength: [2, 'Comment must be at least 2 characters long'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Comment must belong to a blog']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user']
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null // null means it's a top-level comment
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
    isEdited: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for replies
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Middleware to update likesCount from likes array
CommentSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  next();
});

// Middleware to populate user and replies when querying comments
CommentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name avatar'
  });
  
  next();
});

// Middleware to exclude deleted comments from query results
CommentSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Static method to get all root comments for a blog
CommentSchema.statics.getRootComments = function(blogId) {
  return this.find({
    blog: blogId,
    parentComment: null
  })
    .sort('-createdAt')
    .populate({
      path: 'replies',
      options: { sort: { createdAt: 1 } }
    });
};

// Instance method to check if a user has liked this comment
CommentSchema.methods.isLikedByUser = function(userId) {
  return this.likes.some(like => like.toString() === userId.toString());
};

// Instance method to toggle like status for a user
CommentSchema.methods.toggleLike = function(userId) {
  if (this.isLikedByUser(userId)) {
    // Remove like
    this.likes = this.likes.filter(like => like.toString() !== userId.toString());
  } else {
    // Add like
    this.likes.push(userId);
  }
  
  this.likesCount = this.likes.length;
  return this.save();
};

// Instance method to soft delete a comment
CommentSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = 'This comment has been deleted';
  return this.save();
};

// Post save hook to update comment count on the blog
CommentSchema.post('save', async function() {
  try {
    // Import Blog model here to avoid circular dependencies
    const Blog = mongoose.model('Blog');
    
    // Update the commentsCount on the blog document
    const commentsCount = await this.constructor.countDocuments({ blog: this.blog, isDeleted: { $ne: true } });
    
    await Blog.findByIdAndUpdate(this.blog, { commentsCount });
  } catch (err) {
    console.error('Error updating blog comment count:', err);
  }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment; 