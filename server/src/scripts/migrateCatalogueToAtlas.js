require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable DNS servers for SRV lookups
try {
  const servers = dns.getServers();
  if (servers.some((s) => s.startsWith('fe80:') || s === '::1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch {}

async function migrateCatalogueToAtlas() {
  console.log('===============================================================');
  console.log('🚀 RUSHI KRUSHI SEVA KENDRA — ATLAS CATALOGUE MIGRATION');
  console.log('===============================================================\n');

  const localUri = 'mongodb://127.0.0.1:27017/RushiKrushiSevaKendra';
  const atlasUri = process.env.MONGODB_URI;

  if (!atlasUri) {
    throw new Error('FATAL: MONGODB_URI not found in environment!');
  }

  // 1. Connect to both databases
  console.log('[Step 1/5] Connecting to Local MongoDB and MongoDB Atlas...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  const atlasConn = await mongoose.createConnection(atlasUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 20000,
    tls: true,
  }).asPromise();

  const localDb = localConn.db;
  const atlasDb = atlasConn.db;

  // Confirm target database name
  if (atlasDb.databaseName !== 'RushiKrushiSevaKendra') {
    throw new Error(`Target database name mismatch! Expected "RushiKrushiSevaKendra", got "${atlasDb.databaseName}". Aborting for safety.`);
  }
  console.log(`✓ Confirmed target Atlas database: "${atlasDb.databaseName}"`);

  // Record before counts for all Atlas collections to guarantee unrelated data preservation
  const atlasCollsBefore = await atlasDb.listCollections().toArray();
  const beforeCounts = {};
  for (const c of atlasCollsBefore) {
    beforeCounts[c.name] = await atlasDb.collection(c.name).countDocuments();
  }
  console.log('\n--- Atlas Collection Counts BEFORE Migration ---');
  for (const [k, v] of Object.entries(beforeCounts)) {
    console.log(`  • ${k.padEnd(20)}: ${v}`);
  }

  // 2. Fetch all 98 Local products (Source of Truth)
  console.log('\n[Step 2/5] Reading verified Local MongoDB catalogue...');
  const localProducts = await localDb.collection('products').find({}).toArray();
  console.log(`✓ Retrieved ${localProducts.length} approved local products.`);

  const localIffco = localProducts.filter(p => p.brand === 'IFFCO-MC');
  const localZytonic = localProducts.filter(p => p.brand === 'Zytonic');
  const localLegacy = localProducts.filter(p => p.brand !== 'IFFCO-MC' && p.brand !== 'Zytonic');

  console.log(`  - IFFCO-MC: ${localIffco.length}`);
  console.log(`  - ZYTONIC:  ${localZytonic.length}`);
  console.log(`  - Legacy:   ${localLegacy.length}`);

  // Fetch current Atlas products
  const atlasProductsColl = atlasDb.collection('products');
  const existingAtlasProducts = await atlasProductsColl.find({}).toArray();
  const atlasByName = new Map(existingAtlasProducts.map(p => [p.nameEn.toLowerCase().trim(), p]));
  const atlasBySlug = new Map(existingAtlasProducts.map(p => [p.slug, p]));
  const atlasById = new Map(existingAtlasProducts.map(p => [p._id.toString(), p]));

  // 3. Migrate IFFCO-MC products (Insert new)
  console.log('\n[Step 3/5] Migrating IFFCO-MC catalogue (71 products)...');
  let iffcoInserted = 0;
  for (const p of localIffco) {
    // Sanitize document, preserve _id and local attributes
    const doc = { ...p };
    // Never expose confidential regularInvoicePrice as selling price
    if (doc.variants && Array.isArray(doc.variants)) {
      doc.variants = doc.variants.map(v => {
        const cleanV = { ...v };
        delete cleanV.regularInvoicePrice;
        delete cleanV.cartonBillingPrice;
        return cleanV;
      });
    }
    delete doc.regularInvoicePrice;

    // Check if already on Atlas
    const existing = atlasByName.get(doc.nameEn.toLowerCase().trim()) || atlasBySlug.get(doc.slug);
    if (!existing) {
      await atlasProductsColl.insertOne(doc);
      iffcoInserted++;
    } else {
      // If already present, update with latest local data
      const id = existing._id;
      delete doc._id;
      await atlasProductsColl.replaceOne({ _id: id }, doc);
    }
  }
  console.log(`✓ IFFCO-MC migration complete: ${iffcoInserted} new inserted.`);

  // 4. Migrate ZYTONIC products (Update 21 records)
  console.log('\n[Step 4/5] Synchronizing ZYTONIC catalogue (21 products)...');
  let zytonicUpdated = 0;
  for (const p of localZytonic) {
    const match = atlasByName.get(p.nameEn.toLowerCase().trim()) || atlasBySlug.get(p.slug);
    if (match) {
      await atlasProductsColl.updateOne(
        { _id: match._id },
        {
          $set: {
            stockQuantity: p.stockQuantity,
            availability: p.availability,
            imageUrl: p.imageUrl,
            status: 'published',
            isArchived: false,
            archivedAt: null,
            archivedReason: '',
            packSizes: p.packSizes,
            indicativePrice: p.indicativePrice,
            price: p.price,
            technicalComposition: p.technicalComposition,
            updatedAt: new Date()
          }
        }
      );
      zytonicUpdated++;
    } else {
      // In case not matched, insert
      await atlasProductsColl.insertOne(p);
    }
  }
  console.log(`✓ ZYTONIC synchronization complete: ${zytonicUpdated} records updated.`);

  // 5. Update Legacy products to Archived status
  console.log('\n[Step 5/5] Archiving unsupported legacy store products...');
  const archiveTimestamp = new Date();
  const archiveReason = 'Archived per client requirement: product is not part of currently approved client catalogues (IFFCO-MC and ZYTONIC)';

  let legacyArchived = 0;
  for (const p of localLegacy) {
    const match = atlasBySlug.get(p.slug) || atlasByName.get(p.nameEn.toLowerCase().trim());
    if (match) {
      await atlasProductsColl.updateOne(
        { _id: match._id },
        {
          $set: {
            status: 'archived',
            isArchived: true,
            archivedAt: archiveTimestamp,
            archivedReason: archiveReason,
            imageUrl: p.imageUrl, // Preserves verified Aspee image or empty placeholder
            updatedAt: new Date()
          }
        }
      );
      legacyArchived++;
    }
  }
  console.log(`✓ Legacy archival complete: ${legacyArchived} products updated to archived status.`);

  // Handle Savil cotton seed (Archive without deletion per user instruction)
  const savilMatch = existingAtlasProducts.find(p => p.brand === 'Savil' || (p.nameEn && p.nameEn.toLowerCase().includes('savil')));
  if (savilMatch) {
    await atlasProductsColl.updateOne(
      { _id: savilMatch._id },
      {
        $set: {
          status: 'archived',
          isArchived: true,
          archivedAt: archiveTimestamp,
          archivedReason: archiveReason,
          updatedAt: new Date()
        }
      }
    );
    console.log(`✓ Savil cotton seed [${savilMatch._id}] safely updated to archived status (preserved without deletion).`);
  }

  // 6. Ensure indexes on Atlas
  console.log('\nEnsuring required indexes on Atlas products collection...');
  await atlasProductsColl.createIndex({ slug: 1 }, { unique: true });
  await atlasProductsColl.createIndex({ category: 1 });
  await atlasProductsColl.createIndex({ availability: 1 });
  await atlasProductsColl.createIndex({ isFeatured: 1 });
  await atlasProductsColl.createIndex({ status: 1 });
  await atlasProductsColl.createIndex({ brand: 1 });
  await atlasProductsColl.createIndex({ isArchived: 1 });
  console.log('✓ Indexes verified on Atlas.');

  // 7. Post-Migration Verification
  console.log('\n================ POST-MIGRATION VERIFICATION ================');
  const totalAtlasAfter = await atlasProductsColl.countDocuments();
  const publishedAtlas = await atlasProductsColl.countDocuments({ status: 'published', isArchived: { $ne: true } });
  const archivedAtlas = await atlasProductsColl.countDocuments({ $or: [{ status: 'archived' }, { isArchived: true }] });
  const iffcoAtlas = await atlasProductsColl.countDocuments({ brand: 'IFFCO-MC', status: 'published', isArchived: { $ne: true } });
  const zytonicAtlas = await atlasProductsColl.countDocuments({ brand: 'Zytonic', status: 'published', isArchived: { $ne: true } });

  console.log(`Total Products on Atlas:     ${totalAtlasAfter} (Expected: 99)`);
  console.log(`Active Published Products:   ${publishedAtlas} (Must be exactly 92)`);
  console.log(`  • IFFCO-MC Active:         ${iffcoAtlas} (Must be 71)`);
  console.log(`  • ZYTONIC Active:          ${zytonicAtlas} (Must be 21)`);
  console.log(`Archived Products:           ${archivedAtlas} (6 legacy + 1 Savil = 7)`);

  // Verify unrelated collections were preserved
  console.log('\n--- Unrelated Collections Integrity Check ---');
  let unrelatedIntact = true;
  for (const [collName, countBefore] of Object.entries(beforeCounts)) {
    if (collName === 'products') continue;
    const countAfter = await atlasDb.collection(collName).countDocuments();
    const intact = countAfter === countBefore;
    console.log(`  • ${collName.padEnd(20)}: Before=${countBefore}, After=${countAfter} (${intact ? 'PRESERVED' : 'CHANGED'})`);
    if (!intact) unrelatedIntact = false;
  }

  if (publishedAtlas !== 92 || iffcoAtlas !== 71 || zytonicAtlas !== 21 || !unrelatedIntact) {
    throw new Error('FATAL: Post-migration verification checks failed!');
  }

  console.log('\n===============================================================');
  console.log('✅ ATLAS MIGRATION COMPLETED SUCCESSFULLY WITH 100% INTEGRITY');
  console.log('===============================================================\n');

  await localConn.close();
  await atlasConn.close();
}

migrateCatalogueToAtlas().catch(err => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
