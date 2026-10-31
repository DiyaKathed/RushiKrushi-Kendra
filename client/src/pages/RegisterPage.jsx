import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Sprout, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    village: '',
    taluka: 'Ambegaon',
    district: 'Pune',
    farmArea: '',
    soilType: '',
    irrigationMethod: '',
    preferredLanguage: currentLang,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.password.trim()) {
      setError(currentLang === 'mr' ? 'नाव, मोबाईल नंबर आणि पासवर्ड आवश्यक आहेत.' : 'Name, mobile number, and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError(currentLang === 'mr' ? 'पासवर्ड किमान ६ अक्षरांचा असावा.' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);
      if (user) {
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-black border-2 border-[#245C2A] shadow-xs mx-auto flex items-center justify-center">
            <img src="/logo.png" alt="Rushi Krushi Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-[#245C2A] font-marathi">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B]">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
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
                placeholder="उदा. बाबासाहेब शिंदे"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('auth.mobileLabel')} *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="९८XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('auth.emailLabel')} (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="farmer@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('auth.passwordLabel')} *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="किमान ६ अक्षरे"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          {/* Farm Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#D7E1D1]">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('farmer.summaryFarmArea')}
              </label>
              <input
                type="text"
                name="farmArea"
                value={formData.farmArea}
                onChange={handleChange}
                placeholder="उदा. ३ एकर / ४० गुंठे"
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('auth.preferredLanguageLabel')}
              </label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              >
                <option value="mr">मराठी (Marathi)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-bold text-sm text-white bg-[#245C2A] hover:bg-[#438A35] shadow-sm transition disabled:opacity-50 mt-4"
          >
            {loading ? t('common.loading') : t('auth.registerBtn')}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#D7E1D1]">
          <Link to="/login" className="text-xs text-[#5D685B] hover:text-[#245C2A] font-semibold">
            {t('auth.hasAccount')} →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
