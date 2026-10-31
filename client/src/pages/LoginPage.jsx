import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle, ShieldAlert, Sprout, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdminMode, setIsAdminMode] = useState(
    location.pathname.includes('/admin') || false
  );

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError(currentLang === 'mr' ? 'कृपया मोबाईल/ईमेल आणि पासवर्ड प्रविष्ट करा.' : 'Please enter your mobile/email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(identifier, password);
      if (loggedInUser) {
        if (loggedInUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/farmer/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-8 space-y-6">
        {/* Top Icon and Mode Toggle */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-black border-2 border-[#245C2A] shadow-xs mx-auto flex items-center justify-center">
            <img src="/logo.png" alt="Rushi Krushi Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-[#245C2A] font-marathi">
            {isAdminMode ? t('auth.adminLoginTitle') : t('auth.loginTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B]">
            {isAdminMode ? t('auth.adminLoginSubtitle') : t('auth.loginSubtitle')}
          </p>

          {/* Toggle between Farmer and Admin login */}
          <div className="pt-2 flex rounded-lg p-1 bg-[#FAF8F0] border border-[#D7E1D1] max-w-xs mx-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setIsAdminMode(false); setError(''); }}
              className={`flex-1 py-1.5 rounded-md transition ${
                !isAdminMode ? 'bg-[#245C2A] text-white shadow-xs' : 'text-[#5D685B] hover:text-[#263328]'
              }`}
            >
              {t('nav.farmerLogin')}
            </button>
            <button
              type="button"
              onClick={() => { setIsAdminMode(true); setError(''); }}
              className={`flex-1 py-1.5 rounded-md transition ${
                isAdminMode ? 'bg-[#80552F] text-white shadow-xs' : 'text-[#5D685B] hover:text-[#263328]'
              }`}
            >
              {t('nav.admin')}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
              {t('auth.identifierLabel')} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5D685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder={isAdminMode ? 'admin@rushikrushi.com' : '98XXXXXXXX / email'}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#263328] uppercase tracking-wide">
                {t('auth.passwordLabel')} *
              </label>
              {!isAdminMode && (
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#245C2A] hover:underline font-semibold"
                >
                  {t('auth.forgotPasswordLink')}
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5D685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm text-white shadow-sm transition disabled:opacity-50 ${
              isAdminMode ? 'bg-[#80552F] hover:bg-[#694220]' : 'bg-[#245C2A] hover:bg-[#438A35]'
            }`}
          >
            {loading ? t('common.loading') : t('auth.loginBtn')}
          </button>
        </form>

        {!isAdminMode && (
          <div className="text-center pt-2 border-t border-[#D7E1D1]">
            <Link to="/register" className="text-xs text-[#5D685B] hover:text-[#245C2A] font-semibold">
              {t('auth.noAccount')} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
