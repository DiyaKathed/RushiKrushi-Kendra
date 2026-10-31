import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Phone,
  Clock,
  MapPin,
  Menu,
  X,
  User,
  ShieldAlert,
  Sprout,
  LogOut,
  Layers,
  FileText
} from 'lucide-react';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const currentLang = i18n.language || 'en';

  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('rushikrushi_lang', lng);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${
      isActive
        ? 'text-[#245C2A] bg-[#EAF2E3] font-bold border-b-2 border-[#245C2A]'
        : 'text-[#263328] hover:text-[#245C2A] hover:bg-[#F4F8F2]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D7E1D1] shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-[#1C4920] text-[#FAF8F0] text-xs py-2 px-4 border-b border-[#143618]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[#EAF2E3]">
              <MapPin className="w-3.5 h-3.5 text-[#F2C94C]" />
              <span>{t('common.locationShort')}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-[#EAF2E3]">
              <Clock className="w-3.5 h-3.5 text-[#F2C94C]" />
              <span>{t('common.hours')}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Click to Call */}
            <a
              href="tel:+919890360271"
              className="flex items-center gap-1.5 text-[#F2C94C] font-bold hover:underline transition"
            >
              <Phone className="w-3.5 h-3.5 fill-[#F2C94C]" />
              <span>+91 9890360271</span>
            </a>

            <div className="h-3 w-px bg-[#245C2A]"></div>

            {/* Language Switcher */}
            <div className="inline-flex rounded-md p-0.5 bg-[#143618] border border-[#245C2A] text-xs font-semibold">
              <button
                type="button"
                onClick={() => switchLanguage('en')}
                className={`px-2.5 py-0.5 rounded transition ${
                  currentLang === 'en'
                    ? 'bg-[#F2C94C] text-[#263328] font-bold shadow-xs'
                    : 'text-[#EAF2E3] hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => switchLanguage('mr')}
                className={`px-2.5 py-0.5 rounded transition font-marathi ${
                  currentLang === 'mr'
                    ? 'bg-[#F2C94C] text-[#263328] font-bold shadow-xs'
                    : 'text-[#EAF2E3] hover:text-white'
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Store Identity */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-hidden">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-black border-2 border-[#245C2A] shadow-xs shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
              <img src="/logo.png" alt="Rushi Krushi Seva Kendra Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#245C2A] tracking-tight leading-none font-marathi">
                  {currentLang === 'mr' ? 'ऋषी कृषी सेवा केंद्र' : 'Rushi Krushi Seva Kendra'}
                </span>
              </div>
              <p className="text-xs text-[#5D685B] font-semibold tracking-wide uppercase mt-0.5">
                {t('common.tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to="/" className={navLinkClass}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              {t('nav.about')}
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              {t('nav.products')}
            </NavLink>
            <NavLink to="/farming-guide" className={navLinkClass}>
              {t('nav.farmingGuide')}
            </NavLink>
            <NavLink to="/inputs" className={navLinkClass}>
              {t('nav.fertilizerGuide')}
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              {t('nav.contact')}
            </NavLink>
          </nav>

          {/* User Account & Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-agro-dark bg-agro-50 hover:bg-agro-100 rounded-lg border border-agro-200 transition"
                >
                  <User className="w-4 h-4 text-agro-forest" />
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                  {isAdmin && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-xl border border-stone-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-500">{t('common.proprietor')}</p>
                      <p className="text-sm font-semibold text-stone-800 truncate">{user?.name}</p>
                    </div>

                    {isAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-agro-50 hover:text-agro-dark"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>{t('admin.dashboardTitle')}</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/farmer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-agro-50 hover:text-agro-dark"
                        >
                          <Layers className="w-4 h-4 text-agro-forest" />
                          <span>{t('nav.farmerDashboard')}</span>
                        </Link>
                        <Link
                          to="/farmer/crops"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-agro-50 hover:text-agro-dark"
                        >
                          <Sprout className="w-4 h-4 text-agro-forest" />
                          <span>{t('nav.myCrops')}</span>
                        </Link>
                        <Link
                          to="/farmer/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-agro-50 hover:text-agro-dark"
                        >
                          <User className="w-4 h-4 text-agro-forest" />
                          <span>{t('nav.profile')}</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-stone-100 my-1"></div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#245C2A] hover:bg-[#1C4920] rounded-md transition shadow-xs"
                >
                  <User className="w-4 h-4 text-[#F2C94C]" />
                  <span>{t('nav.farmerLogin')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-agro-dark hover:bg-agro-50 focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-agro-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-md text-base font-medium ${
                isActive ? 'bg-agro-100 text-agro-dark font-bold' : 'text-stone-700 hover:bg-stone-50'
              }`
            }
          >
            {t('nav.home')}
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-md text-base font-medium ${
                isActive ? 'bg-agro-100 text-agro-dark font-bold' : 'text-stone-700 hover:bg-stone-50'
              }`
            }
          >
            {t('nav.about')}
          </NavLink>
          <NavLink
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-md text-base font-medium ${
                isActive ? 'bg-agro-100 text-agro-dark font-bold' : 'text-stone-700 hover:bg-stone-50'
              }`
            }
          >
            {t('nav.products')}
          </NavLink>
          <NavLink
            to="/farming-guide"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-md text-base font-medium ${
                isActive ? 'bg-agro-100 text-agro-dark font-bold' : 'text-stone-700 hover:bg-stone-50'
              }`
            }
          >
            {t('nav.farmingGuide')}
          </NavLink>
          <NavLink
            to="/inputs"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-md text-base font-medium ${
                isActive ? 'bg-agro-100 text-agro-dark font-bold' : 'text-stone-700 hover:bg-stone-50'
              }`
            }
          >
            {t('nav.fertilizerGuide')}
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-md text-base font-medium ${
                isActive ? 'bg-agro-100 text-agro-dark font-bold' : 'text-stone-700 hover:bg-stone-50'
              }`
            }
          >
            {t('nav.contact')}
          </NavLink>

          <div className="border-t border-stone-200 pt-3 mt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-sm font-semibold text-agro-forest">
                  {user?.name} {isAdmin && '(Admin)'}
                </div>
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium bg-amber-50 text-amber-900"
                  >
                    {t('admin.dashboardTitle')}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/farmer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium bg-agro-50 text-agro-dark"
                    >
                      {t('nav.farmerDashboard')}
                    </Link>
                    <Link
                      to="/farmer/crops"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50"
                    >
                      {t('nav.myCrops')}
                    </Link>
                    <Link
                      to="/farmer/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50"
                    >
                      {t('nav.profile')}
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-center rounded-lg bg-agro-forest text-white font-semibold text-sm shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.farmerLogin')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
