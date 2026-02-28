// routes/bids.js
const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');

router.get('/my', async (req, res) => {
  try {
    const bids = await Bid.find({ user: req.user.id }).populate('auction.vehicle').sort({ timestamp: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

module.exports = router;