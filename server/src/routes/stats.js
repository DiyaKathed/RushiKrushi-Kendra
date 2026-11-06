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
    const totalProducts = await Product.countDocuments();
    const publishedProducts = await Product.countDocuments({ status: 'published', isArchived: { $ne: true } });
    const draftProducts = await Product.countDocuments({ status: 'draft', isArchived: { $ne: true } });
    const archivedProducts = await Product.countDocuments({ $or: [{ status: 'archived' }, { isArchived: true }] });

    const totalCrops = await Crop.countDocuments();
    const publishedCrops = await Crop.countDocuments({ status: 'published' });

    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: 'published' });

    const totalFarmers = await User.countDocuments({ role: 'farmer' });

    const totalEnquiries = await ContactEnquiry.countDocuments();
    const pendingEnquiries = await ContactEnquiry.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: {
        totalProducts,
        publishedProducts,
        draftProducts,
        archivedProducts,
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
