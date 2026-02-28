// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_fallback';
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set, using fallback secret');
}
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes',
});
const registerValidation = [
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('nic').trim().notEmpty().withMessage('NIC is required').isLength({ min: 3 }).withMessage('NIC must be at least 3 characters long'),
];
const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, password, email, nic, fullName, address, phone } = req.body;
    const existing = await User.findOne({ $or: [{ username }, { email }, { nic }] });
    if (existing) {
      let errorMsg = 'User already exists';
      if (existing.username === username) errorMsg = 'Username already taken';
      else if (existing.email === email) errorMsg = 'Email already registered';
      else if (existing.nic === nic) errorMsg = 'NIC already registered';
      return res.status(400).json({ error: errorMsg });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hash,
      email,
      nic,
      role: 'user',
      profile: { fullName, address, phone },
    });
    await user.save();
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { username: user.username, email: user.email, nic: user.nic, role: user.role, profile: user.profile },
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
    }
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, role: 'user' }).select('+password +favorites +profile +bidHistory');
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        role: user.role,
        email: user.email,
        nic: user.nic,
        favorites: user.favorites,
        bidHistory: user.bidHistory,
        profile: user.profile,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/admin-login', loginLimiter, loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, role: 'admin' }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      message: 'Admin login successful',
      token,
      user: { username: user.username, role: user.role, email: user.email, nic: user.nic },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;