import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Upload, AlertCircle } from 'lucide-react';
import { getArticle, adminCreateArticle, adminUpdateArticle, uploadImage, extractItem } from '../../services/api';

const ARTICLE_CATEGORIES = [
  'Fertilizer Management',
  'Crop Protection',
  'Soil Health',
  'Seasonal Advisory',
  'Irrigation Practices',
  'Organic Practices'
];

const AdminArticleFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    titleEn: '',
    titleMr: '',
    category: 'Fertilizer Management',
    summaryEn: '',
    summaryMr: '',
    contentEn: '',
    contentMr: '',
    imageUrl: '',
    sourceReferences: 'ICAR / MPKV Rahuri Agronomy Department',
    status: 'published',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadArticle = async () => {
        setLoading(true);
        try {
          const res = await getArticle(id);
          const a = extractItem(res, 'article');
          if (a) {
            setFormData({
              titleEn: a.titleEn || '',
              titleMr: a.titleMr || '',
              category: a.category || 'Fertilizer Management',
              summaryEn: a.summaryEn || '',
              summaryMr: a.summaryMr || '',
              contentEn: a.contentEn || '',
              contentMr: a.contentMr || '',
              imageUrl: a.imageUrl || '',
              sourceReferences: a.sourceReferences || 'ICAR / MPKV Rahuri Agronomy Department',
              status: a.status || 'published',
            });
          }
        } catch (err) {
          setError('Failed to load article details');
        } finally {
          setLoading(false);
        }
      };
      loadArticle();
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

    if (!formData.titleEn.trim() || !formData.titleMr.trim() || !formData.contentEn.trim() || !formData.contentMr.trim()) {
      setError('Title and content in both English and Marathi are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await adminUpdateArticle(id, formData);
      } else {
        await adminCreateArticle(formData);
      }
      navigate('/admin/articles');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save article');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-agro-200 border-t-agro-forest rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/admin/articles"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5D685B] hover:text-[#245C2A] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Articles</span>
      </Link>

      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#263328] font-marathi">
            {isEditMode ? 'लेख संपादन (Edit Article)' : 'नवीन कृषी लेख जोडा (Add New Article)'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B] mt-1">
            Publish educational articles and fertilizer management guidance for Maharashtra farmers.
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
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Article Title (English) *
              </label>
              <input
                type="text"
                name="titleEn"
                value={formData.titleEn}
                onChange={handleChange}
                required
                placeholder="e.g. Understanding N-P-K & Secondary Nutrients"
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
                {ARTICLE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
              लेखाचे शीर्षक (मराठी) *
            </label>
            <input
              type="text"
              name="titleMr"
              value={formData.titleMr}
              onChange={handleChange}
              required
              placeholder="उदा. नत्र-स्फुरद-पालाश आणि दुय्यम अन्नद्रव्ये"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white font-marathi"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide">
              Article Image URL / Upload
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Paste image URL or upload article banner..."
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
                <div className="w-40 aspect-16/9 rounded-lg overflow-hidden border border-[#D7E1D1] bg-white shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt="Article preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder-agro.svg';
                    }}
                  />
                </div>
                <div className="text-xs text-[#5D685B] space-y-1">
                  <p className="font-bold text-[#263328]">Article Banner Preview</p>
                  <p className="text-[11px] text-[#438A35] font-semibold">✓ 16:9 Aspect Ratio (matches Article Detail & Guide Banners)</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Short Summary (English)
              </label>
              <textarea
                name="summaryEn"
                rows="2"
                value={formData.summaryEn}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                थोडक्यात सारांश (मराठी)
              </label>
              <textarea
                name="summaryMr"
                rows="2"
                value={formData.summaryMr}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white font-marathi"
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
              Full Content (English) *
            </label>
            <textarea
              name="contentEn"
              rows="6"
              value={formData.contentEn}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white font-mono text-xs leading-relaxed"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
              संपूर्ण लेख मजकूर (मराठी) *
            </label>
            <textarea
              name="contentMr"
              rows="6"
              value={formData.contentMr}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white font-marathi text-sm leading-relaxed"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F0] border border-[#D7E1D1]">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Source Reference (संदर्भ)
              </label>
              <input
                type="text"
                name="sourceReferences"
                value={formData.sourceReferences}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
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
          </div>

          <div className="pt-4 border-t border-[#D7E1D1] flex items-center justify-end gap-3">
            <Link
              to="/admin/articles"
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
              <span>{submitting ? 'Saving...' : 'Save Article'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminArticleFormPage;
