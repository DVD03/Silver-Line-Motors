// models/Rental.js
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  quantity: { type: Number, default: 1 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Rental || mongoose.model('Rental', rentalSchema);