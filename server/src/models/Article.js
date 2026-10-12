const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  titleEn: {
    type: String,
    required: [true, 'Please provide English title'],
    trim: true,
  },
  titleMr: {
    type: String,
    required: [true, 'Please provide Marathi title'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, 'Please specify article category'],
    enum: [
      'Fertilizer Management',
      'Crop Protection',
      'Soil Health',
      'Seasonal Advisory',
      'Irrigation Practices',
      'Organic Practices'
    ],
    index: true,
  },
  summaryEn: {
    type: String,
    default: '',
  },
  summaryMr: {
    type: String,
    default: '',
  },
  contentEn: {
    type: String,
    required: [true, 'Please provide English content'],
  },
  contentMr: {
    type: String,
    required: [true, 'Please provide Marathi content'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
  sourceReferences: {
    type: String,
    default: 'ICAR / MPKV Rahuri Agronomy Department',
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published',
    index: true,
  },
}, {
  timestamps: true,
});

articleSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('titleEn')) {
    this.slug = this.titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);
