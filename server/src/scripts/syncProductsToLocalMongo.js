const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment configuration: prioritize .env.local for local development
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const localEnvPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(localEnvPath)) {
  require('dotenv').config({ path: localEnvPath, override: true });
}

const Product = require('../models/Product');
const seedData = require('../seed/seedData');

async function syncProducts() {
  const localTargetURI = process.env.MONGODB_LOCAL_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/RushiKrushiSevaKendra';

  // STRICT SAFETY GUARD: Verify connection string targets 127.0.0.1 or localhost ONLY
  if (localTargetURI.includes('mongodb.net') || localTargetURI.startsWith('mongodb+srv:')) {
    console.error('FATAL: Attempted to run local sync against remote/Atlas MongoDB URI. Aborting immediately.');
    process.exit(1);
  }

  console.log('[Safe Sync] Connecting strictly to local MongoDB database...');
  await mongoose.connect(localTargetURI, {
    serverSelectionTimeoutMS: 5000,
  });

  const connection = mongoose.connection;
  const host = connection.host;
  const port = connection.port;
  const dbName = connection.name;

  console.log(`[Safe Sync] Connected host: ${host}, port: ${port}, database: ${dbName}`);

  // POSITIVE VERIFICATION: Must be 127.0.0.1/localhost, port 27017, and db RushiKrushiSevaKendra
  const isLocalHost = host === '127.0.0.1' || host === 'localhost';
  const isCorrectDb = dbName === 'RushiKrushiSevaKendra';

  if (!isLocalHost || !isCorrectDb) {
    console.error(`FATAL: Connection target verification failed (Host: ${host}, DB: ${dbName}). STOPPING without making changes.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('[Safe Sync] Local MongoDB connection verified positively.');

  // Check existing products in local MongoDB
  const initialCount = await Product.countDocuments();
  console.log(`[Safe Sync] Current products in local database: ${initialCount}`);

  const existingDocs = await Product.find({}, 'slug');
  const existingSlugs = new Set(existingDocs.map((p) => p.slug));

  const sourceProducts = seedData.products || [];
  console.log(`[Safe Sync] Source products in seedData: ${sourceProducts.length}`);

  let insertedCount = 0;
  let skippedCount = 0;
  const insertedSummary = [];

  for (const prod of sourceProducts) {
    if (existingSlugs.has(prod.slug)) {
      console.log(`  - [SKIPPED] Slug already exists: "${prod.slug}"`);
      skippedCount++;
    } else {
      // Use findOneAndUpdate with upsert to prevent Mongoose pre-save hook from altering canonical slug
      const newProd = await Product.findOneAndUpdate(
        { slug: prod.slug },
        {
          $setOnInsert: {
            nameEn: prod.nameEn,
            nameMr: prod.nameMr,
            slug: prod.slug,
            brand: prod.brand,
            category: prod.category,
            imageUrl: prod.imageUrl || '',
            descriptionEn: prod.descriptionEn || '',
            descriptionMr: prod.descriptionMr || '',
            packSizes: Array.isArray(prod.packSizes) ? prod.packSizes : [],
            technicalComposition: prod.technicalComposition || '',
            applicableCrops: Array.isArray(prod.applicableCrops) ? prod.applicableCrops : [],
            intendedUse: prod.intendedUse || '',
            dosage: prod.dosage || '',
            safetyPrecautionsEn: prod.safetyPrecautionsEn || '',
            safetyPrecautionsMr: prod.safetyPrecautionsMr || '',
            manufacturer: prod.manufacturer || '',
            indicativePrice: prod.indicativePrice || '',
            availability: prod.availability || 'in_stock',
            isFeatured: Boolean(prod.isFeatured),
            status: prod.status || 'published',
          }
        },
        { upsert: true, new: true }
      );

      console.log(`  + [INSERTED] ${newProd.nameEn} (slug: ${newProd.slug})`);
      insertedSummary.push({
        nameEn: newProd.nameEn,
        nameMr: newProd.nameMr,
        slug: newProd.slug,
        brand: newProd.brand,
        category: newProd.category,
      });
      insertedCount++;
    }
  }

  const finalCount = await Product.countDocuments();
  console.log(`[Safe Sync] Sync completed.`);
  console.log(`[Safe Sync] Inserted: ${insertedCount}, Skipped: ${skippedCount}, Total products now: ${finalCount}`);

  await mongoose.disconnect();
  console.log('[Safe Sync] Disconnected cleanly from local MongoDB.');

  return {
    initialCount,
    insertedCount,
    skippedCount,
    finalCount,
    insertedSummary,
  };
}

if (require.main === module) {
  syncProducts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Safe Sync] Error occurred during sync:', err.message || err);
      process.exit(1);
    });
}

module.exports = { syncProducts };
