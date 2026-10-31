const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const ContactEnquiry = require('../models/ContactEnquiry');
const { protect, authorize } = require('../middleware/auth');

// Dedicated rate limiter for public enquiry submissions:
// Allows up to 10 submissions per 15 minutes per IP. This allows legitimate farmers plenty
// of flexibility to submit questions while blocking automated spam bots.
const enquirySubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 enquiry submissions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many enquiry submissions from this connection. Please wait 15 minutes before submitting again.',
  },
});

// @route   POST /api/enquiries
// @desc    Submit customer enquiry from contact form
// @access  Public
router.post('/', enquirySubmissionLimiter, async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile number, subject, and message are required',
      });
    }

    const enquiry = await ContactEnquiry.create({
      name,
      phone,
      email: email || '',
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      enquiryId: enquiry._id,
    });
  } catch (error) {
    console.error('Enquiry submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing enquiry',
    });
  }
});

// @route   GET /api/enquiries
// @desc    Admin: get all enquiries
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const enquiries = await ContactEnquiry.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/enquiries/:id/status
// @desc    Admin: update enquiry status
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await ContactEnquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, enquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/enquiries/:id
// @desc    Admin: delete enquiry
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const enquiry = await ContactEnquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
