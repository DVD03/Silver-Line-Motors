const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, minlength: [3, 'Username must be at least 3 characters long'] },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters long'] },
  email: { type: String, required: [true, 'Email is required'], unique: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] },
  nic: { type: String, required: [true, 'NIC is required'], unique: true, trim: true, minlength: [3, 'NIC must be at least 3 characters long'] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' } }],
  bidHistory: [{ auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' }, amount: Number }],
  profile: { fullName: String, address: String, phone: String, avatar: String },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);