/**
 * IDEMPOTENT IFFCO-MC PRODUCT CATALOGUE IMPORT SCRIPT
 *
 * Requirements:
 * - Dry-run by default (read-only preview).
 * - STRICT SAFETY GUARD: Connects ONLY to local MongoDB (localhost / 127.0.0.1).
 *   Immediately aborts if any Atlas or remote MongoDB URI is detected.
 * - Never modifies, overwrites, or deletes existing products.
 * - Detects duplicates by company ('IFFCO-MC') and normalized product name.
 * - Preserves all 71 canonical products with their 242 pack variants.
 * - Preserves MRP, Regular Invoice Price, and source date ('05/10/2025').
 * - Does not assign stock quantities or invent product images.
 * - Shows complete preview of proposed inserts and any skipped or ambiguous entries.
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

async function previewOrImportIffcoMc() {
  const isApply = process.argv.includes('--apply');
  console.log('====================================================');
  console.log(`IFFCO-MC PRODUCT IMPORT - MODE: ${isApply ? 'LIVE LOCAL APPLY' : 'DRY RUN (READ ONLY PREVIEW)'}`);
  console.log('====================================================');

  const dataFilePath = path.resolve(__dirname, '../data/iffcoMcProducts.json');
  if (!fs.existsSync(dataFilePath)) {
    console.error(`FATAL: IFFCO-MC data file not found at ${dataFilePath}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  const metadata = rawData.metadata || {};
  const products = rawData.products || [];

  console.log(`[Source Metadata] Company: ${metadata.company}`);
  console.log(`[Source Metadata] Price List Document: ${metadata.documentTitle}`);
  console.log(`[Source Metadata] Price List Date: ${metadata.dated}`);
  console.log(`[Source Metadata] Total Candidate Products: ${products.length}`);
  console.log(`[Source Metadata] Total Pack Variants (SKUs): ${metadata.totalSkus}`);

  // STRICT SAFETY GUARD: Verify connection string targets 127.0.0.1 or localhost ONLY
  const localTargetURI = process.env.MONGODB_LOCAL_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/RushiKrushiSevaKendra';

  if (localTargetURI.includes('mongodb.net') || localTargetURI.startsWith('mongodb+srv:')) {
    console.error('FATAL SAFETY VIOLATION: Remote MongoDB Atlas URI detected.');
    console.error('This script is strictly restricted to local database environments (localhost / 127.0.0.1).');
    console.error('Aborting immediately.');
    process.exit(1);
  }

  console.log('[Safe Local Guard] Target URI verified as local.');
  console.log('[Safe Local Guard] Connecting strictly to local MongoDB database...');

  let isConnected = false;
  try {
    await mongoose.connect(localTargetURI, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
  } catch (err) {
    console.log('[Notice] Local MongoDB is currently offline or unreachable at', localTargetURI);
    console.log('[Notice] Running in simulated dry-run mode against canonical source data.');
  }

  let existingProducts = [];
  if (isConnected) {
    const connection = mongoose.connection;
    const host = connection.host;
    const dbName = connection.name;

    if (host !== '127.0.0.1' && host !== 'localhost') {
      console.error(`FATAL: Connected host is not localhost (${host}). STOPPING.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`[Safe Local Guard] Positively connected to local host: ${host}, database: ${dbName}`);
    existingProducts = await Product.find({}, 'nameEn brand slug category');
    console.log(`[Local DB] Current existing products in local database: ${existingProducts.length}`);
  }

  // Duplicate analysis against existing DB
  const existingNameMap = new Map();
  existingProducts.forEach((p) => {
    const key = `${(p.brand || '').toLowerCase().trim()}:::${(p.nameEn || '').toLowerCase().trim()}`;
    existingNameMap.set(key, p);
  });

  const proposedInserts = [];
  const skippedDuplicates = [];
  const ambiguousEntries = [];

  for (const item of products) {
    const brandKey = 'iffco-mc';
    const nameKey = item.nameEn.toLowerCase().trim();
    const lookupKey = `${brandKey}:::${nameKey}`;

    if (existingNameMap.has(lookupKey)) {
      skippedDuplicates.push({
        nameEn: item.nameEn,
        existingId: existingNameMap.get(lookupKey)._id,
        reason: 'Already exists in database with identical brand and product name',
      });
      continue;
    }

    // Check for ambiguous entries
    const packSizes = [item.skus.map(s => s.packSize)];
    if (item.productCode === 'MAKOTO') {
      ambiguousEntries.push({
        product: item.nameEn,
        note: 'Cross-page repetition in source PDF: MAKOTO 8 GM printed on Page 1 (Herbicides) and Page 3 (Insecticides) with identical ₹100 MRP and ₹70 invoice price. Unified into 1 product.',
      });
    }
    if (item.productCode === 'MOYASHI') {
      ambiguousEntries.push({
        product: item.nameEn,
        note: 'Dual packaging in source PDF for 100 GM pack size: 50-pack carton (5 kg) and 100-pack carton (10 kg). Both preserved in variants with separate carton billing prices.',
      });
    }
    const bulkPacks = item.skus.filter(s => s.packSize.includes('('));
    if (bulkPacks.length > 0) {
      ambiguousEntries.push({
        product: item.nameEn,
        note: `Contains outer packaging annotations in pack sizes: ${bulkPacks.map(b => b.packSize).join(', ')}`,
      });
    }

    const minMrp = Math.min(...item.skus.map(s => s.mrp));
    const maxMrp = Math.max(...item.skus.map(s => s.mrp));
    const minInv = Math.min(...item.skus.map(s => s.regularInvoicePrice));
    const maxInv = Math.max(...item.skus.map(s => s.regularInvoicePrice));

    proposedInserts.push({
      productCode: item.productCode,
      nameEn: item.nameEn,
      nameMr: item.nameMr || item.nameEn,
      brand: 'IFFCO-MC',
      company: 'IFFCO-MC',
      category: item.category,
      technicalComposition: item.technicalComposition || '',
      manufacturer: item.manufacturer,
      priceListDate: metadata.dated || '05/10/2025',
      price: minMrp,
      indicativePrice: minMrp === maxMrp ? `₹${minMrp}` : `₹${minMrp} - ₹${maxMrp}`,
      regularInvoicePrice: minInv,
      stockQuantity: null, // Unknown; not assigned
      availability: 'in_stock',
      packSizes: item.packSizes,
      variantsCount: item.skus.length,
      variants: item.skus,
      mrpRange: minMrp === maxMrp ? `₹${minMrp}` : `₹${minMrp} - ₹${maxMrp}`,
      invoicePriceRange: minInv === maxInv ? `₹${minInv}` : `₹${minInv} - ₹${maxInv}`,
    });
  }

  console.log('\n====================================================');
  console.log('DRY RUN PREVIEW REPORT: IFFCO-MC CATALOGUE');
  console.log('====================================================');
  console.log(`Source Document: ${metadata.documentTitle} (Dated ${metadata.dated})`);
  console.log(`Total Candidate Products: ${products.length}`);
  console.log(`Proposed New Products to Insert: ${proposedInserts.length}`);
  console.log(`Skipped Duplicates: ${skippedDuplicates.length}`);
  console.log(`Ambiguous / Annotated Entries: ${ambiguousEntries.length}`);

  console.log('\n--- SAMPLE PROPOSED INSERTS (First 15 Products) ---');
  console.table(
    proposedInserts.slice(0, 15).map((p, idx) => ({
      '#': idx + 1,
      Name: p.nameEn,
      Category: p.category,
      Technical: p.technicalComposition ? (p.technicalComposition.length > 25 ? p.technicalComposition.slice(0, 25) + '...' : p.technicalComposition) : 'Not specified',
      'Pack Sizes': p.packSizes.join(', '),
      MRP: p.mrpRange,
      'Invoice Price': p.invoicePriceRange,
      Stock: 'Unknown (null)',
    }))
  );

  console.log('\n--- AMBIGUOUS / ANNOTATED ENTRIES IN SOURCE DATA ---');
  ambiguousEntries.forEach((a, i) => {
    console.log(`[#${i + 1}] ${a.product}: ${a.note}`);
  });

  if (isApply) {
    if (!isConnected) {
      console.error('Cannot apply changes: local MongoDB is not connected.');
      process.exit(1);
    }

    console.log('\n====================================================');
    console.log('EXECUTING LOCAL MONGODB IMPORT');
    console.log('====================================================');

    // 1. BACKUP LOCAL PRODUCTS COLLECTION BEFORE WRITING
    const backupDir = path.resolve(__dirname, '../data/backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(backupDir, `products_local_backup_${timestamp}.json`);
    const allExistingDocs = await Product.find({}).lean();
    fs.writeFileSync(backupFilePath, JSON.stringify(allExistingDocs, null, 2), 'utf8');
    console.log(`[Backup] Successfully backed up ${allExistingDocs.length} local products to:`);
    console.log(`         ${backupFilePath}`);

    // 2. INSERT PROPOSED PRODUCTS SAFELY
    let insertedCount = 0;
    for (const item of proposedInserts) {
      const canonicalSlug = item.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const docToInsert = {
        nameEn: item.nameEn,
        nameMr: item.nameMr,
        slug: canonicalSlug,
        brand: item.brand,
        category: item.category,
        imageUrl: '',
        descriptionEn: item.technicalComposition ? `${item.nameEn} (${item.technicalComposition})` : item.nameEn,
        descriptionMr: item.technicalComposition ? `${item.nameMr} (${item.technicalComposition})` : item.nameMr,
        packSizes: item.packSizes,
        variants: item.variants.map((v) => ({
          packSize: v.packSize,
          mrp: v.mrp,
          regularInvoicePrice: v.regularInvoicePrice,
          packInCarton: v.packInCarton,
          cartonWeightKg: v.cartonWeightKg,
          cartonBillingPrice: v.cartonBillingPrice,
          sourcePage: v.sourcePage || null,
          sourceCategory: v.sourceCategory || '',
        })),
        price: item.price,
        indicativePrice: item.indicativePrice,
        regularInvoicePrice: item.regularInvoicePrice,
        priceListDate: item.priceListDate,
        stockQuantity: null, // Unknown stock
        availability: 'in_stock',
        technicalComposition: item.technicalComposition,
        manufacturer: item.manufacturer,
        status: 'published',
      };

      await Product.create(docToInsert);
      insertedCount++;
    }

    console.log(`\n[Import Success] Successfully inserted ${insertedCount} IFFCO-MC products into local MongoDB.`);

    // 3. POST-IMPORT VERIFICATION
    console.log('\n====================================================');
    console.log('POST-IMPORT VERIFICATION REPORT');
    console.log('====================================================');

    const totalInDb = await Product.countDocuments();
    const iffcoProducts = await Product.find({ brand: 'IFFCO-MC' });
    const legacyProducts = await Product.find({ brand: { $ne: 'IFFCO-MC' } });

    let verifiedVariants = 0;
    let nullStockCount = 0;
    let validDateCount = 0;
    let validMrpCount = 0;
    let validInvoicePriceCount = 0;

    for (const p of iffcoProducts) {
      if (p.stockQuantity === null) nullStockCount++;
      if (p.priceListDate === '05/10/2025') validDateCount++;
      if (p.price > 0) validMrpCount++;
      if (p.regularInvoicePrice > 0) validInvoicePriceCount++;
      verifiedVariants += (p.variants || []).length;
    }

    console.log(`Total Products in Local Database: ${totalInDb}`);
    console.log(`Existing Pre-import Products Preserved: ${legacyProducts.length}`);
    console.log(`IFFCO-MC Products in Database: ${iffcoProducts.length} (Expected: 71)`);
    console.log(`Total Pack Variants in Database: ${verifiedVariants} (Expected: 242)`);
    console.log(`Products with stockQuantity === null: ${nullStockCount} (Expected: 71)`);
    console.log(`Products with priceListDate === '05/10/2025': ${validDateCount} (Expected: 71)`);
    console.log(`Products with valid MRP: ${validMrpCount} (Expected: 71)`);
    console.log(`Products with valid Regular Invoice Price: ${validInvoicePriceCount} (Expected: 71)`);

    const makotoInDb = await Product.findOne({ brand: 'IFFCO-MC', nameEn: 'IFFCO-MC MAKOTO' });
    if (makotoInDb) {
      console.log(`MAKOTO Verification: Canonical Category: "${makotoInDb.category}", Pack Sizes: [${makotoInDb.packSizes.join(', ')}], Variants: ${makotoInDb.variants.length}`);
      console.log(`MAKOTO Variants Source Traceability:`);
      makotoInDb.variants.forEach((v, idx) => {
        console.log(`  - Variant #${idx+1}: Pack: ${v.packSize}, MRP: ₹${v.mrp}, Inv: ₹${v.regularInvoicePrice}, Page: ${v.sourcePage}, Category: "${v.sourceCategory}"`);
      });
    }

    if (
      iffcoProducts.length === 71 &&
      verifiedVariants === 242 &&
      nullStockCount === 71 &&
      validDateCount === 71 &&
      legacyProducts.length === allExistingDocs.length
    ) {
      console.log('\n[ALL VERIFICATION CHECKS PASSED PERFECTLY]');
    } else {
      console.error('\n[VERIFICATION WARNING: Some counts did not match expectations]');
    }
  }

  if (isConnected) {
    await mongoose.disconnect();
    console.log('\n[Safe Local Guard] Disconnected from local MongoDB cleanly.');
  }
}

if (require.main === module) {
  previewOrImportIffcoMc().catch((err) => {
    console.error('Execution error:', err);
    process.exit(1);
  });
}

module.exports = { previewOrImportIffcoMc };
