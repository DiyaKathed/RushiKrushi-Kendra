const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all published products with search and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, brand, company, availability, featured, page = 1, limit = 50 } = req.query;

    const query = {
      status: 'published',
      isArchived: { $ne: true },
    };

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

    // Support company as an alias for brand
    const selectedBrand = (company || brand || '').trim();
    if (selectedBrand && selectedBrand !== 'All') {
      query.brand = selectedBrand;
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

    // Also fetch unique categories and brands for filter dropdowns from active, published products only
    const categories = await Product.distinct('category', { status: 'published', isArchived: { $ne: true } });
    const brands = await Product.distinct('brand', { status: 'published', isArchived: { $ne: true } });

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
// @desc    Admin: get all products including drafts and archived
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, category, brand, company, status } = req.query;
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

    // Support company as an alias for brand in admin API
    const selectedBrand = (company || brand || '').trim();
    if (selectedBrand && selectedBrand !== 'All') {
      query.brand = selectedBrand;
    }

    if (status && status !== 'All') {
      if (status === 'archived') {
        query.$or = [{ status: 'archived' }, { isArchived: true }];
      } else if (status === 'published') {
        query.status = 'published';
        query.isArchived = { $ne: true };
      } else {
        query.status = status;
      }
    }

    const products = await Product.find(query).sort({ updatedAt: -1 });
    const brands = await Product.distinct('brand');
    const categories = await Product.distinct('category');
    const totalCount = await Product.countDocuments();
    const publishedCount = await Product.countDocuments({ status: 'published', isArchived: { $ne: true } });
    const archivedCount = await Product.countDocuments({ $or: [{ status: 'archived' }, { isArchived: true }] });
    const draftCount = await Product.countDocuments({ status: 'draft', isArchived: { $ne: true } });

    res.json({
      success: true,
      count: products.length,
      brands,
      categories,
      stats: {
        total: totalCount,
        published: publishedCount,
        archived: archivedCount,
        draft: draftCount,
      },
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/:slugOrId
// @desc    Get single product by slug or MongoDB ID (with admin bypass for archived/drafts)
// @access  Public (Published only) / Private (Admin)
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

    // Exclude archived and draft products from public access unless requested by an authenticated admin
    if (product.status !== 'published' || product.isArchived) {
      let isAdmin = false;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const jwt = require('jsonwebtoken');
          const { getJwtSecret } = require('../config/jwt');
          const decoded = jwt.verify(token, getJwtSecret());
          const User = require('../models/User');
          const user = await User.findById(decoded.id);
          if (user && user.role === 'admin') {
            isAdmin = true;
          }
        } catch (authErr) {
          isAdmin = false;
        }
      }

      if (!isAdmin) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
    }

    // Find related products in the same category (only active published products)
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'published',
      isArchived: { $ne: true },
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
    const payload = { ...req.body };

    // Support company as an alias for brand
    if (!payload.brand && payload.company) {
      payload.brand = payload.company;
    }

    // Fallback nameMr to nameEn if omitted
    if (!payload.nameMr && payload.nameEn) {
      payload.nameMr = payload.nameEn;
    }

    // Sync price and indicativePrice if one is missing
    if (payload.price !== undefined && payload.price !== null && payload.price !== '') {
      const numericPrice = Number(payload.price);
      if (!isNaN(numericPrice)) {
        payload.price = numericPrice;
        if (!payload.indicativePrice) {
          payload.indicativePrice = `₹${numericPrice}`;
        }
      }
    }

    // Availability sync for new products when stockQuantity is explicitly passed
    if (payload.stockQuantity !== undefined && payload.stockQuantity !== null && payload.stockQuantity !== '') {
      const qty = Number(payload.stockQuantity);
      payload.stockQuantity = isNaN(qty) ? 0 : Math.max(0, qty);
      if (!payload.availability) {
        payload.availability = payload.stockQuantity > 0 ? 'in_stock' : 'out_of_stock';
      }
    }

    const product = await Product.create(payload);
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
    const payload = { ...req.body };

    // Support company as an alias for brand
    if (!payload.brand && payload.company) {
      payload.brand = payload.company;
    }

    // Fallback nameMr to nameEn if omitted
    if (!payload.nameMr && payload.nameEn) {
      payload.nameMr = payload.nameEn;
    }

    // Sync price and indicativePrice if one is missing
    if (payload.price !== undefined && payload.price !== null && payload.price !== '') {
      const numericPrice = Number(payload.price);
      if (!isNaN(numericPrice)) {
        payload.price = numericPrice;
        if (!payload.indicativePrice) {
          payload.indicativePrice = `₹${numericPrice}`;
        }
      }
    }

    // Availability sync when stockQuantity is explicitly passed without explicit availability
    if (payload.stockQuantity !== undefined && payload.stockQuantity !== null && payload.stockQuantity !== '') {
      const qty = Number(payload.stockQuantity);
      payload.stockQuantity = isNaN(qty) ? 0 : Math.max(0, qty);
      if (!payload.availability) {
        payload.availability = payload.stockQuantity > 0 ? 'in_stock' : 'out_of_stock';
      }
    }

    if (payload.status === 'archived' || payload.isArchived === true) {
      payload.status = 'archived';
      payload.isArchived = true;
      if (!payload.archivedAt) payload.archivedAt = new Date();
    } else if (payload.status === 'published' || payload.status === 'draft') {
      payload.isArchived = false;
      payload.archivedAt = null;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
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

// @route   PATCH /api/products/:id/archive
// @desc    Admin: archive a product
// @access  Private (Admin)
router.patch('/:id/archive', protect, authorize('admin'), async (req, res) => {
  try {
    const reason = req.body?.reason || 'Archived by administrator';
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        status: 'archived',
        isArchived: true,
        archivedAt: new Date(),
        archivedReason: reason,
      },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product archived successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/products/:id/restore
// @desc    Admin: restore an archived product to published
// @access  Private (Admin)
router.patch('/:id/restore', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        status: 'published',
        isArchived: false,
        archivedAt: null,
      },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product restored successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
