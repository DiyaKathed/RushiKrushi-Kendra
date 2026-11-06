const test = require('node:test');
const assert = require('node:assert');
const { connectDB, disconnectDB } = require('../src/config/db');
const Product = require('../src/models/Product');

test('Product Model & Route Enhancements (Step 1 Verification)', async (t) => {
  await connectDB();

  await t.test('1. stockQuantity defaults to 0 and price field is supported', async () => {
    const p = new Product({
      nameEn: 'Test Zytonic Soil Enhancer',
      nameMr: 'झायटोनिक सॉईल एनहान्सर',
      brand: 'ZYTONIC',
      category: 'Organic Inputs',
      indicativePrice: '₹850',
      price: 850,
      stockQuantity: 25,
    });
    await p.validate();
    assert.strictEqual(p.stockQuantity, 25);
    assert.strictEqual(p.price, 850);
    assert.strictEqual(p.indicativePrice, '₹850');
  });

  await t.test('2. stockQuantity rejects negative numbers', async () => {
    const p = new Product({
      nameEn: 'Invalid Stock Product',
      brand: 'ZYTONIC',
      category: 'Organic Inputs',
      stockQuantity: -5,
    });
    let err;
    try {
      await p.validate();
    } catch (e) {
      err = e;
    }
    assert.ok(err, 'Should fail validation on negative stock');
    assert.ok(err.errors['stockQuantity'], 'stockQuantity validation error expected');
  });

  await t.test('3. nameMr safely falls back to nameEn when omitted', async () => {
    const p = new Product({
      nameEn: 'Bayer Crop Science Confidor',
      brand: 'Bayer Crop Science',
      category: 'Insecticides',
    });
    await p.validate();
    assert.strictEqual(p.nameMr, 'Bayer Crop Science Confidor', 'nameMr should match nameEn fallback');
  });

  await t.test('4. company acts as virtual alias for brand', async () => {
    const p = new Product({
      nameEn: 'Indofil M-45 Fungicide',
      company: 'Indofil',
      category: 'Fungicides',
    });
    await p.validate();
    assert.strictEqual(p.brand, 'Indofil', 'brand should be populated from company');
    assert.strictEqual(p.company, 'Indofil', 'company virtual should return brand');
  });

  await t.test('5. availability auto-syncs with stockQuantity without breaking existing products', async () => {
    // Simulated existing product with availability in_stock and default stockQuantity 0
    const existingSim = await Product.create({
      nameEn: 'Existing Store Fertilizer Sample',
      brand: 'IFFCO-MC',
      category: 'Fertilizers',
      availability: 'in_stock',
    });
    assert.strictEqual(existingSim.availability, 'in_stock', 'Existing product should remain in_stock');

    // Updating existing product without touching stockQuantity should NOT flip availability to out_of_stock
    existingSim.descriptionEn = 'Updated description';
    await existingSim.save();
    assert.strictEqual(existingSim.availability, 'in_stock', 'Untouched stockQuantity must not flip availability');

    // Explicitly setting stockQuantity to 0 should set out_of_stock
    existingSim.stockQuantity = 0;
    existingSim.markModified('stockQuantity');
    await existingSim.save();
    assert.strictEqual(existingSim.availability, 'out_of_stock', 'Explicitly setting stockQuantity to 0 sets out_of_stock');

    // Setting stockQuantity > 0 should restore in_stock
    existingSim.stockQuantity = 15;
    await existingSim.save();
    assert.strictEqual(existingSim.availability, 'in_stock', 'Setting stockQuantity > 0 sets in_stock');

    // Clean up test document
    await Product.findByIdAndDelete(existingSim._id);
  });

  await disconnectDB();
});
