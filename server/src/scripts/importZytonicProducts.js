/**
 * IDEMPOTENT ZYTONIC PRODUCT CATALOGUE IMPORT SCRIPT FOR LOCAL MONGODB
 *
 * Requirements:
 * - Dry-run by default (read-only preview).
 * - STRICT SAFETY GUARD: Connects ONLY to local MongoDB (localhost / 127.0.0.1).
 *   Immediately aborts if any Atlas or remote MongoDB URI is detected.
 * - Never modifies, overwrites, or deletes existing non-Zytonic products.
 * - Detects duplicates by brand ('Zytonic') and normalized product name.
 * - Imports the 21 canonical Zytonic products with exact stock quantities.
 * - Leaves unknown stock as null (never converts unknown stock to zero).
 * - Does not invent prices, images, or translations.
 * - Includes automated local MongoDB backup before applying writes.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Prioritize .env.local for local testing
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const localEnvPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(localEnvPath)) {
  require('dotenv').config({ path: localEnvPath, override: true });
}

const Product = require('../models/Product');

/**
 * 21 Canonical Zytonic products derived from client stock list with approved decisions:
 * Decision 1: Merge Sr 1 (XZYTONIC M 2KG, stock 4) and Sr 23 (ZYTONIC-M-2KG, stock 1) into ZYTONIC-M 2KG (stock 5).
 * Decision 2: Exclude Sr 2 (XZYTONIC M-5KG DONT USE, stock 0).
 * Decision 3: Map stock > 0 to in_stock, stock === 0 to out_of_stock.
 */
