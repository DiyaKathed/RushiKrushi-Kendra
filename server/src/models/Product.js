const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: [true, 'Please provide English product name'],
    trim: true,
  },
  nameMr: {
    type: String,
    required: [true, 'Please provide Marathi product name'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  brand: {
    type: String,
    required: [true, 'Please provide product brand / manufacturer'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please select product category'],
    enum: [
      'Seeds',
      'Fertilizers',
      'Micronutrients',
      'Biofertilizers',
      'Insecticides',
      'Fungicides',
      'Herbicides',
      'Plant Growth Promoters',
      'Organic Inputs',
      'Farming Tools',
      'Spray Pumps',
      'Irrigation Accessories',
      'Other'
    ],
    index: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  descriptionEn: {
    type: String,
    default: '',
  },
  descriptionMr: {
    type: String,
    default: '',
  },
  packSizes: [{
    type: String,
    trim: true,
  }],
  technicalComposition: {
    type: String,
    trim: true,
    default: '',
  },
  applicableCrops: [{
    type: String,
    trim: true,
  }],
  intendedUse: {
    type: String,
    default: '',
  },
  dosage: {
    type: String,
    default: '',
  },
  safetyPrecautionsEn: {
    type: String,
    default: '',
  },
  safetyPrecautionsMr: {
    type: String,
    default: '',
  },
  manufacturer: {
    type: String,
    default: '',
  },
  indicativePrice: {
    type: String,
    default: '',
  },
  availability: {
    type: String,
    enum: ['in_stock', 'out_of_stock', 'seasonal'],
    default: 'in_stock',
    index: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
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

// Generate slug before saving
productSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('nameEn')) {
    this.slug = this.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
