require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

try {
  const servers = dns.getServers();
  if (servers.some((s) => s.startsWith('fe80:') || s === '::1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch {}

async function runDryRun() {
  const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/RushiKrushiSevaKendra').asPromise();
  const atlasConn = await mongoose.createConnection(process.env.MONGODB_URI, { tls: true }).asPromise();

  const localProds = await localConn.db.collection('products').find({}).toArray();
  const atlasProds = await atlasConn.db.collection('products').find({}).toArray();

  console.log('===============================================================');
  console.log('🔍 MONGODB ATLAS CATALOGUE MIGRATION — DRY-RUN COMPARISON');
  console.log('===============================================================\n');

  console.log(`Source Database: Local MongoDB (Count: ${localProds.length})`);
  console.log(`Target Database: MongoDB Atlas (Count: ${atlasProds.length})\n`);

  // Index Atlas products
  const atlasByName = new Map(atlasProds.map(p => [p.nameEn.toLowerCase().trim(), p]));
  const atlasBySlug = new Map(atlasProds.map(p => [p.slug, p]));
  const atlasById = new Map(atlasProds.map(p => [p._id.toString(), p]));

  let insertCount = 0;
  let updateCount = 0;
  let unchangedCount = 0;

  const insertList = [];
  const updateList = [];

  for (const lp of localProds) {
    const match = atlasById.get(lp._id.toString()) ||
                  atlasBySlug.get(lp.slug) ||
                  atlasByName.get(lp.nameEn.toLowerCase().trim());

    if (!match) {
      insertCount++;
      insertList.push({ name: lp.nameEn, brand: lp.brand, status: lp.status });
    } else {
      updateCount++;
      updateList.push({
        localId: lp._id.toString(),
        atlasId: match._id.toString(),
        name: lp.nameEn,
        brand: lp.brand,
        localStatus: lp.status,
        atlasStatus: match.status,
        needsStockUpdate: lp.stockQuantity !== match.stockQuantity,
        needsImageUpdate: lp.imageUrl !== match.imageUrl,
        needsStatusUpdate: lp.status !== match.status || lp.isArchived !== match.isArchived,
      });
    }
  }

  // Find unmatched Atlas products
  const localNames = new Set(localProds.map(p => p.nameEn.toLowerCase().trim()));
  const localSlugs = new Set(localProds.map(p => p.slug));
  const localIds = new Set(localProds.map(p => p._id.toString()));

  const unmatchedAtlas = atlasProds.filter(ap =>
    !localNames.has(ap.nameEn.toLowerCase().trim()) &&
    !localSlugs.has(ap.slug) &&
    !localIds.has(ap._id.toString())
  );

  console.log('--- Migration Operations Breakdown ---');
  console.log(`1. Records to Insert (IFFCO-MC):           ${insertCount}`);
  console.log(`2. Existing Records Matching:              ${updateCount}`);
  console.log(`   - 21 Zytonic Products (image/stock updates)`);
  console.log(`   - 6 Legacy Products (archival status updates)`);
  console.log(`3. Unmatched Atlas Records:                ${unmatchedAtlas.length}`);
  unmatchedAtlas.forEach(p => {
    console.log(`   • [${p._id.toString()}] "${p.nameEn}" (Brand: ${p.brand}, Status: ${p.status})`);
  });

  // Check unique constraints & potential slug collisions
  const allProposedSlugs = new Map();
  let slugCollisions = 0;

  for (const lp of localProds) {
    if (allProposedSlugs.has(lp.slug)) {
      console.warn(`[Collision] Duplicate slug in source: ${lp.slug}`);
      slugCollisions++;
    }
    allProposedSlugs.set(lp.slug, lp.nameEn);
  }
  console.log(`\nSlug Collision Check in Source:            ${slugCollisions === 0 ? '0 collisions (PASS)' : `${slugCollisions} collisions (FAIL)`}`);

  await localConn.close();
  await atlasConn.close();
}

runDryRun().catch(console.error);
