// models/PendingVehicle.js
const mongoose = require('mongoose');

const pendingVehicleSchema = new mongoose.Schema({
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  mileage: { type: Number, required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
  images: [String],
  category: {
    type: String,
    enum: ['Car', 'SUV', 'Motorcycle', 'Truck', 'Van', 'PickUp', 'Three Wheeler'],
    required: true,
  },
  condition: { type: String, enum: ['New', 'Used', 'Refurbished'], default: 'Used' },
  description: String,
  basePrice: { type: Number, required: true },
  purpose: { type: String, enum: ['sell', 'auction', 'rent'], required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.PendingVehicle || mongoose.model('PendingVehicle', pendingVehicleSchema);