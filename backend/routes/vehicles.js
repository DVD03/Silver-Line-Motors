// routes/vehicles.js
const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../Uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage, limits: { files: 10 } });

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

router.get('/', async (req, res) => {  // Public endpoint for browsing
  try {
    const { search, category, purpose } = req.query;
    let filter = { soldOut: false };
    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (purpose) filter.purpose = purpose;
    const vehicles = await Vehicle.find(filter).populate('submittedBy', 'username').lean();

    // Attach active auction IDs if purpose is auction
    const Auction = require('../models/Auction');
    const enriched = await Promise.all(vehicles.map(async v => {
      if (v.purpose === 'auction') {
        const active = await Auction.findOne({ vehicle: v._id, status: 'Active' }).select('_id');
        return { ...v, activeAuctionId: active?._id };
      }
      return v;
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error('Error fetching vehicle:', err);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

router.post('/', upload.fields([{ name: 'images', maxCount: 10 }]), isAdmin, async (req, res) => {
  try {
    const { make, model, year, mileage, fuelType, category, condition, description, basePrice, purpose } = req.body;
    const images = (req.files.images || []).map(file => `/Uploads/${file.filename}`);
    const vehicle = new Vehicle({
      make,
      model,
      year: Number(year),
      mileage: Number(mileage),
      fuelType,
      images,
      category,
      condition,
      description,
      basePrice: Number(basePrice),
      purpose,
    });
    await vehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully', vehicle });
  } catch (err) {
    console.error('Error adding vehicle:', err);
    res.status(400).json({ error: err.message || 'Failed to add vehicle' });
  }
});

router.put('/:id', upload.fields([{ name: 'images', maxCount: 10 }]), isAdmin, async (req, res) => {
  try {
    const { make, model, year, mileage, fuelType, category, condition, description, basePrice, purpose } = req.body;
    const images = (req.files.images || []).map(file => `/Uploads/${file.filename}`);
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        make,
        model,
        year: Number(year),
        mileage: Number(mileage),
        fuelType,
        category,
        condition,
        description,
        images,
        basePrice: Number(basePrice),
        purpose,
      },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (err) {
    console.error('Error updating vehicle:', err);
    res.status(400).json({ error: err.message || 'Failed to update vehicle' });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error('Error deleting vehicle:', err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

module.exports = router;