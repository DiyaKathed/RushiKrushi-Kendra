const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Crop = require('../models/Crop');
const Article = require('../models/Article');
const FarmerCrop = require('../models/FarmerCrop');
const seedData = require('./seedData');
const { provisionAdminAccount } = require('../utils/adminProvisioner');

const runSeed = async () => {
  try {
    console.log('Seeding initial agricultural data...');

    // 1. Seed Proprietor Admin User (Mahadeo Dhobale) - Mock account strictly for dev/test
    if (process.env.NODE_ENV === 'production') {
      console.log('Production environment detected: Skipping creation of mock admin user with default credentials.');
    } else {
      let admin = await User.findOne({ phone: seedData.adminUser.phone });
      if (!admin) {
        admin = await User.create(seedData.adminUser);
        console.log(`Created Admin User: ${admin.name} (${admin.phone})`);
      } else {
        console.log(`Admin User already exists: ${admin.phone}`);
      }
    }

    // 1b. Seed/Provision Store Administrator (rushikrushi99@gmail.com)
    // Production-safe: Uses ADMIN_INITIAL_PASSWORD or generates a cryptographically secure random secret
    await provisionAdminAccount();

    // 2. Seed Farmer User - Mock account strictly for dev/test
    let farmer = null;
    if (process.env.NODE_ENV === 'production') {
      console.log('Production environment detected: Skipping creation of mock farmer user with default credentials.');
    } else {
      farmer = await User.findOne({ phone: seedData.farmerUser.phone });
      if (!farmer) {
        farmer = await User.create(seedData.farmerUser);
        console.log(`Created Farmer User: ${farmer.name} (${farmer.phone})`);
      } else {
        console.log(`Farmer User already exists: ${farmer.phone}`);
      }
    }

    // 3. Seed Products
    for (const prod of seedData.products) {
      await Product.findOneAndUpdate(
        { slug: prod.slug },
        prod,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`Seeded ${seedData.products.length} agricultural store products.`);

    // 4. Seed Crops
    const seededCrops = [];
    for (const cropData of seedData.crops) {
      const c = await Crop.findOneAndUpdate(
        { slug: cropData.slug },
        cropData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededCrops.push(c);
    }
    console.log(`Seeded ${seedData.crops.length} crop cultivation guides.`);

    // 5. Seed Farmer Crop Record for the sample farmer
    if (farmer && seededCrops.length > 0) {
      const existingFarmerCrop = await FarmerCrop.findOne({ user: farmer._id });
      if (!existingFarmerCrop) {
        await FarmerCrop.create({
          user: farmer._id,
          cropName: 'Sugarcane (ऊस)',
          cropRef: seededCrops[0]._id,
          variety: 'Co 86032 (Nira)',
          status: 'Growing',
          sowingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          farmArea: '2.5 Acres',
          soilType: 'Medium Black (काळी जमीन)',
          irrigationMethod: 'Drip Irrigation (ठिबक)',
          growthStage: 'Tillering Stage (फुटवे फुटणे)',
          visibleProblems: 'Minor shoot borer attack noticed near water channel',
          notes: 'Applied basal fertilizer on day 1; scheduled earthing up in 3 weeks.'
        });
        console.log('Seeded sample farmer crop record.');
      }
    }

    // 6. Seed Articles
    for (const art of seedData.articles) {
      await Article.findOneAndUpdate(
        { slug: art.slug },
        art,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`Seeded ${seedData.articles.length} educational articles.`);

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  }
};

// If run directly from CLI
if (require.main === module) {
  (async () => {
    require('dotenv').config();
    await connectDB();
    await runSeed();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { runSeed };
