import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { User, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const FarmerProfilePage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    preferredLanguage: user?.preferredLanguage || currentLang,
    village: user?.village || '',
    taluka: user?.taluka || 'Ambegaon',
    district: user?.district || 'Pune',
    farmArea: user?.farmArea || '',
    soilType: user?.soilType || '',
    irrigationMethod: user?.irrigationMethod || '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    setSaving(true);
    try {
      await updateProfile(formData);
      if (formData.preferredLanguage && formData.preferredLanguage !== i18n.language) {
        i18n.changeLanguage(formData.preferredLanguage);
      }
      setSuccess(true);
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#245C2A] font-marathi">
          {t('farmer.profileTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#5D685B]">
          {t('farmer.profileSubtitle')}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-8 space-y-6">
        {success && (
          <div className="p-3.5 rounded-lg bg-[#EAF2E3] border border-[#B8D5B0] text-[#245C2A] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#438A35] shrink-0" />
            <p className="font-semibold">{t('farmer.profileUpdatedSuccess')}</p>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('auth.fullNameLabel')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.preferredLangLabel')}
              </label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              >
                <option value="mr">मराठी (Marathi)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.villageLabel')}
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="उदा. पारगाव / शिंगवे"
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.talukaLabel')}
              </label>
              <input
                type="text"
                name="taluka"
                value={formData.taluka}
                onChange={handleChange}
                placeholder="Ambegaon"
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.districtLabel')}
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Pune"
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.summaryFarmArea')}
              </label>
              <input
                type="text"
                name="farmArea"
                value={formData.farmArea}
                onChange={handleChange}
                placeholder="उदा. ५ एकर"
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.soilTypeLabel')}
              </label>
              <input
                type="text"
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                placeholder="मध्यम काळी / चुनखडी"
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
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
                placeholder="ठिबक / पाटपाणी / तुषार"
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#D7E1D1]">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#245C2A] hover:bg-[#438A35] text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#F2C94C]" />
              <span>{saving ? t('common.loading') : t('farmer.updateProfileBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerProfilePage;
