import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, User, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

/**
 * AdminLoginPage:
 * Dedicated, secure login portal strictly for Rushi Krushi Seva Kendra Administrators.
 * Completely separate from the public farmer login.
 */
const AdminLoginPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { login, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated as administrator, navigate directly to admin dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const destination = location.state?.from?.pathname || '/admin/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError(
        currentLang === 'mr'
          ? 'कृपया प्रशासक ईमेल/मोबाईल आणि पासवर्ड प्रविष्ट करा.'
          : 'Please enter administrator username/email and password.'
      );
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(identifier, password);
      if (loggedInUser) {
        if (loggedInUser.role === 'admin') {
          const destination = location.state?.from?.pathname || '/admin/dashboard';
          navigate(destination, { replace: true });
        } else {
          // If a non-admin account authenticates here, deny admin portal access immediately
          logout();
          setError(
            currentLang === 'mr'
              ? 'प्रवेश नाकारला: हे पोर्टल केवळ व्यवस्थापक व प्रशासकांसाठी राखीव आहे. शेतकरी बंधूंनी मुख्य शेतकरी लॉगिन वापरावे.'
              : 'Access Denied: This portal is strictly restricted to store administrators. Farmers should use the farmer login.'
          );
        }
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(
        err.response?.data?.message ||
        (currentLang === 'mr'
          ? 'प्रशासक क्रेडेंशियल्स अवैध आहेत. कृपया पुन्हा प्रयत्न करा.'
          : 'Invalid administrator credentials. Please check your username and password.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#143618] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with back link */}
      <div className="max-w-md w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#EAF2E3] hover:text-[#F2C94C] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentLang === 'mr' ? '← मुख्य शेतकरी वेबसाईटवर परत जा' : '← Return to Public Store Website'}</span>
        </Link>
      </div>

      {/* Main Admin Login Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-[#245C2A] shadow-2xl p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-black border-2 border-[#F2C94C] shadow-md mx-auto flex items-center justify-center">
            <img src="/logo.png" alt="Rushi Krushi Logo" className="w-full h-full object-cover" />
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143618] text-[#F2C94C] text-[11px] font-bold tracking-wider uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{currentLang === 'mr' ? 'प्रशासकीय नियंत्रण कक्ष' : 'Proprietor Control Panel'}</span>
            </span>
          </div>

          <h1 className="text-2xl font-black text-[#263328] font-marathi">
            {currentLang === 'mr' ? 'प्रशासक लॉगिन' : 'Admin Portal Login'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {currentLang === 'mr'
              ? 'ऋषी कृषी सेवा केंद्र व्यवस्थापनासाठी अधिकृत लॉगिन'
              : 'Sign in to access store inventory, appointments, and enquiries'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1.5">
              {currentLang === 'mr' ? 'प्रशासक ईमेल किंवा मोबाईल' : 'Admin Email or Mobile'} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                placeholder="rushikrushi99@gmail.com / 98XXXXXXXX"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                {currentLang === 'mr' ? 'पासवर्ड' : 'Password'} *
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#245C2A] hover:underline font-semibold"
              >
                {currentLang === 'mr' ? 'पासवर्ड विसरलात?' : 'Forgot Password?'}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg font-bold text-sm text-white bg-[#245C2A] hover:bg-[#1C4920] shadow-sm transition disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{currentLang === 'mr' ? 'पडताळणी चालू आहे...' : 'Authenticating...'}</span>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-[#F2C94C]" />
                <span>{currentLang === 'mr' ? 'प्रशासक म्हणून लॉगिन करा' : 'Sign In to Admin Dashboard'}</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-3 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            {currentLang === 'mr'
              ? 'हे पृष्ठ केवळ अधिकृत दुकानाचे मालक व प्रशासकांसाठी आहे.'
              : 'Authorized personnel only. All access attempts are authenticated.'}
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-stone-400">
        <p>© {new Date().getFullYear()} Rushi Krushi Seva Kendra • Ambegaon, Pune</p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
