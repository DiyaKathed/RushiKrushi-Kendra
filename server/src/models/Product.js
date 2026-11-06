const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: [true, 'Please provide English product name'],
    trim: true,
  },
  nameMr: {
    type: String,
    trim: true,
    default: '',
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
    index: true,
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
  variants: [{
    packSize: {
      type: String,
      trim: true,
    },
    mrp: {
      type: Number,
      default: null,
      min: [0, 'MRP cannot be negative'],
    },
    regularInvoicePrice: {
      type: Number,
      default: null,
      min: [0, 'Regular invoice price cannot be negative'],
    },
    packInCarton: {
      type: Number,
      default: null,
    },
    cartonWeightKg: {
      type: Number,
      default: null,
    },
    cartonBillingPrice: {
      type: Number,
      default: null,
    },
    sourcePage: {
      type: Number,
      default: null,
    },
    sourceCategory: {
      type: String,
      default: '',
    },
  }],
  stockQuantity: {
    type: Number,
    default: null,
    min: [0, 'Stock quantity cannot be negative'],
  },
  price: {
    type: Number,
    default: null,
    min: [0, 'Price cannot be negative'],
  },
  regularInvoicePrice: {
    type: Number,
    default: null,
    min: [0, 'Regular invoice price cannot be negative'],
  },
  indicativePrice: {
    type: String,
    default: '',
  },
  priceListDate: {
    type: String,
    default: '',
    trim: true,
  },
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
    enum: ['published', 'draft', 'archived'],
    default: 'published',
    index: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  archivedReason: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Support company as virtual alias for brand
productSchema.virtual('company')
  .get(function () {
    return this.brand;
  })
  .set(function (val) {
    this.brand = val;
  });

// Pre-validate hook: safe nameMr fallback to nameEn and company fallback to brand
productSchema.pre('validate', function (next) {
  if ((!this.nameMr || this.nameMr.trim() === '') && this.nameEn) {
    this.nameMr = this.nameEn.trim();
  }
  if ((!this.brand || this.brand.trim() === '') && this.company) {
    this.brand = this.company.trim();
  }
  next();
});

// Generate slug before saving and safely synchronize availability with stockQuantity
productSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('nameEn')) {
    this.slug = this.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
  }

  // Automatically synchronize availability with stockQuantity when stockQuantity is explicitly modified
  // while ensuring existing products without stockQuantity are not accidentally marked out of stock.
  if (this.isModified('stockQuantity') && !this.isModified('availability')) {
    if (this.stockQuantity > 0 && this.availability !== 'seasonal') {
      this.availability = 'in_stock';
    } else if (this.stockQuantity === 0 && !this.isNew && this.availability === 'in_stock') {
      this.availability = 'out_of_stock';
    }
  }

  // Synchronize status and isArchived
  if (this.isModified('status')) {
    if (this.status === 'archived') {
      this.isArchived = true;
      if (!this.archivedAt) this.archivedAt = new Date();
    } else if (this.isArchived) {
      this.isArchived = false;
      this.archivedAt = null;
    }
  } else if (this.isModified('isArchived')) {
    if (this.isArchived) {
      this.status = 'archived';
      if (!this.archivedAt) this.archivedAt = new Date();
    } else if (this.status === 'archived') {
      this.status = 'published';
      this.archivedAt = null;
    }
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);
