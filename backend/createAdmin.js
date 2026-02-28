const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const adminExists = await User.findOne({ username: 'silveradmin' });
    if (adminExists) {
      console.log('Admin user already exists');
      return mongoose.connection.close();
    }
    const hash = await bcrypt.hash('SilverMotors123', 10);
    const admin = new User({
      username: 'silveradmin',
      email: 'admin@silverlinemotors.lk',
      password: hash,
      nic: 'SLM-001',
      role: 'admin',
      profile: { fullName: 'Silver Line Admin', address: 'Colombo, Sri Lanka', phone: '+94 11 234 5678' },
    });
    await admin.save();
    console.log('Admin user created successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating admin:', err);
    mongoose.connection.close();
  }
}

createAdmin();