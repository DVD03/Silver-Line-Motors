// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

const uploadsDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not set');
}

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not set');
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Socket.io for real-time bids
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('joinAuction', (auctionId) => {
    socket.join(auctionId);
  });
  socket.on('newBid', (data) => {
    io.to(data.auctionId).emit('bidUpdate', data);
  });
  socket.on('disconnect', () => console.log('User disconnected'));
});

app.set('io', io);

// Routes - vehicles is public for GET, but others protected
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));  // Public GET
app.use('/api/auctions', authMiddleware, require('./routes/auctions'));
app.use('/api/bids', authMiddleware, require('./routes/bids'));
app.use('/api/rentals', authMiddleware, require('./routes/rentals'));
app.use('/api/profile', authMiddleware, require('./routes/profile'));
app.use('/api/users', authMiddleware, require('./routes/users'));
app.use('/api/pending-vehicles', authMiddleware, require('./routes/pendingVehicles'));
app.use('/api/sales', authMiddleware, require('./routes/sales'));

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  }
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});