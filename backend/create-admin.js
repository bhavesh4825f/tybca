const mongoose = require('mongoose');
const User = require('./models/User.model');
require('dotenv').config();

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@dgsc.com',
  password: 'admin123',
  phone: '9999999999',
  role: 'admin',
  address: {
    street: 'Admin Street',
    city: 'Admin City',
    state: 'Admin State',
    pincode: '000000'
  },
  isActive: true
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', adminData.email);
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create(adminData);
    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
