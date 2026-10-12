const mongoose = require('mongoose');

const farmerCropSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  cropName: {
    type: String,
    required: [true, 'Please specify the crop name'],
    trim: true,
  },
  cropRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
  },
  variety: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['Planning', 'Growing', 'Harvested'],
    default: 'Growing',
    index: true,
  },
  sowingDate: {
    type: Date,
    default: Date.now,
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
  growthStage: {
    type: String,
    trim: true,
    default: 'Vegetative',
  },
  visibleProblems: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  photoUrl: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FarmerCrop', farmerCropSchema);
