import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Sprout } from 'lucide-react';
import { createFarmerCrop, updateFarmerCrop, getFarmerCrop, getCrops } from '../../services/api';

const COMMON_CROPS = [
  { name: 'Sugarcane (ऊस)', key: 'sugarcane' },
  { name: 'Onion (कांदा)', key: 'onion' },
  { name: 'Soybean (सोयाबीन)', key: 'soybean' },
  { name: 'Tomato (टोमॅटो)', key: 'tomato' },
  { name: 'Pomegranate (डाळिंब)', key: 'pomegranate' },
  { name: 'Wheat (गहू)', key: 'wheat' },
  { name: 'Cotton (कापूस)', key: 'cotton' },
  { name: 'Maize (मका)', key: 'maize' },
  { name: 'Gram / Harbhara (हरभरा)', key: 'gram' },
  { name: 'Grapes (द्राक्षे)', key: 'grapes' }
];

const GROWTH_STAGES = [
  'Planning & Land Prep (लागवड नियोजन)',
  'Germination / Seedling (उगवण / रोप अवस्था)',
  'Vegetative / Tillering (शाकीय वाढ / फुटवे)',
  'Flowering Stage (फुलोरा अवस्था)',
  'Pod / Fruit Development (शेंगा / फळ पोसणे)',
  'Ripening & Harvest (पक्वता व काढणी)'
];

const AddEditCropPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cropName: '',
    variety: '',
    status: 'Growing',
    sowingDate: new Date().toISOString().split('T')[0],
    farmArea: '',
    soilType: '',
    irrigationMethod: '',
    growthStage: 'Vegetative / Tillering (शाकीय वाढ / फुटवे)',
    visibleProblems: '',
    notes: '',
    photoUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadCrop = async () => {
        setLoading(true);
        try {
          const res = await getFarmerCrop(id);
          if (res.data.success) {
            const c = res.data.crop;
            setFormData({
              cropName: c.cropName || '',
              variety: c.variety || '',
              status: c.status || 'Growing',
              sowingDate: c.sowingDate ? new Date(c.sowingDate).toISOString().split('T')[0] : '',
              farmArea: c.farmArea || '',
              soilType: c.soilType || '',
              irrigationMethod: c.irrigationMethod || '',
              growthStage: c.growthStage || 'Vegetative / Tillering (शाकीय वाढ / फुटवे)',
              visibleProblems: c.visibleProblems || '',
              notes: c.notes || '',
              photoUrl: c.photoUrl || '',
            });
          }
        } catch (err) {
          console.error('Failed to load crop for editing:', err);
          setError('Failed to load crop record.');
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

  const handleSelectPredefined = (cropName) => {
    setFormData({ ...formData, cropName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.cropName.trim()) {
      setError(currentLang === 'mr' ? 'कृपया पिकाचे नाव निवडा किंवा प्रविष्ट करा.' : 'Please provide crop name.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateFarmerCrop(id, formData);
      } else {
        await createFarmerCrop(formData);
      }
      navigate('/farmer/crops');
    } catch (err) {
      console.error('Failed to save crop:', err);
      setError(err.response?.data?.message || 'Failed to save crop record');
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/farmer/crops"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5D685B] hover:text-[#245C2A] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('common.back')} to My Crops</span>
      </Link>

      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#245C2A] font-marathi">
            {isEditMode ? 'पीक नोंद बदला (Edit Crop Record)' : t('farmer.addCropBtn')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B] mt-1">
            {currentLang === 'mr'
              ? 'शेतातील पिकाची सद्यस्थिती नोंदवून ठेवा, जेणेकरून योग्य वेळी मार्गदर्शन घेता येईल.'
              : 'Register your crop parameters for personalized advice and record-keeping.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Predefined Quick Crop Selector */}
          {!isEditMode && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide">
                {currentLang === 'mr' ? 'जलद निवड (Quick Select):' : 'Quick Crop Selection:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_CROPS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => handleSelectPredefined(c.name)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold border transition ${
                      formData.cropName === c.name
                        ? 'bg-[#245C2A] text-white border-[#245C2A] shadow-xs'
                        : 'bg-[#FAF8F0] hover:bg-[#EAF2E3] text-[#263328] border-[#D7E1D1]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.cropNameLabel')} *
              </label>
              <input
                type="text"
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                required
                placeholder="उदा. ऊस (Sugarcane) किंवा कांदा"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.varietyLabel')}
              </label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="उदा. को ८६०३२ किंवा फुले समर्थ"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.statusLabel')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              >
                <option value="Growing">{t('farmer.statusGrowing')}</option>
                <option value="Planning">{t('farmer.statusPlanning')}</option>
                <option value="Harvested">{t('farmer.statusHarvested')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.sowingDateLabel')}
              </label>
              <input
                type="date"
                name="sowingDate"
                value={formData.sowingDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.areaLabel')}
              </label>
              <input
                type="text"
                name="farmArea"
                value={formData.farmArea}
                onChange={handleChange}
                placeholder="उदा. २.५ एकर"
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.growthStageLabel')}
              </label>
              <select
                name="growthStage"
                value={formData.growthStage}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              >
                {GROWTH_STAGES.map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.irrigationLabel')}
              </label>
              <input
                type="text"
                name="irrigationMethod"
                value={formData.irrigationMethod}
                onChange={handleChange}
                placeholder="ठिबक सिंचन / पाटपाणी / तुषार"
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
              {t('farmer.visibleProblemsLabel')}
            </label>
            <input
              type="text"
              name="visibleProblems"
              value={formData.visibleProblems}
              onChange={handleChange}
              placeholder="उदा. शेंड्यावर अळी / पाने पिवळी पडणे / करपा लक्षणे"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
              {t('farmer.notesLabel')}
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="खत दिल्याची तारीख, औषध फवारणी किंवा इतर शेतातील नोंदी..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-[#D7E1D1] flex items-center justify-end gap-3">
            <Link
              to="/farmer/crops"
              className="px-5 py-2.5 rounded-lg border border-[#D7E1D1] text-[#263328] font-semibold text-sm hover:bg-[#FAF8F0] transition"
            >
              {t('common.cancel')}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#245C2A] hover:bg-[#438A35] text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#F2C94C]" />
              <span>{submitting ? t('common.loading') : (isEditMode ? t('farmer.updateCropBtn') : t('farmer.saveCropBtn'))}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCropPage;
