const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedVendor = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create vendor user
    const vendorData = {
      name: 'Test Vendor',
      email: 'vendor@test.com',
      password: 'password123',
      role: 'vendor'
    };

    const existingVendor = await User.findOne({ email: vendorData.email });
    
    if (existingVendor) {
      console.log('Vendor already exists');
      mongoose.disconnect();
      return;
    }

    const vendor = await User.create(vendorData);
    console.log('Vendor created successfully:', vendor);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding vendor:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedVendor(); 