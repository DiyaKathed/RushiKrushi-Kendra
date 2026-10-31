const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getJwtSecret } = require('../config/jwt');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Dedicated Rate Limiters for Password Reset endpoints
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 reset requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    message: 'Too many password reset requests from this IP. Please try again after 15 minutes.',
  },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 reset verification attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    message: 'Too many reset verification attempts from this IP. Please try again after 15 minutes.',
  },
});

const generateToken = (id) => {
  return jwt.sign(
    { id },
    getJwtSecret(),
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
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registered phone number or email',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { phone: identifier.trim() },
        { email: cleanIdentifier },
      ],
    });

    const GENERIC_RESPONSE = 'If the provided account exists and has a valid email, password reset instructions have been sent.';

    // Privacy & anti-enumeration: return identical generic message if user not found or has no email
    if (!user || !user.email) {
      return res.json({
        success: true,
        message: GENERIC_RESPONSE,
      });
    }

    // Account-level throttling: if reset code was already requested within last 60s, don't re-send email
    if (user.resetPasswordExpire && (new Date(user.resetPasswordExpire).getTime() - Date.now() > 14 * 60 * 1000)) {
      return res.json({
        success: true,
        message: GENERIC_RESPONSE,
      });
    }

    // Cryptographically secure 6-digit code generator (100000 - 999999)
    const resetCode = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    // 15-minute expiry & reset attempts
    user.resetPasswordToken = hashedCode;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    user.resetPasswordAttempts = 0;
    await user.save();

    // Deliver email via Nodemailer
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetCode,
      });
    } catch (emailError) {
      // In production: fail safely if email delivery is unavailable; do not silently pretend an email was sent
      if (process.env.NODE_ENV === 'production') {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.resetPasswordAttempts = 0;
        await user.save();

        console.error('[Auth Error] Failed to deliver password reset email in production.');
        return res.status(503).json({
          success: false,
          message: 'Password reset service is temporarily unavailable. Please try again later.',
        });
      }

      console.warn(`[Auth Dev Warning] Mock email delivery error: ${emailError.message}`);
    }

    const responsePayload = {
      success: true,
      message: GENERIC_RESPONSE,
    };

    // Development-only code for testing/local dev (Strictly forbidden when NODE_ENV=production)
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.devCode = resetCode;
      console.log(`[Security/Dev Notice] Password Reset Code generated for testing.`);
    }

    return res.json(responsePayload);
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing password reset request',
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using reset code
// @access  Public
router.post('/reset-password', resetPasswordLimiter, async (req, res) => {
  try {
    const { identifier, resetCode, newPassword } = req.body;
    if (!identifier || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Identifier, reset code, and new password are required',
      });
    }

    const trimmedCode = typeof resetCode === 'string' ? resetCode.trim() : String(resetCode);
    if (!/^\d{6}$/.test(trimmedCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code format. Must be a 6-digit code.',
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { phone: identifier.trim() },
        { email: cleanIdentifier },
      ],
    });

    if (!user || !user.resetPasswordToken || !user.resetPasswordExpire) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset code',
      });
    }

    // Check account-level lockout (5 failed attempts)
    if ((user.resetPasswordAttempts || 0) >= 5) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      user.resetPasswordAttempts = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Too many failed verification attempts. Please request a new password reset code.',
      });
    }

    // Check 15-minute expiration
    if (new Date(user.resetPasswordExpire).getTime() < Date.now()) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      user.resetPasswordAttempts = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Password reset code has expired. Please request a new one.',
      });
    }

    // SHA-256 hash incoming code and verify against stored hash
    const hashedCode = crypto.createHash('sha256').update(trimmedCode).digest('hex');

    // Reject old plaintext tokens or non-64-character hex tokens
    const isStoredHashValid = typeof user.resetPasswordToken === 'string' && /^[0-9a-f]{64}$/i.test(user.resetPasswordToken);
    const isMatch = isStoredHashValid && crypto.timingSafeEqual(
      Buffer.from(user.resetPasswordToken, 'hex'),
      Buffer.from(hashedCode, 'hex')
    );

    if (!isMatch) {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      if (user.resetPasswordAttempts >= 5) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.resetPasswordAttempts = 0;
        await user.save();

        return res.status(400).json({
          success: false,
          message: 'Too many failed verification attempts. This reset code has been invalidated for security.',
        });
      }

      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset code',
      });
    }

    // Success: single-use invalidation and password update
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordAttempts = 0;
    await user.save();

    return res.json({
      success: true,
      message: 'Password has been successfully reset. Please sign in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset',
    });
  }
});

router.forgotPasswordLimiter = forgotPasswordLimiter;
router.resetPasswordLimiter = resetPasswordLimiter;

module.exports = router;

