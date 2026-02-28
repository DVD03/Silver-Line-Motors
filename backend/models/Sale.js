// models/Sale.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Sale || mongoose.model('Sale', saleSchema);