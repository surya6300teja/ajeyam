const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A category must have a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a category description'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    imageUrl: {
      type: String
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    order: {
      type: Number,
      default: 0 // For sorting categories
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for blogs count in this category
CategorySchema.virtual('blogsCount', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual field for subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Create slug from name before saving
CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// When a category is queried, populate parentCategory
CategorySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'parentCategory',
    select: 'name slug'
  });
  next();
});

// Static method to get all main categories (with no parent)
CategorySchema.statics.getMainCategories = function() {
  return this.find({ parentCategory: null, isActive: true }).sort('order');
};

// Static method to get a category with its subcategories
CategorySchema.statics.getCategoryWithSubcategories = async function(categoryId) {
  const category = await this.findById(categoryId);
  
  if (!category) return null;
  
  await category.populate({
    path: 'subcategories',
    match: { isActive: true },
    options: { sort: { order: 1 } }
  });
  
  return category;
};

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category; 