// routes/sales.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Vehicle = require('../models/Vehicle');

function isAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

router.post('/', isAuth, async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.soldOut) return res.status(400).json({ error: 'Vehicle not available' });
    const sale = new Sale({ buyer: req.user.id, vehicle: vehicleId, price: vehicle.basePrice });
    await sale.save();
    vehicle.soldOut = true;
    await vehicle.save();
    res.status(201).json({ message: 'Purchase successful', sale });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/my', isAuth, async (req, res) => {
  try {
    const sales = await Sale.find({ buyer: req.user.id }).populate('vehicle');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;