function getCanonicalZytonicProducts() {
  const excluded = [
    {
      srNo: 2,
      rawItemName: 'XZYTONIC M-5KG DONT USE',
      stock: 0,
      reason: "Excluded from active product catalogue per instruction. Explicitly annotated 'DONT USE'; 0 stock; superseded by active SKU ZYTONIC-M 5KG."
    }
  ];

  const candidates = [
    {
      nameEn: 'ZYTONIC-M 2KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Biofertilizers',
      packSizes: ['2 kg'],
      stockQuantity: 5,
      availability: 'in_stock',
      sources: [
        { srNo: 1, rawName: 'XZYTONIC M 2KG', stock: 4 },
        { srNo: 23, rawName: 'ZYTONIC-M-2KG', stock: 1 }
      ],
      mergeNote: 'Merged from Sr 1 (qty 4) and Sr 23 (qty 1)'
    },
    {
      nameEn: 'ZYTONIC ACTIVE 100ML',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Plant Growth Promoters',
      packSizes: ['100 ml'],
      stockQuantity: 820,
      availability: 'in_stock',
      sources: [{ srNo: 3, rawName: 'ZYTONIC ACTIVE 100ML', stock: 820 }]
    },
    {
      nameEn: 'ZYTONIC ACTIVE 250ML',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Plant Growth Promoters',
      packSizes: ['250 ml'],
      stockQuantity: 652,
      availability: 'in_stock',
      sources: [{ srNo: 4, rawName: 'ZYTONIC ACTIVE 250ML', stock: 652 }]
    },
    {
      nameEn: 'ZYTONIC ACTIVE 500ML',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Plant Growth Promoters',
      packSizes: ['500 ml'],
      stockQuantity: 108,
      availability: 'in_stock',
      sources: [{ srNo: 5, rawName: 'ZYTONIC ACTIVE 500ML', stock: 108 }]
    },
    {
      nameEn: 'ZYTONIC BIO BOOSTER 250ML',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Biofertilizers',
      packSizes: ['250 ml'],
      stockQuantity: 70,
      availability: 'in_stock',
      sources: [{ srNo: 6, rawName: 'ZYTONIC BIO BOOSTER 250ML', stock: 70 }]
    },
    {
      nameEn: 'ZYTONIC BIO BOOSTER 500ML',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Biofertilizers',
      packSizes: ['500 ml'],
      stockQuantity: 21,
      availability: 'in_stock',
      sources: [{ srNo: 7, rawName: 'ZYTONIC BIO BOOSTER 500ML', stock: 21 }]
    },
    {
      nameEn: 'ZYTONIC BIOACTIVE 250GM',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Biofertilizers',
      packSizes: ['250 gm'],
      stockQuantity: 14,
      availability: 'in_stock',
      sources: [{ srNo: 8, rawName: 'ZYTONIC BIOACTIVE 250GM', stock: 14 }]
    },
    {
      nameEn: 'ZYTONIC BIOPEST DRIP KIT 100ML X 4NOS',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Organic Inputs',
      packSizes: ['100 ml x 4 nos'],
      stockQuantity: 2,
      availability: 'in_stock',
      sources: [{ srNo: 9, rawName: 'ZYTONIC BIOPEST DRIP KIT 100ML X 4NOS', stock: 2 }]
    },
    {
      nameEn: 'ZYTONIC BIOPEST SOIL KIT 100ML X 4NOS',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Organic Inputs',
      packSizes: ['100 ml x 4 nos'],
      stockQuantity: 54,
      availability: 'in_stock',
      sources: [{ srNo: 10, rawName: 'ZYTONIC BIOPEST SOIL KIT 100ML X 4NOS', stock: 54 }]
    },
    {
      nameEn: 'ZYTONIC GODHAN 15KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Organic Inputs',
      packSizes: ['15 kg'],
      stockQuantity: 2,
      availability: 'in_stock',
      sources: [{ srNo: 11, rawName: 'ZYTONIC GODHAN 15KG', stock: 2 }]
    },
    {
      nameEn: 'ZYTONIC GODHAN 2KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Organic Inputs',
      packSizes: ['2 kg'],
      stockQuantity: 0,
      availability: 'out_of_stock',
      sources: [{ srNo: 12, rawName: 'ZYTONIC GODHAN 2KG', stock: 0 }]
    },
    {
      nameEn: 'ZYTONIC K 2KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Biofertilizers',
      packSizes: ['2 kg'],
      stockQuantity: 0,
      availability: 'out_of_stock',
      sources: [{ srNo: 13, rawName: 'ZYTONIC K 2KG', stock: 0 }]
    },
    {
      nameEn: 'ZYTONIC MINI KIT 8KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Organic Inputs',
      packSizes: ['8 kg'],
      stockQuantity: 6,
      availability: 'in_stock',
      sources: [{ srNo: 14, rawName: 'ZYTONIC MINI KIT 8KG', stock: 6 }]
    },
    {
      nameEn: 'ZYTONIC NEEM 300PPM 250ML',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Organic Inputs',
      packSizes: ['250 ml'],
      stockQuantity: 33,
      availability: 'in_stock',
      sources: [{ srNo: 15, rawName: 'ZYTONIC NEEM 300PPM 250ML', stock: 33 }]
    },
    {
      nameEn: 'ZYTONIC NEEM 300PPM 500ML',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Organic Inputs',
      packSizes: ['500 ml'],
      stockQuantity: 20,
      availability: 'in_stock',
      sources: [{ srNo: 16, rawName: 'ZYTONIC NEEM 300PPM 500ML', stock: 20 }]
    },
    {
      nameEn: 'ZYTONIC NPK 2KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Biofertilizers',
      packSizes: ['2 kg'],
      stockQuantity: 0,
      availability: 'out_of_stock',
      sources: [{ srNo: 17, rawName: 'ZYTONIC NPK 2KG', stock: 0 }]
    },
    {
      nameEn: 'ZYTONIC NURSERY KIT 2KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Organic Inputs',
      packSizes: ['2 kg'],
      stockQuantity: 41,
      availability: 'in_stock',
      sources: [{ srNo: 18, rawName: 'ZYTONIC NURSERY KIT 2KG', stock: 41 }]
    },
    {
      nameEn: 'ZYTONIC SURAKSHA 250GM',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Organic Inputs',
      packSizes: ['250 gm'],
      stockQuantity: 13,
      availability: 'in_stock',
      sources: [{ srNo: 19, rawName: 'ZYTONIC SURAKSHA 250GM', stock: 13 }]
    },
    {
      nameEn: 'ZYTONIC ZINC 2KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Micronutrients',
      packSizes: ['2 kg'],
      stockQuantity: 3,
      availability: 'in_stock',
      sources: [{ srNo: 20, rawName: 'ZYTONIC ZINC 2KG', stock: 3 }]
    },
    {
      nameEn: 'ZYTONIC-M 5KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Biofertilizers',
      packSizes: ['5 kg'],
      stockQuantity: 22,
      availability: 'in_stock',
      sources: [{ srNo: 21, rawName: 'ZYTONIC-M 5KG', stock: 22 }]
    },
    {
      nameEn: 'ZYTONIC-M-15KG',
      brand: 'Zytonic',
      company: 'Zytonic',
      category: 'Biofertilizers',
      packSizes: ['15 kg'],
      stockQuantity: 38,
      availability: 'in_stock',
      sources: [{ srNo: 22, rawName: 'ZYTONIC-M-15KG', stock: 38 }]
    }
  ];

  return { candidates, excluded };
}

