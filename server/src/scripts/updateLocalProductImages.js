const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
const Product = require('../models/Product');

const MANIFEST_PATH = path.join(__dirname, '../data/productImageManifest.json');

async function updateProductImages() {
  const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/RushiKrushiSevaKendra';
  console.log('Connecting strictly to local MongoDB:', localUri);

  if (localUri.includes('mongodb.net') || localUri.includes('atlas')) {
    throw new Error('FATAL SAFETY VIOLATION: Refusing to run against remote Atlas MongoDB!');
  }

  await mongoose.connect(localUri);
  console.log('Connected successfully to local MongoDB.');

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`Loaded ${manifest.length} manifest entries.`);

  let updatedCount = 0;
  let clearedCount = 0;
  let unchangedCount = 0;

  for (const item of manifest) {
    const existing = await Product.findById(item.id).lean();
    if (!existing) {
      console.warn(`Product not found in DB with id ${item.id} (${item.nameEn})`);
      continue;
    }

    const newImageUrl = item.imageUrl || '';
    const oldImageUrl = existing.imageUrl || '';

    if (newImageUrl !== oldImageUrl) {
      await Product.updateOne(
        { _id: item.id },
        { $set: { imageUrl: newImageUrl } }
      );
      if (newImageUrl && !oldImageUrl) {
        updatedCount++;
        // console.log(`[UPDATED] ${item.nameEn} -> ${newImageUrl}`);
      } else if (!newImageUrl && oldImageUrl) {
        clearedCount++;
        console.log(`[CLEARED UNVERIFIED] ${item.nameEn} (was ${oldImageUrl.slice(0, 40)}...)`);
      } else {
        updatedCount++;
      }
    } else {
      unchangedCount++;
    }
  }

  console.log('\n=======================================');
  console.log('LOCAL DATABASE IMAGE UPDATE COMPLETE:');
  console.log(`Verified images set: ${updatedCount}`);
  console.log(`Unverified/stock photos cleared to placeholder: ${clearedCount}`);
  console.log(`Already up to date: ${unchangedCount}`);
  console.log('=======================================');

  // Verify in DB
  const allProds = await Product.find({}).lean();
  const withLocal = allProds.filter(p => p.imageUrl && p.imageUrl.startsWith('/images/products/'));
  const withEmpty = allProds.filter(p => !p.imageUrl || p.imageUrl.trim() === '');
  const withUnsplash = allProds.filter(p => p.imageUrl && p.imageUrl.includes('unsplash.com'));

  console.log(`\nVerification across all ${allProds.length} products:`);
  console.log(` - Pointing to local verified WebP (/images/products/): ${withLocal.length}`);
  console.log(` - Clean placeholder fallback (imageUrl: ''): ${withEmpty.length}`);
  console.log(` - Remaining generic Unsplash URLs: ${withUnsplash.length}`);

  await mongoose.disconnect();
}

updateProductImages().catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
