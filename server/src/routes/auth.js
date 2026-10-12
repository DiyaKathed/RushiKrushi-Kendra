const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'rushikrushi_jwt_secret_dev_key_2026',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new farmer account
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      village,
      taluka,
      district,
      farmArea,
      soilType,
      irrigationMethod,
      preferredLanguage,
    } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, 10-digit mobile number, and password are required',
      });
    }

    // Check if phone already registered
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already registered. Please sign in.',
      });
    }

    // Check email if provided
    if (email && email.trim() !== '') {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'This email address is already in use.',
        });
      }
    }

    const user = await User.create({
      name,
      phone,
      email: email ? email.toLowerCase().trim() : undefined,
      password,
      role: 'farmer',
      village: village || '',
      taluka: taluka || 'Ambegaon',
      district: district || 'Pune',
      farmArea: farmArea || '',
      soilType: soilType || '',
      irrigationMethod: irrigationMethod || '',
      preferredLanguage: preferredLanguage || 'en',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        village: user.village,
        taluka: user.taluka,
        district: user.district,
        farmArea: user.farmArea,
        soilType: user.soilType,
        irrigationMethod: user.irrigationMethod,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user (farmer or admin) & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number or email, and password',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Query by either phone or email
    const user = await User.findOne({
      $or: [
        { phone: identifier.trim() },
        { email: cleanIdentifier }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile/email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile/email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        village: user.village,
        taluka: user.taluka,
        district: user.district,
        farmArea: user.farmArea,
        soilType: user.soilType,
        irrigationMethod: user.irrigationMethod,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user details
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      email: req.user.email,
      role: req.user.role,
      preferredLanguage: req.user.preferredLanguage,
      village: req.user.village,
      taluka: req.user.taluka,
      district: req.user.district,
      farmArea: req.user.farmArea,
      soilType: req.user.soilType,
      irrigationMethod: req.user.irrigationMethod,
    },
  });
});

// @route   PUT /api/auth/profile
// @desc    Update farmer profile information
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      name,
      preferredLanguage,
      village,
      taluka,
      district,
      farmArea,
      soilType,
      irrigationMethod,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (village !== undefined) user.village = village;
    if (taluka !== undefined) user.taluka = taluka;
    if (district !== undefined) user.district = district;
    if (farmArea !== undefined) user.farmArea = farmArea;
    if (soilType !== undefined) user.soilType = soilType;
    if (irrigationMethod !== undefined) user.irrigationMethod = irrigationMethod;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        village: user.village,
        taluka: user.taluka,
        district: user.district,
        farmArea: user.farmArea,
        soilType: user.soilType,
        irrigationMethod: user.irrigationMethod,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset instructions
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Please provide registered phone number or email',
    });
  }

  const user = await User.findOne({
    $or: [
      { phone: identifier.trim() },
      { email: identifier.trim().toLowerCase() }
    ]
  });

  if (!user) {
    // For privacy, return generic message
    return res.json({
      success: true,
      message: 'If the provided account exists, instructions have been logged/dispatched.',
    });
  }

  // Generate temporary 6-digit verification code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = resetCode;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  console.log(`[Security/Dev Notice] Password Reset Code for ${identifier}: ${resetCode}`);

  res.json({
    success: true,
    message: 'Password reset code generated and dispatched.',
    devCode: process.env.NODE_ENV !== 'production' ? resetCode : undefined,
  });
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using reset code
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { identifier, resetCode, newPassword } = req.body;
  if (!identifier || !resetCode || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Identifier, reset code, and new password are required',
    });
  }

  const user = await User.findOne({
    $or: [
      { phone: identifier.trim() },
      { email: identifier.trim().toLowerCase() }
    ],
    resetPasswordToken: resetCode,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired password reset code',
    });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password has been successfully reset. Please sign in.',
  });
});

module.exports = router;
