// routes/rentals.js
const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

function isAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

router.post('/', isAuth, async (req, res) => {
  try {
    const { vehicleId, days, startDate } = req.body;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(days));
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.soldOut) return res.status(400).json({ error: 'Vehicle not available' });
    const total = vehicle.basePrice * Number(days);
    const rental = new Rental({ user: req.user.id, vehicle: vehicleId, quantity: Number(days), startDate, endDate, total });
    await rental.save();
    await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: { vehicle: vehicleId } } });
    res.status(201).json({ message: 'Rental booked successfully', rental });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to book rental' });
  }
});

router.get('/my', isAuth, async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user.id }).populate('vehicle').sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

router.get('/', isAdmin, async (req, res) => {
  try {
    const rentals = await Rental.find().populate('user', 'username email').populate('vehicle').sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    if (!rental) return res.status(404).json({ error: 'Rental not found' });
    res.json({ message: 'Rental deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rental' });
  }
});

module.exports = router;