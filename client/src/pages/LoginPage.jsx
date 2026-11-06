import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle, Sprout, ArrowRight } from 'lucide-react';

/**
 * LoginPage:
 * Public Farmer & Visitor Login page.
 * Purely dedicated to farmers (account dashboard, crop advisories, etc.).
 * All admin login functionality is isolated to /admin/login.
 */
const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError(
        currentLang === 'mr'
          ? 'कृपया मोबाईल/ईमेल आणि पासवर्ड प्रविष्ट करा.'
          : 'Please enter your mobile/email and password.'
      );
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(identifier, password);
      if (loggedInUser) {
        if (loggedInUser.role === 'admin') {
          // If an admin signs in via farmer login, seamlessly direct to admin dashboard
          navigate('/admin/dashboard', { replace: true });
        } else {
          const destination = location.state?.from?.pathname || '/farmer/dashboard';
          navigate(destination, { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        (currentLang === 'mr'
          ? 'अवैध क्रेडेंशियल्स. कृपया पुन्हा प्रयत्न करा.'
          : 'Invalid credentials. Please check your mobile/email and password.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-8 space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-black border-2 border-[#245C2A] shadow-xs mx-auto flex items-center justify-center">
            <img src="/logo.png" alt="Rushi Krushi Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-[#245C2A] font-marathi">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B]">
            {t('auth.loginSubtitle')}
          </p>
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
                placeholder="98XXXXXXXX / email"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#263328] uppercase tracking-wide">
                {t('auth.passwordLabel')} *
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#245C2A] hover:underline font-semibold"
              >
                {t('auth.forgotPasswordLink')}
              </Link>
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
            className="w-full py-2.5 px-4 rounded-lg font-bold text-sm text-white shadow-sm transition disabled:opacity-50 bg-[#245C2A] hover:bg-[#438A35]"
          >
            {loading ? t('common.loading') : t('auth.loginBtn')}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#D7E1D1]">
          <Link to="/register" className="text-xs text-[#5D685B] hover:text-[#245C2A] font-semibold">
            {t('auth.noAccount')} →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
