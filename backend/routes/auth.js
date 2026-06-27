const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const store = require('../data/store');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

router.post('/register', [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('phone', 'Phone number is required').notEmpty(),
  body('role', 'Role must be farmer or buyer').isIn(['farmer', 'buyer'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, phone, role, location } = req.body;

    const exists = store.users.find(u => u.email === email);
    if (exists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const newUser = {
      _id: crypto.randomBytes(12).toString('hex'),
      name,
      email,
      password, // Plain text for demo purposes
      phone,
      role,
      location,
      createdAt: new Date()
    };

    store.users.push(newUser);

    const token = generateToken(newUser._id);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      location: newUser.location,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = store.users.find(u => u.email === email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      bio: user.bio,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', protect, (req, res) => {
  const user = store.users.find(u => u._id === req.user._id);
  if(!user) return res.status(404).json({message: "User not found"});
  res.json(user);
});

router.put('/profile', protect, (req, res) => {
  const userIndex = store.users.findIndex(u => u._id === req.user._id);
  if (userIndex === -1) return res.status(404).json({message: "User not found"});

  const { name, phone, location, bio } = req.body;
  if (name) store.users[userIndex].name = name;
  if (phone) store.users[userIndex].phone = phone;
  if (location) store.users[userIndex].location = location;
  if (bio) store.users[userIndex].bio = bio;

  res.json(store.users[userIndex]);
});

module.exports = router;
