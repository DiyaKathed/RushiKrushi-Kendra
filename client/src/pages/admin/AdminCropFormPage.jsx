import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Upload, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { getCrop, adminCreateCrop, adminUpdateCrop, uploadImage, extractItem } from '../../services/api';

const AdminCropFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nameEn: '',
    nameMr: '',
    category: 'Field',
    seasonsString: '',
    imageUrl: '',
    introEn: '',
    introMr: '',
    climateEn: '',
    climateMr: '',
    temperatureRange: '',
    soilEn: '',
    soilMr: '',
    landPreparationEn: '',
    landPreparationMr: '',
    seedSelectionEn: '',
    seedSelectionMr: '',
    seedTreatmentEn: '',
    seedTreatmentMr: '',
    seedRate: '',
    spacing: '',
    irrigationEn: '',
    irrigationMr: '',
    weedManagementEn: '',
    weedManagementMr: '',
    harvestingEn: '',
    harvestingMr: '',
    status: 'published',
    sources: 'MPKV Rahuri & ICAR Guidelines',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadCrop = async () => {
        setLoading(true);
        try {
          const res = await getCrop(id);
          const c = extractItem(res, 'crop');
          if (c) {
            setFormData({
              nameEn: c.nameEn || '',
              nameMr: c.nameMr || '',
              category: c.category || 'Field',
              seasonsString: c.seasons ? c.seasons.join(', ') : '',
              imageUrl: c.imageUrl || '',
              introEn: c.introEn || '',
              introMr: c.introMr || '',
              climateEn: c.climateEn || '',
              climateMr: c.climateMr || '',
              temperatureRange: c.temperatureRange || '',
              soilEn: c.soilEn || '',
              soilMr: c.soilMr || '',
              landPreparationEn: c.landPreparationEn || '',
              landPreparationMr: c.landPreparationMr || '',
              seedSelectionEn: c.seedSelectionEn || '',
              seedSelectionMr: c.seedSelectionMr || '',
              seedTreatmentEn: c.seedTreatmentEn || '',
              seedTreatmentMr: c.seedTreatmentMr || '',
              seedRate: c.seedRate || '',
              spacing: c.spacing || '',
              irrigationEn: c.irrigationEn || '',
              irrigationMr: c.irrigationMr || '',
              weedManagementEn: c.weedManagementEn || '',
              weedManagementMr: c.weedManagementMr || '',
              harvestingEn: c.harvestingEn || '',
              harvestingMr: c.harvestingMr || '',
              status: c.status || 'published',
              sources: c.sources || 'MPKV Rahuri & ICAR Guidelines',
            });
          }
        } catch (err) {
          setError('Failed to load crop details');
        } finally {
          setLoading(false);
        }
      };
      loadCrop();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nameEn.trim() || !formData.nameMr.trim()) {
      setError('Crop name in English and Marathi are required.');
      return;
    }

    const payload = {
      ...formData,
      seasons: formData.seasonsString
        ? formData.seasonsString.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await adminUpdateCrop(id, payload);
      } else {
        await adminCreateCrop(payload);
      }
      navigate('/admin/crops');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save crop guide');
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
        to="/admin/crops"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5D685B] hover:text-[#245C2A] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Crop Guides</span>
      </Link>

      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#263328] font-marathi">
            {isEditMode ? 'पीक मार्गदर्शक संपादन (Edit Crop Guide)' : 'नवीन पीक मार्गदर्शक जोडा (Add New Crop Guide)'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B] mt-1">
            Maintain scientifically verified crop management guidelines for farmers.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Crop Name (English) *
              </label>
              <input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                required
                placeholder="e.g. Sugarcane"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                पिकाचे नाव (मराठी) *
              </label>
              <input
                type="text"
                name="nameMr"
                value={formData.nameMr}
                onChange={handleChange}
                required
                placeholder="उदा. ऊस"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white font-marathi"
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
                <option value="Field">Field Crop (हंगामी पिके)</option>
                <option value="Vegetable">Vegetable Crop (भाजीपाला)</option>
                <option value="Fruit">Fruit Crop (फळबागा)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Cultivation Seasons (comma-separated)
              </label>
              <input
                type="text"
                name="seasonsString"
                value={formData.seasonsString}
                onChange={handleChange}
                placeholder="e.g. Adsali, Pre-Seasonal, Suru"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Optimal Temperature Range
              </label>
              <input
                type="text"
                name="temperatureRange"
                value={formData.temperatureRange}
                onChange={handleChange}
                placeholder="e.g. 20°C to 38°C"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              />
            </div>
          </div>

          {/* Image Upload & 16:10 Aspect Ratio Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide">
              Crop Header Photo URL / Upload
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Paste image URL or upload field photography..."
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
              <div className="flex items-center gap-4 mt-2 p-3 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] w-fit">
                <div className="w-32 aspect-16/10 rounded-lg overflow-hidden border border-[#D7E1D1] bg-white shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt="Crop preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder-agro.svg';
                    }}
                  />
                </div>
                <div className="text-xs text-[#5D685B] space-y-1">
                  <p className="font-bold text-[#263328]">Crop Photography Preview</p>
                  <p className="text-[11px] text-[#438A35] font-semibold">✓ 16:10 Aspect Ratio (matches Crop Cards & Farming Guide)</p>
                </div>
              </div>
            )}
          </div>

          {/* Intro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                English Overview / Intro
              </label>
              <textarea
                name="introEn"
                rows="3"
                value={formData.introEn}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-agro-forest"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                पिकाची ओळख व महत्त्व (मराठी)
              </label>
              <textarea
                name="introMr"
                rows="3"
                value={formData.introMr}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-agro-forest font-marathi"
              ></textarea>
            </div>
          </div>

          {/* Soil & Climate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                जमीन व पूर्वमशागत (मराठी)
              </label>
              <textarea
                name="soilMr"
                rows="3"
                value={formData.soilMr}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-agro-forest font-marathi"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                योग्य हवामान (मराठी)
              </label>
              <textarea
                name="climateMr"
                rows="3"
                value={formData.climateMr}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-agro-forest font-marathi"
              ></textarea>
            </div>
          </div>

          {/* Seed rate and spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                Seed Rate (बियाणे प्रमाण)
              </label>
              <input
                type="text"
                name="seedRate"
                value={formData.seedRate}
                onChange={handleChange}
                placeholder="e.g. 10,000 sets per acre / 4 kg seed per acre"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-agro-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                Spacing (लागवड अंतर)
              </label>
              <input
                type="text"
                name="spacing"
                value={formData.spacing}
                onChange={handleChange}
                placeholder="e.g. 4 ft to 5 ft row-to-row"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-agro-forest"
              />
            </div>
          </div>

          {/* Seed treatment & Irrigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                बीजप्रक्रिया (Seed Treatment) - मराठी
              </label>
              <textarea
                name="seedTreatmentMr"
                rows="3"
                value={formData.seedTreatmentMr}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-agro-forest font-marathi"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                पाणी व सिंचन व्यवस्थापन - मराठी
              </label>
              <textarea
                name="irrigationMr"
                rows="3"
                value={formData.irrigationMr}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-agro-forest font-marathi"
              ></textarea>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F0] border border-[#D7E1D1]">
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

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Source Reference (संदर्भ)
              </label>
              <input
                type="text"
                name="sources"
                value={formData.sources}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#D7E1D1] flex items-center justify-end gap-3">
            <Link
              to="/admin/crops"
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
              <span>{submitting ? 'Saving...' : 'Save Crop Guide'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCropFormPage;