async function runZytonicImport() {
  const isApply = process.argv.includes('--apply') || process.argv.includes('--execute');
  console.log('====================================================');
  console.log(`ZYTONIC PRODUCT IMPORT - MODE: ${isApply ? 'LIVE LOCAL APPLY' : 'DRY RUN (READ ONLY PREVIEW)'}`);
  console.log('====================================================');

  const { candidates, excluded } = getCanonicalZytonicProducts();

  console.log('\n--- Excluded Records (for traceability) ---');
  excluded.forEach((ex, idx) => {
    console.log(`[EXCLUDED #${idx + 1}] Sr #${ex.srNo}: "${ex.rawItemName}" (Stock: ${ex.stock})`);
    console.log(`              Reason: ${ex.reason}`);
  });

  console.log(`\n--- Candidate Canonical Products: ${candidates.length} ---`);
  if (candidates.length !== 21) {
    console.error(`FATAL: Candidate count is ${candidates.length}, expected exactly 21! Aborting.`);
    process.exit(1);
  }

  // STRICT SAFETY GUARD: Verify connection string targets 127.0.0.1 or localhost ONLY
  const localTargetURI = process.env.MONGODB_LOCAL_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/RushiKrushiSevaKendra';

  if (localTargetURI.includes('mongodb.net') || localTargetURI.startsWith('mongodb+srv:')) {
    console.error('FATAL SAFETY VIOLATION: Remote MongoDB Atlas URI detected.');
    console.error('This script is strictly restricted to local database environments (localhost / 127.0.0.1).');
    console.error('Aborting immediately without modifying anything.');
    process.exit(1);
  }

  console.log('[Safe Local Guard] Target URI verified as local.');
  console.log('[Safe Local Guard] Connecting strictly to local MongoDB database...');

  await mongoose.connect(localTargetURI, {
    serverSelectionTimeoutMS: 5000,
  });

  const connection = mongoose.connection;
  const host = connection.host;
  const dbName = connection.name;

  if (host !== '127.0.0.1' && host !== 'localhost') {
    console.error(`FATAL: Connected host is not localhost (${host}). STOPPING.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`[Safe Local Guard] Positively connected to local host: ${host}, database: ${dbName}`);

  // Inspect existing products
  const totalBefore = await Product.countDocuments();
  const existingZytonic = await Product.find({ brand: 'Zytonic' });
  const existingIffco = await Product.find({ brand: 'IFFCO-MC' });
  const existingLegacy = await Product.find({ brand: { $nin: ['Zytonic', 'IFFCO-MC'] } });

  console.log(`\n[Local DB Status Before Operation]`);
  console.log(`  Total products in database: ${totalBefore}`);
  console.log(`  Existing Legacy products: ${existingLegacy.length}`);
  console.log(`  Existing IFFCO-MC products: ${existingIffco.length}`);
  console.log(`  Existing Zytonic products: ${existingZytonic.length}`);

  const existingZytonicMap = new Map();
  existingZytonic.forEach((p) => {
    existingZytonicMap.set(p.nameEn.toLowerCase().trim(), p);
  });

  const proposedInserts = [];
  const existingMatches = [];

  for (const item of candidates) {
    const key = item.nameEn.toLowerCase().trim();
    if (existingZytonicMap.has(key)) {
      existingMatches.push({
        candidate: item,
        existing: existingZytonicMap.get(key)
      });
    } else {
      proposedInserts.push(item);
    }
  }

  console.log(`\nDuplicate Analysis against local MongoDB:`);
  console.log(`  Proposed New Inserts: ${proposedInserts.length}`);
  console.log(`  Already Existing Matches: ${existingMatches.length}`);

  console.log('\n--- Proposed Zytonic Inserts Preview ---');
  console.table(
    candidates.map((c, idx) => ({
      '#': idx + 1,
      Name: c.nameEn,
      Category: c.category,
      Pack: c.packSizes.join(', '),
      Stock: c.stockQuantity,
      Status: c.availability,
      ExistsLocally: existingZytonicMap.has(c.nameEn.toLowerCase().trim()) ? 'YES' : 'NO'
    }))
  );

  if (!isApply) {
    console.log('\n====================================================');
    console.log('DRY RUN COMPLETE:');
    console.log(` - Target Host: ${host} (127.0.0.1)`);
    console.log(` - Target Database: ${dbName}`);
    console.log(` - Existing Legacy Products Preserved: ${existingLegacy.length}`);
    console.log(` - Existing IFFCO-MC Products Preserved: ${existingIffco.length}`);
    console.log(` - Zytonic Candidate Products: ${candidates.length}`);
    console.log(` - Proposed Inserts: ${proposedInserts.length}`);
    console.log(` - Skipped / Existing: ${existingMatches.length}`);
    console.log('No database modifications were made.');
    console.log('To execute the import locally, run with: --apply');
    console.log('====================================================');
    await mongoose.disconnect();
    return;
  }

  // APPLY MODE
  console.log('\n====================================================');
  console.log(`EXECUTING LIVE LOCAL IMPORT OF ${proposedInserts.length} ZYTONIC PRODUCTS...`);
  console.log('====================================================');

  // 1. Take JSON backup before write
  const backupDir = path.resolve(__dirname, '../data/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `products_pre_zytonic_backup_${timestamp}.json`);
  const allCurrentDocs = await Product.find({}).lean();
  fs.writeFileSync(backupFilePath, JSON.stringify(allCurrentDocs, null, 2), 'utf8');
  console.log(`[Backup] Successfully backed up ${allCurrentDocs.length} local products to:`);
  console.log(`         ${backupFilePath}`);

  let insertedCount = 0;
  for (const item of proposedInserts) {
    const canonicalSlug = item.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const docToInsert = {
      nameEn: item.nameEn,
      nameMr: item.nameEn, // safe fallback to English without inventing
      slug: canonicalSlug,
      brand: item.brand,
      company: item.company,
      category: item.category,
      imageUrl: '',
      descriptionEn: item.nameEn,
      descriptionMr: item.nameEn,
      packSizes: item.packSizes,
      stockQuantity: item.stockQuantity,
      availability: item.availability,
      price: null,
      indicativePrice: '',
      isFeatured: false,
      status: 'published'
    };

    await Product.create(docToInsert);
    insertedCount++;
  }

  console.log(`\n[Import Success] Successfully inserted ${insertedCount} Zytonic products into local MongoDB.`);

  // 2. Comprehensive Post-Import Verification
  console.log('\n====================================================');
  console.log('POST-IMPORT VERIFICATION REPORT');
  console.log('====================================================');

  const totalAfter = await Product.countDocuments();
  const zytonicInDb = await Product.find({ brand: 'Zytonic' });
  const iffcoInDb = await Product.find({ brand: 'IFFCO-MC' });
  const legacyInDb = await Product.find({ brand: { $nin: ['Zytonic', 'IFFCO-MC'] } });

  console.log(`Total Products in Local Database: ${totalAfter} (Expected: ${totalBefore + insertedCount})`);
  console.log(`Legacy Products Preserved: ${legacyInDb.length} (Expected: 6)`);
  console.log(`IFFCO-MC Products Preserved: ${iffcoInDb.length} (Expected: 71)`);
  console.log(`Zytonic Products in Database: ${zytonicInDb.length} (Expected: 21)`);

  let positiveStockCount = 0;
  let zeroStockCount = 0;
  let totalStockSum = 0;

  for (const p of zytonicInDb) {
    totalStockSum += p.stockQuantity;
    if (p.stockQuantity > 0) {
      positiveStockCount++;
      if (p.availability !== 'in_stock') {
        console.error(`Mismatch on availability for positive stock item: ${p.nameEn}`);
      }
    } else if (p.stockQuantity === 0) {
      zeroStockCount++;
      if (p.availability !== 'out_of_stock') {
        console.error(`Mismatch on availability for zero stock item: ${p.nameEn}`);
      }
    }
  }

  console.log(`Zytonic positive stock items (> 0): ${positiveStockCount} (Expected: 18)`);
  console.log(`Zytonic zero stock items (=== 0, Out of stock): ${zeroStockCount} (Expected: 3)`);
  console.log(`Zytonic total stock sum: ${totalStockSum} units`);

  // Verify non-Zytonic products maintain unknown stock as null
  let nonZytonicNullStockCount = 0;
  for (const p of iffcoInDb) {
    if (p.stockQuantity === null) nonZytonicNullStockCount++;
  }
  console.log(`IFFCO-MC products with stockQuantity === null (Unknown): ${nonZytonicNullStockCount} (Expected: 71)`);

  if (
    zytonicInDb.length === 21 &&
    iffcoInDb.length === 71 &&
    legacyInDb.length === 6 &&
    zeroStockCount === 3 &&
    positiveStockCount === 18 &&
    nonZytonicNullStockCount === 71
  ) {
    console.log('\n[ALL RECONCILIATION CHECKS PASSED PERFECTLY]');
  } else {
    console.error('\n[VERIFICATION WARNING: Some counts did not match expectations]');
  }

  await mongoose.disconnect();
  console.log('[Safe Local Guard] Disconnected from local MongoDB cleanly.');
}

if (require.main === module) {
  runZytonicImport().catch((err) => {
    console.error('Execution error:', err);
    process.exit(1);
  });
}

module.exports = { runZytonicImport };
