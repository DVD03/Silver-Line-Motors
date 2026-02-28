// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

function isAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

router.get('/', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites.vehicle bidHistory.auction.vehicle');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', isAuth, async (req, res) => {
  try {
    const { fullName, address, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { profile: { fullName, address, phone, avatar } }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/favorites', isAuth, async (req, res) => {
  try {
    const { favorites } = req.body;
    if (!Array.isArray(favorites)) return res.status(400).json({ error: 'Favorites must be an array' });
    const user = await User.findByIdAndUpdate(req.user.id, { favorites }, { new: true }).populate('favorites.vehicle');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;