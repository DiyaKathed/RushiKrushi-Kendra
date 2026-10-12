const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/articles
// @desc    Get all published educational articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { titleEn: searchRegex },
        { titleMr: searchRegex },
        { summaryEn: searchRegex },
        { summaryMr: searchRegex },
      ];
    }

    const articles = await Article.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching articles' });
  }
});

// @route   GET /api/articles/admin/all
// @desc    Admin: get all articles including drafts
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const articles = await Article.find().sort({ updatedAt: -1 });
    res.json({ success: true, count: articles.length, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/articles/:slugOrId
// @desc    Get single article
// @access  Public
router.get('/:slugOrId', async (req, res) => {
  try {
    const param = req.params.slugOrId;
    let article;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(param);
    } else {
      article = await Article.findOne({ slug: param });
    }

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const related = await Article.find({
      category: article.category,
      _id: { $ne: article._id },
      status: 'published',
    }).limit(3);

    res.json({
      success: true,
      article,
      related,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching article' });
  }
});

// @route   POST /api/articles
// @desc    Create new article
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json({ success: true, article });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, article });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
