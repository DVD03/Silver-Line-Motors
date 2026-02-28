// models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
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
  soldOut: { type: Boolean, default: false },
  description: String,
  basePrice: { type: Number, required: true },
  purpose: { type: String, enum: ['sell', 'auction', 'rent'], required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);