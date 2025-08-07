const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort('order name')
      .select('name slug description color movieCount order');
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin only)
exports.createCategory = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    
    const category = await Category.create(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error(error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        status: 'error',
        message: `Category with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    req.body.updatedBy = req.user._id;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error(error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        status: 'error',
        message: `Category with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    // Check if category has movies
    if (category.movieCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category that has movies. Please move or delete the movies first.'
      });
    }
    
    await category.remove();
    
    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Update category order
// @route   PUT /api/categories/reorder
// @access  Private (Admin only)
exports.reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        status: 'error',
        message: 'Categories array is required'
      });
    }
    
    // Update order for each category
    const updatePromises = categories.map((cat, index) => {
      return Category.findByIdAndUpdate(
        cat.id,
        { order: index + 1, updatedBy: req.user._id },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    // Get updated categories
    const updatedCategories = await Category.find({ isActive: true })
      .sort('order name')
      .select('name slug description color movieCount order');
    
    res.status(200).json({
      status: 'success',
      message: 'Categories reordered successfully',
      data: {
        categories: updatedCategories
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Toggle category active status
// @route   PUT /api/categories/:id/toggle-active
// @access  Private (Admin only)
exports.toggleCategoryActive = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    category.isActive = !category.isActive;
    category.updatedBy = req.user._id;
    await category.save();
    
    res.status(200).json({
      status: 'success',
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        category
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Private (Admin only)
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Category.aggregate([
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          activeCategories: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveCategories: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          totalMovieCount: { $sum: '$movieCount' },
          avgMovieCount: { $avg: '$movieCount' }
        }
      }
    ]);
    
    const topCategories = await Category.find({ isActive: true })
      .sort('-movieCount')
      .limit(5)
      .select('name slug movieCount');
    
    res.status(200).json({
      status: 'success',
      data: {
        stats: stats[0] || {
          totalCategories: 0,
          activeCategories: 0,
          inactiveCategories: 0,
          totalMovieCount: 0,
          avgMovieCount: 0
        },
        topCategories
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};
