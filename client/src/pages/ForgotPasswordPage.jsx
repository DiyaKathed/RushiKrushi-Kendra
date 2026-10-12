import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = enter identifier, 2 = enter code & new password
  const [identifier, setIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!identifier.trim()) {
      setError('Please provide your registered mobile number or email');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { identifier: identifier.trim() });
      if (res.data.success) {
        setMessage(res.data.message);
        if (res.data.devCode) {
          setResetCode(res.data.devCode);
        }
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!resetCode.trim() || !newPassword.trim()) {
      setError('Please provide verification code and new password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        identifier: identifier.trim(),
        resetCode: resetCode.trim(),
        newPassword: newPassword.trim(),
      });
      if (res.data.success) {
        setMessage('Password successfully changed! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6 text-[#245C2A]" />
          </div>
          <h1 className="text-2xl font-black text-[#245C2A] font-marathi">
            {t('auth.forgotPasswordTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B]">
            {t('auth.forgotPasswordSubtitle')}
          </p>
        </div>

        {message && (
          <div className="p-3.5 rounded-lg bg-[#EAF2E3] border border-[#B8D5B0] text-[#245C2A] text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#438A35] shrink-0 mt-0.5" />
            <p className="font-semibold">{message}</p>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                {t('auth.identifierLabel')} *
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="10-digit mobile or email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-bold text-sm text-white bg-[#245C2A] hover:bg-[#438A35] shadow-sm transition disabled:opacity-50"
            >
              {loading ? t('common.loading') : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                Reset Verification Code (६ अंकी कोड) *
              </label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
                placeholder="Enter 6-digit code"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                New Password (नवीन पासवर्ड) *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/30 focus:bg-white text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-bold text-sm text-white bg-[#245C2A] hover:bg-[#438A35] shadow-sm transition disabled:opacity-50"
            >
              {loading ? t('common.loading') : 'Set New Password'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-[#D7E1D1]">
          <Link to="/login" className="text-xs text-[#5D685B] hover:text-[#245C2A] font-semibold inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
