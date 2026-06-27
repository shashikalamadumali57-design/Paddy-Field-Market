const express = require('express');
const multer = require('multer');
const path = require('path');
const store = require('../data/store');
const { protect, authorize } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, 'field-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Images only!'));
  }
});

const getPopulatedField = (field) => {
  const owner = store.users.find(u => u._id === field.owner) || {};
  return { ...field, owner: { _id: owner._id, name: owner.name, email: owner.email, phone: owner.phone, location: owner.location, bio: owner.bio } };
};

// @route   POST /api/fields
// @desc    Create a new field listing
// @access  Private (Farmers only)
router.post('/', protect, authorize('farmer'), upload.array('images', 5), (req, res) => {
  try {
    const fieldData = JSON.parse(req.body.fieldData);
    
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newField = {
      ...fieldData,
      _id: crypto.randomBytes(12).toString('hex'),
      owner: req.user._id,
      images: imagePaths,
      views: 0,
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    store.fields.push(newField);
    res.status(201).json(getPopulatedField(newField));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating field' });
  }
});

// @route   GET /api/fields
// @desc    Get all fields (with filtering and pagination)
// @access  Public
router.get('/', (req, res) => {
  try {
    let filteredFields = [...store.fields];

    // Status filter
    if (req.query.status) {
      filteredFields = filteredFields.filter(f => f.status === req.query.status);
    } else {
      filteredFields = filteredFields.filter(f => f.status === 'available');
    }

    // Filters
    if (req.query.district) filteredFields = filteredFields.filter(f => f.location.district.toLowerCase().includes(req.query.district.toLowerCase()));
    if (req.query.province) filteredFields = filteredFields.filter(f => f.location.province.toLowerCase().includes(req.query.province.toLowerCase()));
    if (req.query.shape) filteredFields = filteredFields.filter(f => f.shape === req.query.shape);
    if (req.query.soilType) filteredFields = filteredFields.filter(f => f.soilType === req.query.soilType);
    
    if (req.query.minPrice) filteredFields = filteredFields.filter(f => f.price >= Number(req.query.minPrice));
    if (req.query.maxPrice) filteredFields = filteredFields.filter(f => f.price <= Number(req.query.maxPrice));

    // Sorting
    if (req.query.sort) {
      if (req.query.sort === 'newest') filteredFields.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (req.query.sort === 'oldest') filteredFields.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      if (req.query.sort === 'price_asc') filteredFields.sort((a, b) => a.price - b.price);
      if (req.query.sort === 'price_desc') filteredFields.sort((a, b) => b.price - a.price);
    } else {
      filteredFields.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Default newest
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = filteredFields.length;

    const paginatedFields = filteredFields.slice(startIndex, endIndex).map(getPopulatedField);

    res.json({
      success: true,
      count: paginatedFields.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      fields: paginatedFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/fields/my-fields
// @desc    Get logged in farmer's fields
// @access  Private (Farmers only)
router.get('/my-fields', protect, authorize('farmer'), (req, res) => {
  try {
    const fields = store.fields.filter(f => f.owner === req.user._id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/fields/:id
// @desc    Get single field by ID
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const fieldIndex = store.fields.findIndex(f => f._id === req.params.id);
    if (fieldIndex === -1) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Increment views safely
    store.fields[fieldIndex].views = (store.fields[fieldIndex].views || 0) + 1;

    res.json(getPopulatedField(store.fields[fieldIndex]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/fields/:id
// @desc    Update field
// @access  Private (Owner only)
router.put('/:id', protect, authorize('farmer'), upload.array('images', 5), (req, res) => {
  try {
    const fieldIndex = store.fields.findIndex(f => f._id === req.params.id);
    if (fieldIndex === -1) {
      return res.status(404).json({ message: 'Field not found' });
    }

    if (store.fields[fieldIndex].owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this field' });
    }

    // Handle form data or JSON
    let updateData;
    let finalImages = store.fields[fieldIndex].images || [];

    if (req.body.fieldData) {
      updateData = JSON.parse(req.body.fieldData);
      
      // Keep existing images that weren't deleted
      if (req.body.existingImages) {
        let existing = [];
        try {
          existing = JSON.parse(req.body.existingImages);
        } catch(e) {
          existing = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
        }
        finalImages = existing;
      } else {
        finalImages = []; // all deleted
      }

      // Add new images
      const newImagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
      finalImages = [...finalImages, ...newImagePaths];
      
    } else {
      updateData = req.body;
    }

    updateData.updatedAt = new Date();
    
    // Merge updates
    store.fields[fieldIndex] = { ...store.fields[fieldIndex], ...updateData, images: finalImages };

    res.json(getPopulatedField(store.fields[fieldIndex]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/fields/:id
// @desc    Delete field
// @access  Private (Owner only)
router.delete('/:id', protect, authorize('farmer'), (req, res) => {
  try {
    const fieldIndex = store.fields.findIndex(f => f._id === req.params.id);
    if (fieldIndex === -1) {
      return res.status(404).json({ message: 'Field not found' });
    }

    if (store.fields[fieldIndex].owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this field' });
    }

    store.fields.splice(fieldIndex, 1);
    res.json({ message: 'Field removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
