const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: 2000
  },
  size: {
    value: {
      type: Number,
      required: [true, 'Please add field size']
    },
    unit: {
      type: String,
      enum: ['acres', 'hectares', 'perches', 'square_meters'],
      default: 'acres'
    }
  },
  shape: {
    type: String,
    enum: ['rectangular', 'square', 'irregular', 'l_shaped', 'triangular', 'circular'],
    required: [true, 'Please select field shape']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    district: {
      type: String,
      required: [true, 'Please add a district']
    },
    province: {
      type: String,
      required: [true, 'Please add a province']
    }
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  images: [{
    type: String
  }],
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'silt', 'peat', 'other'],
    default: 'loamy'
  },
  waterSource: {
    type: String,
    enum: ['river', 'well', 'canal', 'rain_fed', 'irrigation', 'other'],
    default: 'rain_fed'
  },
  currentCrop: {
    type: String,
    default: 'Paddy'
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
fieldSchema.index({ 'location.district': 1, status: 1, price: 1 });

module.exports = mongoose.model('Field', fieldSchema);
