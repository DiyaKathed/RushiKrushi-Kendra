const express = require('express');
const router = express.Router();
const FarmerCrop = require('../models/FarmerCrop');
const Crop = require('../models/Crop');
const { protect } = require('../middleware/auth');

// All routes here require authentication
router.use(protect);

// @route   GET /api/farmer-crops
// @desc    Get all crops owned by authenticated farmer
// @access  Private (Farmer)
router.get('/', async (req, res) => {
  try {
    const crops = await FarmerCrop.find({ user: req.user._id })
      .populate('cropRef', 'nameEn nameMr slug category imageUrl')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: crops.length,
      crops,
    });
  } catch (error) {
    console.error('Fetch farmer crops error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching crop records' });
  }
});

// @route   GET /api/farmer-crops/:id
// @desc    Get single crop record by ID (enforce owner)
// @access  Private (Farmer)
router.get('/:id', async (req, res) => {
  try {
    const crop = await FarmerCrop.findOne({
      _id: req.params.id,
      user: req.user._id, // Strict ownership check
    }).populate('cropRef');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found or not authorized',
      });
    }

    // Try finding matching crop guide for advice
    let cropGuide = null;
    if (crop.cropRef) {
      cropGuide = crop.cropRef;
    } else {
      cropGuide = await Crop.findOne({
        $or: [
          { nameEn: new RegExp(crop.cropName, 'i') },
          { nameMr: new RegExp(crop.cropName, 'i') }
        ]
      });
    }

    res.json({
      success: true,
      crop,
      cropGuide,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching crop record' });
  }
});

// @route   POST /api/farmer-crops
// @desc    Add a new crop record
// @access  Private (Farmer)
router.post('/', async (req, res) => {
  try {
    const {
      cropName,
      cropRef,
      variety,
      status,
      sowingDate,
      farmArea,
      soilType,
      irrigationMethod,
      growthStage,
      visibleProblems,
      notes,
      photoUrl,
    } = req.body;

    if (!cropName || cropName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a crop name',
      });
    }

    // If cropRef was not passed, see if there's a matching crop guide
    let matchedRef = cropRef;
    if (!matchedRef) {
      const match = await Crop.findOne({
        $or: [
          { nameEn: new RegExp(cropName.trim(), 'i') },
          { nameMr: new RegExp(cropName.trim(), 'i') }
        ]
      });
      if (match) matchedRef = match._id;
    }

    const newCrop = await FarmerCrop.create({
      user: req.user._id,
      cropName,
      cropRef: matchedRef || undefined,
      variety: variety || '',
      status: status || 'Growing',
      sowingDate: sowingDate || Date.now(),
      farmArea: farmArea || req.user.farmArea || '',
      soilType: soilType || req.user.soilType || '',
      irrigationMethod: irrigationMethod || req.user.irrigationMethod || '',
      growthStage: growthStage || 'Germination / Seedling',
      visibleProblems: visibleProblems || '',
      notes: notes || '',
      photoUrl: photoUrl || '',
    });

    res.status(201).json({
      success: true,
      crop: newCrop,
    });
  } catch (error) {
    console.error('Create farmer crop error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/farmer-crops/:id
// @desc    Update crop record (enforce owner)
// @access  Private (Farmer)
router.put('/:id', async (req, res) => {
  try {
    const crop = await FarmerCrop.findOne({
      _id: req.params.id,
      user: req.user._id, // Strict ownership check
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found or not authorized',
      });
    }

    const updated = await FarmerCrop.findByIdAndUpdate(
      req.params.id,
      { ...req.body, user: req.user._id }, // Prevent changing user owner
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      crop: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/farmer-crops/:id
// @desc    Delete crop record (enforce owner)
// @access  Private (Farmer)
router.delete('/:id', async (req, res) => {
  try {
    const crop = await FarmerCrop.findOne({
      _id: req.params.id,
      user: req.user._id, // Strict ownership check
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found or not authorized',
      });
    }

    await FarmerCrop.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Crop record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
