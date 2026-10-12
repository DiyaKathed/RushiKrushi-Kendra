const test = require('node:test');
const assert = require('node:assert');
const { connectDB, disconnectDB } = require('../src/config/db');
const { runSeed } = require('../src/seed/seed');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Crop = require('../src/models/Crop');
const FarmerCrop = require('../src/models/FarmerCrop');
const ContactEnquiry = require('../src/models/ContactEnquiry');

test('Backend API & Models Verification Test Suite', async (t) => {
  await t.test('Connect to database and run seed', async () => {
    await connectDB();
    await runSeed();
    const productCount = await Product.countDocuments();
    assert.ok(productCount >= 6, 'Should have at least 6 products seeded');
  });

  await t.test('Verify admin user and password matching', async () => {
    const admin = await User.findOne({ phone: '9890360271' }).select('+password');
    assert.ok(admin, 'Admin user must exist');
    assert.strictEqual(admin.role, 'admin');
    const isMatch = await admin.matchPassword('AdminPassword@123');
    assert.strictEqual(isMatch, true, 'Admin password should match');
  });

  await t.test('Verify store admin (rushikrushi99@gmail.com) is provisioned with role admin', async () => {
    const storeAdmin = await User.findOne({ email: 'rushikrushi99@gmail.com' });
    assert.ok(storeAdmin, 'Store administrator rushikrushi99@gmail.com must exist');
    assert.strictEqual(storeAdmin.role, 'admin', 'Role must be admin');
    assert.strictEqual(storeAdmin.isVerified, true, 'Admin account should be verified');
  });

  await t.test('Verify admin provisioning is idempotent and does not duplicate', async () => {
    const { provisionAdminAccount } = require('../src/utils/adminProvisioner');
    const result = await provisionAdminAccount();
    assert.strictEqual(result.created, false, 'Second run should not recreate user');
    const count = await User.countDocuments({ email: 'rushikrushi99@gmail.com' });
    assert.strictEqual(count, 1, 'Exactly one admin account should exist for rushikrushi99@gmail.com');
  });

  await t.test('Verify crop guide has 28-point data structure', async () => {
    const crop = await Crop.findOne({ slug: 'sugarcane' });
    assert.ok(crop, 'Sugarcane crop guide must exist');
    assert.ok(crop.nameMr, 'Should have Marathi name');
    assert.ok(crop.fertilizerSchedule.length > 0, 'Should have fertilizer schedule');
    assert.ok(crop.pests.length > 0, 'Should have pests data');
    assert.ok(crop.diseases.length > 0, 'Should have diseases data');
  });

  await t.test('Verify farmer crop record ownership integrity', async () => {
    const farmer = await User.findOne({ phone: '9822001122' });
    assert.ok(farmer, 'Sample farmer must exist');

    const farmerCrop = await FarmerCrop.findOne({ user: farmer._id });
    assert.ok(farmerCrop, 'Farmer crop must be registered to farmer');
    assert.strictEqual(farmerCrop.user.toString(), farmer._id.toString());
  });

  await t.test('Verify contact enquiry model validation', async () => {
    const enquiry = await ContactEnquiry.create({
      name: 'Ramesh Patil',
      phone: '9823456789',
      subject: 'Drip Irrigation Subsidy and Fertilizers',
      message: 'Do you have water soluble 19:19:19 in stock?',
    });
    assert.ok(enquiry._id, 'Enquiry should be created');
    assert.strictEqual(enquiry.status, 'pending');
    await ContactEnquiry.findByIdAndDelete(enquiry._id);
  });

  // Cleanup
  await disconnectDB();
});
