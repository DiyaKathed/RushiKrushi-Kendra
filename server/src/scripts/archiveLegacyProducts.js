const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

async function archiveLegacyProducts() {
  const mongoUri = 'mongodb://127.0.0.1:27017/RushiKrushiSevaKendra';
  console.log(`[Safe Archival] Connecting to local MongoDB: ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  const Product = require('../models/Product');

  // Verify total count before modifications
  const totalBefore = await Product.countDocuments();
  console.log(`[Safe Archival] Total products before archival: ${totalBefore}`);

  // Identify the 6 legacy products
  const legacyProducts = await Product.find({
    brand: { $nin: ['IFFCO-MC', 'Zytonic'] }
  });

  console.log(`[Safe Archival] Found ${legacyProducts.length} legacy products to archive:`);
  legacyProducts.forEach((p, idx) => {
    console.log(`  ${idx + 1}. [${p._id}] ${p.nameEn} (Brand: ${p.brand}, Category: ${p.category})`);
  });

  if (legacyProducts.length !== 6) {
    throw new Error(`Expected exactly 6 legacy products to archive, but found ${legacyProducts.length}! Aborting.`);
  }

  // Update the 6 products to archived status
  const archiveTimestamp = new Date();
  const archiveReason = 'Archived per client requirement: product is not part of currently approved client catalogues (IFFCO-MC and ZYTONIC)';

  const updateResult = await Product.updateMany(
    { _id: { $in: legacyProducts.map(p => p._id) } },
    {
      $set: {
        status: 'archived',
        isArchived: true,
        archivedAt: archiveTimestamp,
        archivedReason: archiveReason,
      }
    }
  );

  console.log(`[Safe Archival] Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

  // Ensure all other products have isArchived: false if not set
  await Product.updateMany(
    { _id: { $nin: legacyProducts.map(p => p._id) }, isArchived: { $exists: false } },
    { $set: { isArchived: false } }
  );

  // Post-update verification
  const totalAfter = await Product.countDocuments();
  const activePublished = await Product.countDocuments({ status: 'published', isArchived: { $ne: true } });
  const archived = await Product.countDocuments({ $or: [{ status: 'archived' }, { isArchived: true }] });
  const iffcoCount = await Product.countDocuments({ brand: 'IFFCO-MC', status: 'published', isArchived: { $ne: true } });
  const zytonicCount = await Product.countDocuments({ brand: 'Zytonic', status: 'published', isArchived: { $ne: true } });

  console.log('\n================ POST-ARCHIVAL VERIFICATION ================');
  console.log(`Total Products in DB:       ${totalAfter} (Must equal 98 - Zero deletions)`);
  console.log(`Active Published Products:  ${activePublished} (Must equal 92)`);
  console.log(`  - IFFCO-MC Active:        ${iffcoCount} (Must equal 71)`);
  console.log(`  - ZYTONIC Active:         ${zytonicCount} (Must equal 21)`);
  console.log(`Archived Products:          ${archived} (Must equal 6)`);
  console.log('============================================================\n');

  if (totalAfter !== 98 || activePublished !== 92 || archived !== 6 || iffcoCount !== 71 || zytonicCount !== 21) {
    throw new Error('Verification counts do not match expected totals!');
  }

  console.log('[Safe Archival] Completed successfully and verified!');
  await mongoose.disconnect();
}

archiveLegacyProducts().catch(err => {
  console.error('[Safe Archival Error]:', err);
  process.exit(1);
});
