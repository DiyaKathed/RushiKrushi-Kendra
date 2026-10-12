const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: [true, 'Please provide English crop name'],
    trim: true,
  },
  nameMr: {
    type: String,
    required: [true, 'Please provide Marathi crop name'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, 'Please select crop category'],
    enum: ['Field', 'Vegetable', 'Fruit'],
    index: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  seasons: [{
    type: String,
    trim: true,
  }],
  introEn: { type: String, default: '' },
  introMr: { type: String, default: '' },
  climateEn: { type: String, default: '' },
  climateMr: { type: String, default: '' },
  temperatureRange: { type: String, default: '' },
  soilEn: { type: String, default: '' },
  soilMr: { type: String, default: '' },
  sowingSeasonEn: { type: String, default: '' },
  sowingSeasonMr: { type: String, default: '' },
  landPreparationEn: { type: String, default: '' },
  landPreparationMr: { type: String, default: '' },
  seedSelectionEn: { type: String, default: '' },
  seedSelectionMr: { type: String, default: '' },
  seedTreatmentEn: { type: String, default: '' },
  seedTreatmentMr: { type: String, default: '' },
  seedRate: { type: String, default: '' },
  spacing: { type: String, default: '' },
  sowingMethodEn: { type: String, default: '' },
  sowingMethodMr: { type: String, default: '' },
  irrigationEn: { type: String, default: '' },
  irrigationMr: { type: String, default: '' },
  fertilizerSchedule: [{
    stage: { type: String, default: '' },
    n: { type: String, default: '' },
    p: { type: String, default: '' },
    k: { type: String, default: '' },
    organic: { type: String, default: '' },
    notesEn: { type: String, default: '' },
    notesMr: { type: String, default: '' },
  }],
  growthStages: [{
    nameEn: { type: String, default: '' },
    nameMr: { type: String, default: '' },
    durationDays: { type: String, default: '' },
    activitiesEn: { type: String, default: '' },
    activitiesMr: { type: String, default: '' },
  }],
  pests: [{
    nameEn: { type: String, default: '' },
    nameMr: { type: String, default: '' },
    symptomsEn: { type: String, default: '' },
    symptomsMr: { type: String, default: '' },
    managementEn: { type: String, default: '' },
    managementMr: { type: String, default: '' },
  }],
  diseases: [{
    nameEn: { type: String, default: '' },
    nameMr: { type: String, default: '' },
    symptomsEn: { type: String, default: '' },
    symptomsMr: { type: String, default: '' },
    managementEn: { type: String, default: '' },
    managementMr: { type: String, default: '' },
  }],
  weedManagementEn: { type: String, default: '' },
  weedManagementMr: { type: String, default: '' },
  harvestingEn: { type: String, default: '' },
  harvestingMr: { type: String, default: '' },
  postHarvestEn: { type: String, default: '' },
  postHarvestMr: { type: String, default: '' },
  commonMistakesEn: [{ type: String }],
  commonMistakesMr: [{ type: String }],
  faqs: [{
    qEn: { type: String, default: '' },
    qMr: { type: String, default: '' },
    aEn: { type: String, default: '' },
    aMr: { type: String, default: '' },
  }],
  relatedProductCategories: [{ type: String }],
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published',
    index: true,
  },
  sources: {
    type: String,
    default: 'MPKV Rahuri & ICAR Guidelines',
  }
}, {
  timestamps: true,
});

cropSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('nameEn')) {
    this.slug = this.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Crop', cropSchema);
