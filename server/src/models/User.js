const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide a valid 10-digit mobile number'],
    trim: true,
    index: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['farmer', 'admin'],
    default: 'farmer',
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'mr'],
    default: 'en',
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  village: {
    type: String,
    trim: true,
    default: '',
  },
  taluka: {
    type: String,
    trim: true,
    default: 'Ambegaon',
  },
  district: {
    type: String,
    trim: true,
    default: 'Pune',
  },
  farmArea: {
    type: String,
    trim: true,
    default: '',
  },
  soilType: {
    type: String,
    trim: true,
    default: '',
  },
  irrigationMethod: {
    type: String,
    trim: true,
    default: '',
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  resetPasswordAttempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
