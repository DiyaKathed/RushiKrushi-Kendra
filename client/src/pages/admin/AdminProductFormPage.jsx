import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Save,
  Upload,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import {
  getProduct,
  adminCreateProduct,
  adminUpdateProduct,
  uploadImage
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
    indicativePrice: '',
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
          if (res.data.success) {
            const p = res.data.product;
            setFormData({
              nameEn: p.nameEn || '',
              nameMr: p.nameMr || '',
              brand: p.brand || '',
              category: p.category || 'Seeds',
              imageUrl: p.imageUrl || '',
              descriptionEn: p.descriptionEn || '',
              descriptionMr: p.descriptionMr || '',
              packSizesString: p.packSizes ? p.packSizes.join(', ') : '',
              technicalComposition: p.technicalComposition || '',
              applicableCropsString: p.applicableCrops ? p.applicableCrops.join(', ') : '',
              intendedUse: p.intendedUse || '',
              dosage: p.dosage || '',
              safetyPrecautionsEn: p.safetyPrecautionsEn || '',
              safetyPrecautionsMr: p.safetyPrecautionsMr || '',
              manufacturer: p.manufacturer || '',
              indicativePrice: p.indicativePrice || '',
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

    if (!formData.nameEn.trim() || !formData.nameMr.trim() || !formData.brand.trim()) {
      setError('Please provide English and Marathi product names, and brand name.');
      return;
    }

    const payload = {
      ...formData,
      packSizes: formData.packSizesString
        ? formData.packSizesString.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      applicableCrops: formData.applicableCropsString
        ? formData.applicableCropsString.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };

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
            Fill in accurate product details and physical store availability status.
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
                उत्पादनाचे नाव (मराठी) *
              </label>
              <input
                type="text"
                name="nameMr"
                value={formData.nameMr}
                onChange={handleChange}
                required
                placeholder="उदा. कोराजन कीटकनाशक १८.५% एससी"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white font-marathi"
              />
            </div>
          </div>

          {/* Brand & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Brand / Manufacturer *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                placeholder="e.g. FMC India / Syngenta / IFFCO"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
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

          {/* Pack sizes and technical composition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Available Pack Sizes (comma-separated)
              </label>
              <input
                type="text"
                name="packSizesString"
                value={formData.packSizesString}
                onChange={handleChange}
                placeholder="e.g. 100 ml, 250 ml, 500 ml"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
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

          {/* Applicable Crops & Indicative Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Recommended Crops (comma-separated)
              </label>
              <input
                type="text"
                name="applicableCropsString"
                value={formData.applicableCropsString}
                onChange={handleChange}
                placeholder="Sugarcane, Soybean, Tomato, Onion"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Indicative Price (अंदाजे किंमत)
              </label>
              <input
                type="text"
                name="indicativePrice"
                value={formData.indicativePrice}
                onChange={handleChange}
                placeholder="e.g. ₹420 - ₹1,550 approx."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
            </div>
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

          {/* Availability, Status, Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF8F0] border border-[#D7E1D1]">
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#263328]">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#245C2A] focus:ring-[#245C2A] accent-[#245C2A]"
                />
                <span>Feature on Homepage</span>
              </label>
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
