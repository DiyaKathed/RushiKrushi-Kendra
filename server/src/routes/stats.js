const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Crop = require('../models/Crop');
const Article = require('../models/Article');
const User = require('../models/User');
const ContactEnquiry = require('../models/ContactEnquiry');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/stats
// @desc    Admin: get summary metrics for admin dashboard
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalProducts,
      publishedProducts,
      draftProducts,
      totalCrops,
      publishedCrops,
      totalArticles,
      publishedArticles,
      totalFarmers,
      totalEnquiries,
      pendingEnquiries,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'published' }),
      Product.countDocuments({ status: 'draft' }),
      Crop.countDocuments(),
      Crop.countDocuments({ status: 'published' }),
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      User.countDocuments({ role: 'farmer' }),
      ContactEnquiry.countDocuments(),
      ContactEnquiry.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        publishedProducts,
        draftProducts,
        totalCrops,
        publishedCrops,
        totalArticles,
        publishedArticles,
        totalFarmers,
        totalEnquiries,
        pendingEnquiries,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
