import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Save,
  Upload,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Building2
} from 'lucide-react';
import {
  getProduct,
  adminCreateProduct,
  adminUpdateProduct,
  uploadImage,
  extractItem
} from '../../services/api';

const CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Micronutrients',
  'Biofertilizers',
  'Insecticides',
  'Fungicides',
  'Herbicides',
  'Plant Growth Promoters',
  'Organic Inputs',
  'Farming Tools',
  'Spray Pumps',
  'Irrigation Accessories',
  'Other'
];

const PRESET_COMPANIES = [
  'Zytonic',
  'IFFCO-MC',
  'Indofil',
  'Bayer Crop Science',
  'Syngenta',
  'BASF',
];

const AdminProductFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nameEn: '',
    nameMr: '',
    brand: '',
    category: 'Seeds',
    imageUrl: '',
    descriptionEn: '',
    descriptionMr: '',
    packSizesString: '',
    technicalComposition: '',
    applicableCropsString: '',
    intendedUse: '',
    dosage: '',
    safetyPrecautionsEn: '',
    safetyPrecautionsMr: '',
    manufacturer: '',
    price: '',
    regularInvoicePrice: '',
    indicativePrice: '',
    priceListDate: '',
    variants: [],
    stockQuantity: '',
    availability: 'in_stock',
    isFeatured: false,
    status: 'published',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadProduct = async () => {
        setLoading(true);
        try {
          const res = await getProduct(id);
          const p = extractItem(res, 'product');
          if (p) {
            setFormData({
              nameEn: p.nameEn || '',
              nameMr: p.nameMr || '',
              brand: p.brand || p.company || '',
              category: p.category || 'Seeds',
              imageUrl: p.imageUrl || (p.images && p.images[0]) || '',
              descriptionEn: p.descriptionEn || '',
              descriptionMr: p.descriptionMr || '',
              packSizesString: Array.isArray(p.packSizes)
                ? p.packSizes.join(', ')
                : (typeof p.packSizes === 'string' ? p.packSizes : (p.packSize || '')),
              technicalComposition: p.technicalComposition || '',
              applicableCropsString: Array.isArray(p.applicableCrops) ? p.applicableCrops.join(', ') : '',
              intendedUse: p.intendedUse || '',
              dosage: p.dosage || '',
              safetyPrecautionsEn: p.safetyPrecautionsEn || '',
              safetyPrecautionsMr: p.safetyPrecautionsMr || '',
              manufacturer: p.manufacturer || '',
              price: (p.price !== undefined && p.price !== null) ? String(p.price) : '',
              regularInvoicePrice: (p.regularInvoicePrice !== undefined && p.regularInvoicePrice !== null) ? String(p.regularInvoicePrice) : '',
              indicativePrice: p.indicativePrice || '',
              priceListDate: p.priceListDate || '',
              variants: Array.isArray(p.variants) ? p.variants : [],
              stockQuantity: (p.stockQuantity !== undefined && p.stockQuantity !== null) ? String(p.stockQuantity) : '',
              availability: p.availability || 'in_stock',
              isFeatured: !!p.isFeatured,
              status: p.status || 'published',
            });
          }
        } catch (err) {
          setError('Failed to load product details');
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await uploadImage(data);
      if (res.data.success) {
        setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try another file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nameEn.trim()) {
      setError('Please provide at least the English product name.');
      return;
    }

    if (!formData.brand.trim()) {
      setError('Please provide the Company or Brand name.');
      return;
    }

    const effectiveNameMr = formData.nameMr.trim() || formData.nameEn.trim();

    const payload = {
      ...formData,
      brand: formData.brand.trim(),
      company: formData.brand.trim(),
      nameEn: formData.nameEn.trim(),
      nameMr: effectiveNameMr,
      packSizes: formData.packSizesString
        ? formData.packSizesString.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      applicableCrops: formData.applicableCropsString
        ? formData.applicableCropsString.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      indicativePrice: formData.indicativePrice.trim(),
    };

    // Numeric price validation & processing
    if (formData.price !== '' && formData.price !== null && formData.price !== undefined) {
      const numPrice = Number(formData.price);
      if (isNaN(numPrice) || numPrice < 0) {
        setError('Price must be a valid non-negative number');
        return;
      }
      payload.price = numPrice;
      // If indicativePrice was omitted, auto-generate clean display string
      if (!payload.indicativePrice) {
        payload.indicativePrice = `₹${numPrice.toLocaleString('en-IN')}`;
      }
    } else {
      payload.price = null;
    }

    if (formData.priceListDate && formData.priceListDate.trim() !== '') {
      payload.priceListDate = formData.priceListDate.trim();
    }
    if (formData.regularInvoicePrice !== '' && formData.regularInvoicePrice !== null && !isNaN(Number(formData.regularInvoicePrice))) {
      payload.regularInvoicePrice = Math.max(0, Number(formData.regularInvoicePrice));
    }
    if (Array.isArray(formData.variants) && formData.variants.length > 0) {
      payload.variants = formData.variants;
    }

    // Numeric stockQuantity validation & processing
    if (formData.stockQuantity !== '' && formData.stockQuantity !== null && formData.stockQuantity !== undefined) {
      const numStock = Number(formData.stockQuantity);
      if (isNaN(numStock) || numStock < 0) {
        setError('Stock quantity must be a non-negative number');
        return;
      }
      payload.stockQuantity = numStock;
      // Auto-sync out of stock if quantity is explicitly 0
      if (numStock === 0 && payload.availability === 'in_stock') {
        payload.availability = 'out_of_stock';
      }
    } else if (!isEditMode) {
      payload.stockQuantity = 0;
    } else {
      // In edit mode when stockQuantity is left empty, delete it from payload
      // so legacy products without known stock quantity are preserved without being set to 0
      delete payload.stockQuantity;
    }

    // Remove client-only string helper fields
    delete payload.packSizesString;
    delete payload.applicableCropsString;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await adminUpdateProduct(id, payload);
      } else {
        await adminCreateProduct(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D7E1D1] border-t-[#245C2A] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5D685B] hover:text-[#245C2A] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Product List</span>
      </Link>

      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#263328] font-marathi">
            {isEditMode ? 'उत्पादन संपादन (Edit Product)' : 'नवीन उत्पादन जोडा (Add New Product)'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B] mt-1">
            Fill in accurate product details, company, pack sizes, inventory, and pricing.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                required
                placeholder="e.g. Coragen Insecticide 18.5% SC"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                उत्पादनाचे नाव (मराठी)
              </label>
              <input
                type="text"
                name="nameMr"
                value={formData.nameMr}
                onChange={handleChange}
                placeholder="उदा. कोराजन कीटकनाशक १८.५% एससी (रिकामे ठेवल्यास इंग्रजी नाव वापरले जाईल)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white font-marathi"
              />
              <p className="text-[11px] text-[#5D685B] mt-0.5">Optional: Falls back to English name if left empty</p>
            </div>
          </div>

          {/* Company / Brand & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#245C2A]" />
                <span>Company / Brand *</span>
              </label>
              <input
                type="text"
                name="brand"
                list="company-presets"
                value={formData.brand}
                onChange={handleChange}
                required
                placeholder="e.g. Zytonic / IFFCO-MC / Indofil / Bayer Crop Science"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
              <datalist id="company-presets">
                {PRESET_COMPANIES.map(comp => (
                  <option key={comp} value={comp} />
                ))}
              </datalist>

              {/* Quick Select Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-[#5D685B] font-bold">Quick Select:</span>
                {PRESET_COMPANIES.map(comp => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, brand: comp }))}
                    className={`text-[11px] px-2 py-0.5 rounded transition border ${
                      formData.brand === comp
                        ? 'bg-[#245C2A] text-white border-[#1C4920] font-bold'
                        : 'bg-[#FAF8F0] hover:bg-[#EAF2E3] text-[#245C2A] border-[#D7E1D1]'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing: Numeric Price & Indicative Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F0] border border-[#D7E1D1]">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Selling Price (किंमत ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5D685B]">₹</span>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="any"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 450"
                  className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
                />
              </div>
              <p className="text-[11px] text-[#5D685B] mt-1">Exact unit/pack selling price in Rupees (min: 0)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Indicative Price Text (अंदाजे किंमत मजकूर)
              </label>
              <input
                type="text"
                name="indicativePrice"
                value={formData.indicativePrice}
                onChange={handleChange}
                placeholder="e.g. ₹420 - ₹1,550 approx."
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
              <p className="text-[11px] text-[#5D685B] mt-1">For price ranges or subsidy notes (auto-generated if empty)</p>
            </div>
          </div>

          {/* Pack sizes and technical composition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Available Pack Sizes (उपलब्ध पॅक आकार)
              </label>
              <input
                type="text"
                name="packSizesString"
                value={formData.packSizesString}
                onChange={handleChange}
                placeholder="e.g. 100 gm, 250 gm, 500 gm, 1 kg, 5 kg"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
              <p className="text-[11px] text-[#5D685B] mt-0.5">Comma-separated pack sizes (उदा. 100 gm, 500 gm, 1 kg)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Technical Active Ingredient (तांत्रिक घटक)
              </label>
              <input
                type="text"
                name="technicalComposition"
                value={formData.technicalComposition}
                onChange={handleChange}
                placeholder="e.g. Chlorantraniliprole 18.5% SC"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
            </div>
          </div>

          {/* Image Upload / URL with Object-Contain Packaging Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide">
              Product Packaging Photo (उत्पादन फोटो)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Paste image URL or upload bottle/pack file..."
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#EAF2E3] hover:bg-[#D7E1D1] border border-[#D7E1D1] text-xs font-bold text-[#245C2A] transition">
                <Upload className="w-4 h-4" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {formData.imageUrl && (
              <div className="flex items-center gap-4 mt-3 p-3 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] w-fit">
                <div className="w-24 h-24 rounded-lg bg-white border border-[#D7E1D1] p-1.5 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Packaging Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder-agro.svg';
                    }}
                  />
                </div>
                <div className="text-xs text-[#5D685B] space-y-1">
                  <p className="font-bold text-[#263328]">Packaging Container Preview</p>
                  <p className="text-[11px] text-[#438A35] font-semibold">✓ Contained aspect ratio: Full label and bottle visible</p>
                  <p className="text-[11px]">Recommended: Clean background, high clarity.</p>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Crops */}
          <div>
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
              Recommended Crops (शिफारस केलेली पिके - comma-separated)
            </label>
            <input
              type="text"
              name="applicableCropsString"
              value={formData.applicableCropsString}
              onChange={handleChange}
              placeholder="Sugarcane, Soybean, Tomato, Onion, Cotton"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                English Description
              </label>
              <textarea
                name="descriptionEn"
                rows="3"
                value={formData.descriptionEn}
                onChange={handleChange}
                placeholder="Description of benefits and usage..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                मराठी वर्णन
              </label>
              <textarea
                name="descriptionMr"
                rows="3"
                value={formData.descriptionMr}
                onChange={handleChange}
                placeholder="उत्पादनाचे फायदे व माहिती..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white font-marathi"
              ></textarea>
            </div>
          </div>

          {/* Dosage & Safety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Dosage Guidance (प्रमाण व वापर)
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g. 0.4 ml per liter water (60 ml per acre)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Safety Precautions (काळजी व सूचना)
              </label>
              <input
                type="text"
                name="safetyPrecautionsMr"
                value={formData.safetyPrecautionsMr}
                onChange={handleChange}
                placeholder="उदा. फवारणी करताना मास्क वापरा, PHI १४ दिवस"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white font-marathi"
              />
            </div>
          </div>

          {/* Inventory, Availability, Status, Featured */}
          <div className="p-4 rounded-xl bg-[#FAF8F0] border border-[#D7E1D1] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                  Stock Quantity (शिल्लक साठा)
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  min="0"
                  step="1"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
                />
                <p className="text-[10px] text-[#5D685B] mt-0.5">Physical store stock count (min: 0)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                  Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
                >
                  <option value="in_stock">Available at Store (उपलब्ध)</option>
                  <option value="out_of_stock">Out of Stock (संपले)</option>
                  <option value="seasonal">Seasonal (हंगामी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                  Publish Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
                >
                  <option value="published">Published (Active)</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived (Inactive)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D7E1D1]/60 flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#263328]">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#245C2A] focus:ring-[#245C2A] accent-[#245C2A]"
                />
                <span>Feature on Homepage (मुख्यपृष्ठावर दर्शवा)</span>
              </label>

              {formData.stockQuantity !== '' && Number(formData.stockQuantity) === 0 && (
                <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Note: Zero stock will be marked as Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#D7E1D1] flex items-center justify-end gap-3">
            <Link
              to="/admin/products"
              className="px-5 py-2.5 rounded-xl border border-[#D7E1D1] text-[#5D685B] font-semibold text-sm hover:bg-[#FAF8F0] transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#245C2A] hover:bg-[#1C4920] text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#F2C94C]" />
              <span>{submitting ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductFormPage;
