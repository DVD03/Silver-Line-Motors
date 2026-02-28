// models/Auction.js
const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  startingBid: { type: Number, required: true },
  currentBid: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Ended', 'Cancelled'], default: 'Active' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Auction || mongoose.model('Auction', auctionSchema);