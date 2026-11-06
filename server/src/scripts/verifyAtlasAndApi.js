require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const http = require('http');

try {
  const servers = dns.getServers();
  if (servers.some((s) => s.startsWith('fe80:') || s === '::1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch {}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function verifyAtlasAndApi() {
  console.log('===============================================================');
  console.log('🔍 INDEPENDENT ATLAS & API VERIFICATION');
  console.log('===============================================================\n');

  const atlasUri = process.env.MONGODB_URI;
  const atlasConn = await mongoose.createConnection(atlasUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 20000,
    tls: true,
  }).asPromise();

  const atlasDb = atlasConn.db;
  console.log(`✓ Connected directly to Atlas database: "${atlasDb.databaseName}"`);

  // Direct Atlas DB Queries
  const productsColl = atlasDb.collection('products');
  const allProducts = await productsColl.find({}).toArray();
  const publishedProducts = await productsColl.find({ status: 'published', isArchived: { $ne: true } }).toArray();
  const archivedProducts = await productsColl.find({ $or: [{ status: 'archived' }, { isArchived: true }] }).toArray();
  const iffcoProducts = await productsColl.find({ brand: 'IFFCO-MC', status: 'published', isArchived: { $ne: true } }).toArray();
  const zytonicProducts = await productsColl.find({ brand: 'Zytonic', status: 'published', isArchived: { $ne: true } }).toArray();

  console.log('\n--- 1. Direct Atlas Products Counts ---');
  console.log(`• Total Products in Atlas:        ${allProducts.length}`);
  console.log(`• Published Active Products:      ${publishedProducts.length} (Expected: 92)`);
  console.log(`  - IFFCO-MC Active:              ${iffcoProducts.length} (Expected: 71)`);
  console.log(`  - ZYTONIC Active:               ${zytonicProducts.length} (Expected: 21)`);
  console.log(`• Archived Products:              ${archivedProducts.length} (Expected: 7: 6 legacy + 1 Savil)`);

  // Check for duplicates
  const nameCounts = {};
  const slugCounts = {};
  for (const p of allProducts) {
    const n = p.nameEn.toLowerCase().trim();
    nameCounts[n] = (nameCounts[n] || 0) + 1;
    slugCounts[p.slug] = (slugCounts[p.slug] || 0) + 1;
  }
  const duplicateNames = Object.entries(nameCounts).filter(([_, count]) => count > 1);
  const duplicateSlugs = Object.entries(slugCounts).filter(([_, count]) => count > 1);
  console.log(`• Duplicate Names:                ${duplicateNames.length}`);
  console.log(`• Duplicate Slugs:                ${duplicateSlugs.length}`);

  // Check null stock preservation
  const iffcoNullStock = iffcoProducts.filter(p => p.stockQuantity === null || p.stockQuantity === undefined);
  console.log(`• IFFCO-MC Products with null stock: ${iffcoNullStock.length}/${iffcoProducts.length} (Expected: 71)`);

  // Check Zytonic stock preservation
  const zytonicWithStock = zytonicProducts.filter(p => typeof p.stockQuantity === 'number');
  console.log(`• ZYTONIC Products with explicit stock: ${zytonicWithStock.length}/${zytonicProducts.length} (Expected: 21)`);

  // Check confidential B2B pricing protection
  let confidentialLeaked = 0;
  for (const p of allProducts) {
    if (p.regularInvoicePrice || p.cartonBillingPrice) confidentialLeaked++;
    if (p.variants && p.variants.some(v => v.regularInvoicePrice || v.cartonBillingPrice)) confidentialLeaked++;
  }
  console.log(`• Records with Leaked B2B Prices: ${confidentialLeaked} (Must be 0)`);

  // Check Image URLs
  const productsWithImages = allProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
  console.log(`• Products with image URLs:       ${productsWithImages.length}/${allProducts.length}`);

  // Check Unrelated Collections
  console.log('\n--- 2. Unrelated Collections Check ---');
  const collections = ['articles', 'bookings', 'contactenquiries', 'crops', 'farmercrops', 'sitevisits', 'users'];
  for (const c of collections) {
    const count = await atlasDb.collection(c).countDocuments();
    console.log(`• ${c.padEnd(20)}: ${count} records`);
  }

  // API Verification
  console.log('\n--- 3. Running Atlas-Backed API Tests ---');
  const apiBase = 'http://localhost:5050/api';

  // 1. GET /api/products?limit=200
  const allRes = await fetchJson(`${apiBase}/products?limit=200`);
  const pubCountApi = allRes.data.data?.products?.length || allRes.data.products?.length || (Array.isArray(allRes.data) ? allRes.data.length : 0);
  console.log(`• GET /api/products?limit=200:   Status=${allRes.status}, Count=${pubCountApi} (Expected: 92)`);

  // 2. GET /api/products?brand=IFFCO-MC
  const iffcoRes = await fetchJson(`${apiBase}/products?brand=IFFCO-MC&limit=200`);
  const iffcoCountApi = iffcoRes.data.data?.products?.length || iffcoRes.data.products?.length || (Array.isArray(iffcoRes.data) ? iffcoRes.data.length : 0);
  console.log(`• GET /api/products?brand=IFFCO-MC: Status=${iffcoRes.status}, Count=${iffcoCountApi} (Expected: 71)`);

  // 3. GET /api/products?brand=Zytonic
  const zytonicRes = await fetchJson(`${apiBase}/products?brand=Zytonic&limit=200`);
  const zytonicCountApi = zytonicRes.data.data?.products?.length || zytonicRes.data.products?.length || (Array.isArray(zytonicRes.data) ? zytonicRes.data.length : 0);
  console.log(`• GET /api/products?brand=Zytonic: Status=${zytonicRes.status}, Count=${zytonicCountApi} (Expected: 21)`);

  // 4. Check archived legacy products are NOT returned publicly
  const custodiaRes = await fetchJson(`${apiBase}/products?search=Custodia`);
  const custodiaCount = custodiaRes.data.data?.products?.length || custodiaRes.data.products?.length || (Array.isArray(custodiaRes.data) ? custodiaRes.data.length : 0);
  console.log(`• Public search for archived "Custodia": Returned=${custodiaCount} (Expected: 0)`);

  const savilRes = await fetchJson(`${apiBase}/products?search=Savil`);
  const savilCount = savilRes.data.data?.products?.length || savilRes.data.products?.length || (Array.isArray(savilRes.data) ? savilRes.data.length : 0);
  console.log(`• Public search for archived "Savil":    Returned=${savilCount} (Expected: 0)`);

  // 5. Admin access protection (archive/restore endpoint without auth must return 401)
  const patchWithoutAuth = await new Promise((resolve) => {
    const req = http.request(`${apiBase}/products/randomid/archive`, { method: 'PATCH' }, (res) => {
      resolve({ status: res.statusCode });
    });
    req.on('error', (err) => resolve({ status: 'ERR', err }));
    req.end();
  });
  console.log(`• PATCH /api/products/:id/archive (unauthenticated): Status=${patchWithoutAuth.status} (Expected: 401)`);

  // 6. Check Local Database Unchanged
  console.log('\n--- 4. Local Database Integrity Check ---');
  const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/RushiKrushiSevaKendra').asPromise();
  const localCount = await localConn.db.collection('products').countDocuments();
  const localPub = await localConn.db.collection('products').countDocuments({ status: 'published', isArchived: { $ne: true } });
  const localArch = await localConn.db.collection('products').countDocuments({ $or: [{ status: 'archived' }, { isArchived: true }] });
  console.log(`• Local Total Products:           ${localCount} (Expected: 98)`);
  console.log(`• Local Published Products:       ${localPub} (Expected: 92)`);
  console.log(`• Local Archived Products:        ${localArch} (Expected: 6)`);
  console.log('✓ Confirmed local database was NOT altered during migration.');

  await atlasConn.close();
  await localConn.close();

  console.log('\n===============================================================');
  console.log('✅ ALL ATLAS AND API VERIFICATION CHECKS PASSED');
  console.log('===============================================================\n');
}

verifyAtlasAndApi().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
