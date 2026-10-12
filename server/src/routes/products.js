const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all published products with search and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, brand, availability, featured, page = 1, limit = 50 } = req.query;

    const query = { status: 'published' };

    // Search query matches nameEn, nameMr, brand, or technicalComposition
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { nameEn: searchRegex },
        { nameMr: searchRegex },
        { brand: searchRegex },
        { technicalComposition: searchRegex },
        { applicableCrops: searchRegex },
      ];
    }

    if (category && category !== 'All' && category.trim() !== '') {
      query.category = category;
    }

    if (brand && brand !== 'All' && brand.trim() !== '') {
      query.brand = brand;
    }

    if (availability && availability !== 'All' && availability.trim() !== '') {
      query.availability = availability;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Also fetch unique categories and brands for filter dropdowns
    const categories = await Product.distinct('category', { status: 'published' });
    const brands = await Product.distinct('brand', { status: 'published' });

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      categories,
      brands,
      products,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
});

// @route   GET /api/products/admin/all
// @desc    Admin: get all products including drafts
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { nameEn: searchRegex },
        { nameMr: searchRegex },
        { brand: searchRegex },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const products = await Product.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/:slugOrId
// @desc    Get single product by slug or MongoDB ID
// @access  Public
router.get('/:slugOrId', async (req, res) => {
  try {
    const param = req.params.slugOrId;
    let product;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(param);
    } else {
      product = await Product.findOne({ slug: param });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find related products in the same category
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'published',
    }).limit(4);

    res.json({
      success: true,
      product,
      related,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching product details' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update existing product
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
