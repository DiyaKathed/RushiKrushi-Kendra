const mongoose = require('mongoose');

const contactEnquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  subject: {
    type: String,
    required: [true, 'Please specify the subject'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Please provide your message or question'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ContactEnquiry', contactEnquirySchema);
