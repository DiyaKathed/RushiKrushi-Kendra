require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for SRV lookups if needed
try {
  const servers = dns.getServers();
  if (servers.some((s) => s.startsWith('fe80:') || s === '::1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch {}

async function inspectDb(uri, label) {
  console.log(`\n======================================================`);
  console.log(`🔍 INSPECTING: ${label}`);
  console.log(`======================================================`);

  const conn = await mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
    tls: uri.startsWith('mongodb+srv:'),
  }).asPromise();

  const db = conn.db;
  const dbName = db.databaseName;
  console.log(`Database Name: ${dbName}`);

  // List collections
  const collections = await db.listCollections().toArray();
  const collNames = collections.map(c => c.name).sort();
  console.log(`Collections (${collNames.length}):`, collNames.join(', '));

  console.log('\n--- Collection Record Counts ---');
  for (const name of collNames) {
    const count = await db.collection(name).countDocuments();
    console.log(`  • ${name.padEnd(20)}: ${count}`);
  }

  // Inspect Products collection in detail
  if (collNames.includes('products')) {
    const productsColl = db.collection('products');
    const totalProducts = await productsColl.countDocuments();
    const publishedProducts = await productsColl.countDocuments({ status: 'published', isArchived: { $ne: true } });
    const archivedProducts = await productsColl.countDocuments({ $or: [{ status: 'archived' }, { isArchived: true }] });
    const draftProducts = await productsColl.countDocuments({ status: 'draft', isArchived: { $ne: true } });

    console.log('\n--- Product Summary ---');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Published (Active): ${publishedProducts}`);
    console.log(`Archived: ${archivedProducts}`);
    console.log(`Drafts: ${draftProducts}`);

    // Group by Brand and Status
    const brandStatusAgg = await productsColl.aggregate([
      {
        $group: {
          _id: {
            brand: { $ifNull: ['$brand', '$company', 'Unknown'] },
            status: { $ifNull: ['$status', 'Unknown'] },
            isArchived: { $ifNull: ['$isArchived', false] }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.brand': 1, '_id.status': 1 } }
    ]).toArray();

    console.log('\n--- Products by Brand & Status ---');
    brandStatusAgg.forEach(item => {
      console.log(`  • Brand: ${String(item._id.brand).padEnd(28)} | Status: ${String(item._id.status).padEnd(10)} | isArchived: ${String(item._id.isArchived).padEnd(5)} | Count: ${item.count}`);
    });

    // Check indexes
    const indexes = await productsColl.indexes();
    console.log('\n--- Product Indexes ---');
    indexes.forEach(idx => {
      console.log(`  • Index name: ${idx.name}, Keys: ${JSON.stringify(idx.key)}, Unique: ${Boolean(idx.unique)}`);
    });

    // Check for duplicate slugs or names
    const slugDups = await productsColl.aggregate([
      { $group: { _id: '$slug', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 }, _id: { $ne: null } } }
    ]).toArray();

    const nameBrandDups = await productsColl.aggregate([
      {
        $group: {
          _id: {
            nameEn: { $toLower: '$nameEn' },
            brand: { $toLower: '$brand' }
          },
          count: { $sum: 1 },
          docs: { $push: { id: '$_id', name: '$nameEn' } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    console.log('\n--- Duplicate Analysis ---');
    console.log(`Duplicate Slugs: ${slugDups.length}`);
    if (slugDups.length > 0) console.log(slugDups);
    console.log(`Duplicate (Name + Brand): ${nameBrandDups.length}`);
    if (nameBrandDups.length > 0) console.log(JSON.stringify(nameBrandDups, null, 2));

    // Sample fields check
    const sample = await productsColl.findOne();
    if (sample) {
      console.log('\n--- Sample Product Field Check ---');
      const expectedFields = ['nameEn', 'brand', 'category', 'status', 'isArchived', 'packSizes', 'variants', 'imageUrl', 'price'];
      const present = expectedFields.filter(f => sample[f] !== undefined);
      const missing = expectedFields.filter(f => sample[f] === undefined);
      console.log(`Present fields in sample: ${present.join(', ')}`);
      if (missing.length > 0) console.log(`Fields omitted in sample: ${missing.join(', ')}`);
    }
  }

  await conn.close();
}

async function run() {
  const localUri = 'mongodb://127.0.0.1:27017/RushiKrushiSevaKendra';
  const atlasUri = process.env.MONGODB_URI;

  if (!atlasUri) {
    throw new Error('MONGODB_URI not found in environment!');
  }

  // 1. Inspect Local DB
  await inspectDb(localUri, 'Local MongoDB Community Server (127.0.0.1:27017)');

  // 2. Inspect Atlas DB
  await inspectDb(atlasUri, 'Remote MongoDB Atlas Cluster');
}

run().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
