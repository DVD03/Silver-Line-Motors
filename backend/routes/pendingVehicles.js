// routes/pendingVehicles.js
const express = require('express');
const router = express.Router();
const PendingVehicle = require('../models/PendingVehicle');
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

function isAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

// User submits vehicle for approval
router.post('/', isAuth, upload.fields([{ name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const { make, model, year, mileage, fuelType, category, condition, description, basePrice, purpose } = req.body;
    const images = (req.files.images || []).map(file => `/Uploads/${file.filename}`);
    const pendingVehicle = new PendingVehicle({
      submittedBy: req.user.id,
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
    await pendingVehicle.save();
    res.status(201).json({ message: 'Vehicle submitted for approval', pendingVehicle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin approves pending vehicle (copies to Vehicle model)
router.patch('/:id/approve', isAdmin, async (req, res) => {
  try {
    const pending = await PendingVehicle.findById(req.params.id).populate('submittedBy', 'username');
    if (!pending || pending.status !== 'Pending') return res.status(400).json({ error: 'Invalid pending vehicle' });

    const vehicle = new Vehicle({
      ...pending.toObject(),
      submittedBy: pending.submittedBy._id,
      _id: undefined, // New ID
    });
    await vehicle.save();

    pending.status = 'Approved';
    await pending.save();

    res.json({ message: 'Vehicle approved', vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin rejects pending vehicle
router.patch('/:id/reject', isAdmin, async (req, res) => {
  try {
    const pending = await PendingVehicle.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
    if (!pending) return res.status(404).json({ error: 'Pending vehicle not found' });
    res.json({ message: 'Vehicle rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending vehicles (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const pendings = await PendingVehicle.find({ status: 'Pending' }).populate('submittedBy', 'username');
    res.json(pendings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;