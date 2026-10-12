const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/crops
// @desc    Get all published crop guides with search and category filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = { status: 'published' };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { nameEn: searchRegex },
        { nameMr: searchRegex },
        { seasons: searchRegex },
      ];
    }

    if (category && category !== 'All' && category.trim() !== '') {
      query.category = category;
    }

    const crops = await Crop.find(query).sort({ nameEn: 1 });

    res.json({
      success: true,
      count: crops.length,
      crops,
    });
  } catch (error) {
    console.error('Fetch crops error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching crop guides' });
  }
});

// @route   GET /api/crops/admin/all
// @desc    Admin: get all crop guides including drafts
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const crops = await Crop.find().sort({ updatedAt: -1 });
    res.json({ success: true, count: crops.length, crops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/crops/:slugOrId
// @desc    Get single crop cultivation guide
// @access  Public
router.get('/:slugOrId', async (req, res) => {
  try {
    const param = req.params.slugOrId;
    let crop;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      crop = await Crop.findById(param);
    } else {
      crop = await Crop.findOne({ slug: param });
    }

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop guide not found' });
    }

    // Find related products matching crop name
    const relatedProducts = await Product.find({
      status: 'published',
      $or: [
        { applicableCrops: new RegExp(crop.nameEn, 'i') },
        { category: { $in: crop.relatedProductCategories || ['Seeds', 'Fertilizers', 'Crop Protection'] } }
      ]
    }).limit(6);

    res.json({
      success: true,
      crop,
      relatedProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching crop details' });
  }
});

// @route   POST /api/crops
// @desc    Create new crop guide
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const crop = await Crop.create(req.body);
    res.status(201).json({ success: true, crop });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/crops/:id
// @desc    Update crop guide
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop guide not found' });
    }
    res.json({ success: true, crop });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Delete crop guide
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop guide not found' });
    }
    res.json({ success: true, message: 'Crop guide deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
