import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  ShoppingBag,
  CalendarDays,
  MessageSquare,
  Sprout,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  X,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';

/**
 * AdminLayout:
 * Dedicated, isolated layout for Store Proprietor & Administrators.
 * Completely separate from the public farmer interface.
 */
const AdminLayout = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLang = i18n.language || 'en';

  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('rushikrushi_lang', lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
      isActive
        ? 'bg-[#1C4920] text-[#F2C94C] shadow-xs'
        : 'text-[#EAF2E3] hover:text-white hover:bg-white/10'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
      isActive
        ? 'bg-[#1C4920] text-[#F2C94C]'
        : 'text-stone-700 hover:bg-stone-100'
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8F5] text-stone-900">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#245C2A] text-white border-b-2 border-[#1C4920] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Store & Admin Panel Brand */}
            <div className="flex items-center gap-3">
              <Link to="/admin/dashboard" className="flex items-center gap-3 group focus:outline-hidden">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-black border-2 border-[#F2C94C] shadow-xs shrink-0 flex items-center justify-center">
                  <img src="/logo.png" alt="Rushi Krushi Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black tracking-tight text-white font-marathi">
                      {currentLang === 'mr' ? 'ऋषी कृषी सेवा केंद्र' : 'Rushi Krushi Seva Kendra'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#F2C94C] uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded">
                      <ShieldAlert className="w-3 h-3 text-[#F2C94C]" />
                      <span>{currentLang === 'mr' ? 'प्रशासक कक्ष (Admin Portal)' : 'Proprietor Admin Portal'}</span>
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>{currentLang === 'mr' ? 'डॅशबोर्ड' : 'Dashboard'}</span>
              </NavLink>
              <NavLink to="/admin/products" className={navLinkClass}>
                <ShoppingBag className="w-4 h-4" />
                <span>{currentLang === 'mr' ? 'उत्पादने' : 'Products'}</span>
              </NavLink>
              <NavLink to="/admin/appointments" className={navLinkClass}>
                <CalendarDays className="w-4 h-4" />
                <span>{currentLang === 'mr' ? 'अपॉइंटमेंट्स' : 'Appointments'}</span>
              </NavLink>
              <NavLink to="/admin/enquiries" className={navLinkClass}>
                <MessageSquare className="w-4 h-4" />
                <span>{currentLang === 'mr' ? 'चौकशी' : 'Enquiries'}</span>
              </NavLink>
              <NavLink to="/admin/crops" className={navLinkClass}>
                <Sprout className="w-4 h-4" />
                <span>{currentLang === 'mr' ? 'पीक मार्गदर्शक' : 'Crops'}</span>
              </NavLink>
              <NavLink to="/admin/articles" className={navLinkClass}>
                <FileText className="w-4 h-4" />
                <span>{currentLang === 'mr' ? 'माहिती लेख' : 'Articles'}</span>
              </NavLink>
            </nav>

            {/* Right Tools: View Public Site, Language, Admin Profile & Logout */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Link to Public Store */}
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Open Public Farmer Website in new tab"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#EAF2E3] border border-white/20 transition"
              >
                <span>{currentLang === 'mr' ? 'शेतकरी वेबसाईट' : 'View Public Site'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Language Switcher */}
              <div className="inline-flex rounded-md p-0.5 bg-[#143618] border border-[#1C4920] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => switchLanguage('en')}
                  className={`px-2 py-0.5 rounded transition ${
                    currentLang === 'en'
                      ? 'bg-[#F2C94C] text-[#263328] font-bold shadow-xs'
                      : 'text-[#EAF2E3] hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => switchLanguage('mr')}
                  className={`px-2 py-0.5 rounded transition font-marathi ${
                    currentLang === 'mr'
                      ? 'bg-[#F2C94C] text-[#263328] font-bold shadow-xs'
                      : 'text-[#EAF2E3] hover:text-white'
                  }`}
                >
                  मराठी
                </button>
              </div>

              {/* Admin Profile Chip */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                <div className="text-right">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                    {user?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-[#F2C94C] font-semibold">
                    {user?.phone || 'Store Admin'}
                  </p>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out of Admin Control Panel"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{currentLang === 'mr' ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-xs text-[#EAF2E3] bg-white/10 rounded-md border border-white/20"
                title="View Public Site"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-hidden"
                aria-label="Toggle Admin Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white text-stone-900 border-t border-[#1C4920] px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
            <div className="p-3 bg-[#FAF8F0] rounded-lg border border-[#D7E1D1] mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-500 font-semibold uppercase">{currentLang === 'mr' ? 'लॉगिन प्रशासक' : 'Signed In As'}</p>
                <p className="text-sm font-bold text-[#245C2A]">{user?.name || 'Administrator'}</p>
              </div>
              <div className="inline-flex rounded-md p-0.5 bg-[#FAF8F0] border border-[#D7E1D1] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => switchLanguage('en')}
                  className={`px-2 py-0.5 rounded transition ${currentLang === 'en' ? 'bg-[#245C2A] text-white font-bold' : 'text-stone-600'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => switchLanguage('mr')}
                  className={`px-2 py-0.5 rounded transition font-marathi ${currentLang === 'mr' ? 'bg-[#245C2A] text-white font-bold' : 'text-stone-600'}`}
                >
                  मराठी
                </button>
              </div>
            </div>

            <NavLink
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <LayoutDashboard className="w-4 h-4 text-[#245C2A]" />
              <span>{currentLang === 'mr' ? 'डॅशबोर्ड' : 'Dashboard'}</span>
            </NavLink>
            <NavLink
              to="/admin/products"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <ShoppingBag className="w-4 h-4 text-[#245C2A]" />
              <span>{currentLang === 'mr' ? 'उत्पादने व्यवस्थापन' : 'Manage Products'}</span>
            </NavLink>
            <NavLink
              to="/admin/appointments"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <CalendarDays className="w-4 h-4 text-[#245C2A]" />
              <span>{currentLang === 'mr' ? 'अपॉइंटमेंट्स' : 'Manage Appointments'}</span>
            </NavLink>
            <NavLink
              to="/admin/enquiries"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <MessageSquare className="w-4 h-4 text-[#245C2A]" />
              <span>{currentLang === 'mr' ? 'चौकशी अर्ज' : 'Customer Enquiries'}</span>
            </NavLink>
            <NavLink
              to="/admin/crops"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <Sprout className="w-4 h-4 text-[#245C2A]" />
              <span>{currentLang === 'mr' ? 'पीक मार्गदर्शक' : 'Crop Guides'}</span>
            </NavLink>
            <NavLink
              to="/admin/articles"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <FileText className="w-4 h-4 text-[#245C2A]" />
              <span>{currentLang === 'mr' ? 'माहिती लेख' : 'Articles'}</span>
            </NavLink>

            <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold transition"
              >
                <span>{currentLang === 'mr' ? 'शेतकरी वेबसाईट उघडा' : 'Go to Public Website'}</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{currentLang === 'mr' ? 'प्रशासक लॉगआउट' : 'Sign Out of Admin'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Admin Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Dedicated Admin Footer */}
      <footer className="bg-[#1C4920] text-[#EAF2E3] py-4 px-4 border-t border-[#143618] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-stone-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">
              {currentLang === 'mr' ? 'ऋषी कृषी सेवा केंद्र — प्रशासकीय नियंत्रण कक्ष' : 'Rushi Krushi Seva Kendra — Store Proprietor Control Panel'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <span>Pargaon, Ambegaon, Pune</span>
            <span>•</span>
            <Link to="/" className="text-[#F2C94C] hover:underline">
              {currentLang === 'mr' ? 'शेतकरी वेबसाईट' : 'Public Store'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
