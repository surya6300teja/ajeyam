const mongoose = require('mongoose');
const Category = require('../models/Category');
const Blog = require('../models/Blog');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    let query = {};
    
    // Admin can see all categories, users only see active ones
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }
    
    // Filter by parent category (null means main categories)
    if (req.query.parent === 'null' || req.query.parent === 'main') {
      query.parentCategory = null;
    } else if (req.query.parent) {
      query.parentCategory = req.query.parent;
    }
    
    // Execute query
    const categories = await Category.find(query).sort('order');
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get main categories with subcategories
exports.getMainCategoriesWithSubs = async (req, res) => {
  try {
    const mainCategories = await Category.getMainCategories();
    
    // Populate subcategories for each main category
    const categoriesWithSubs = await Promise.all(
      mainCategories.map(async (category) => {
        return await Category.getCategoryWithSubcategories(category._id);
      })
    );
    
    res.status(200).json({
      status: 'success',
      results: categoriesWithSubs.length,
      data: { categories: categoriesWithSubs }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single category by ID or slug
exports.getCategory = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let category;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      category = await Category.findById(identifier);
    } else {
      category = await Category.findOne({ slug: identifier });
    }
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    // Get subcategories and blogs count
    await category.populate('subcategories');
    await category.populate('blogsCount');
    
    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create a new category (admin only)
exports.createCategory = async (req, res) => {
  try {
    // Check if parent category exists
    if (req.body.parentCategory) {
      const parentExists = await Category.findById(req.body.parentCategory);
      
      if (!parentExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Parent category not found'
        });
      }
    }
    
    const newCategory = await Category.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { category: newCategory }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    // Check if parent category exists and isn't the category itself
    if (req.body.parentCategory) {
      if (req.body.parentCategory === req.params.id) {
        return res.status(400).json({
          status: 'error',
          message: 'Category cannot be its own parent'
        });
      }
      
      const parentExists = await Category.findById(req.body.parentCategory);
      
      if (!parentExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Parent category not found'
        });
      }
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: { category: updatedCategory }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    // Check if category has subcategories
    const subcategories = await Category.find({ parentCategory: req.params.id });
    
    if (subcategories.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category with subcategories. Please reassign or delete subcategories first.'
      });
    }
    
    // Check if category has blogs
    const hasBlogsCount = await Blog.countDocuments({ category: req.params.id });
    
    if (hasBlogsCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category with blogs. Please reassign or delete blogs first.'
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
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

// Get blogs by category
exports.getBlogsByCategory = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Find category by ID or slug
    let category;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      category = await Category.findById(identifier);
    } else {
      category = await Category.findOne({ slug: identifier });
    }
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    // Get subcategories to include their blogs too
    await category.populate('subcategories');
    const subcategoryIds = category.subcategories.map(sub => sub._id);
    
    // Include the main category and all its subcategories
    const categoryIds = [category._id, ...subcategoryIds];
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Find blogs in these categories
    const blogs = await Blog.find({
      category: { $in: categoryIds },
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Blog.countDocuments({
      category: { $in: categoryIds },
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
      data: { 
        category,
        blogs 
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 