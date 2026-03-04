// routes/auctions.js
const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Vehicle = require('../models/Vehicle');

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

router.post('/', isAdmin, async (req, res) => {
  try {
    const { vehicleId, startingBid, startTime, endTime } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    const validStartingBid = Number(startingBid) || vehicle.basePrice || 0;
    if (validStartingBid <= 0) return res.status(400).json({ error: 'Starting bid must be greater than 0' });
    const auction = new Auction({ vehicle: vehicleId, startingBid: validStartingBid, startTime, endTime });
    await auction.save();
    res.status(201).json({ message: 'Auction started', auction });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/bulk', isAdmin, async (req, res) => {
  try {
    const { vehicleIds, startingBid, durationHours } = req.body;
    if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) return res.status(400).json({ error: 'Provide vehicle IDs array' });
    const numDuration = Number(durationHours);
    if (isNaN(numDuration) || numDuration <= 0) return res.status(400).json({ error: 'Provide valid duration hours greater than 0' });
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + numDuration * 60 * 60 * 1000);
    const auctions = [];
    for (const vehicleId of vehicleIds) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) continue;
      const auctionStartingBid = Number(startingBid) || vehicle.basePrice || 0;
      if (auctionStartingBid <= 0) continue; // Skip if invalid bid
      const auction = new Auction({
        vehicle: vehicleId,
        startingBid: auctionStartingBid,
        startTime,
        endTime
      });
      await auction.save();
      auctions.push(auction);
    }
    if (auctions.length === 0) return res.status(400).json({ error: 'No valid vehicles found for auction' });
    res.status(201).json({ message: `${auctions.length} auctions started`, auctions });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/end', isAdmin, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(req.params.id, { status: 'Ended' }, { new: true }).populate('bids');
    if (auction.bids && auction.bids.length > 0) {
      const highestBid = auction.bids.reduce((max, bid) => bid.amount > max.amount ? bid : max);
      auction.winner = highestBid.user;
      await auction.save();
    }
    res.json({ message: 'Auction ended', auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'Active' }).populate('vehicle').sort({ startTime: 1 });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const auction = await Auction.findOne({ vehicle: req.params.vehicleId, status: 'Active' }).populate('vehicle bids.user');
    if (!auction) return res.status(404).json({ error: 'No active auction found for this vehicle' });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('vehicle bids.user');
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/bid', async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = await Auction.findById(req.params.id);
    if (!auction || auction.status !== 'Active') return res.status(400).json({ error: 'Auction not active' });
    const bidAmount = Number(amount);
    if (isNaN(bidAmount) || bidAmount <= auction.currentBid) return res.status(400).json({ error: 'Bid must be higher than current bid and a valid number' });
    const bid = new Bid({ auction: req.params.id, user: req.user.id, amount: bidAmount });
    await bid.save();
    auction.currentBid = bidAmount;
    await auction.save();
    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('bidUpdate', { auctionId: req.params.id, currentBid: bidAmount, user: req.user.username });
    res.json({ message: 'Bid placed', bid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;