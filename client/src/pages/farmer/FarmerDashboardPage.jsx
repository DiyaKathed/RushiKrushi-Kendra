import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  PlusCircle,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ShoppingBag,
  ArrowRight,
  Phone,
  MessageCircle,
  UserCheck
} from 'lucide-react';
import { getFarmerCrops, getProducts, getCrops } from '../../services/api';

const FarmerDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { user } = useAuth();

  const [crops, setCrops] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [cropRes, prodRes, guideRes] = await Promise.all([
          getFarmerCrops(),
          getProducts({ limit: 3, featured: 'true' }),
          getCrops({ limit: 3 })
        ]);

        if (cropRes.data.success) setCrops(cropRes.data.crops);
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.products);
        if (guideRes.data.success) setGuides(guideRes.data.crops);
      } catch (err) {
        console.error('Failed to load farmer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const activeCrops = crops.filter(c => c.status === 'Growing');
  const harvestedCrops = crops.filter(c => c.status === 'Harvested');

  const whatsappInquiry = `https://wa.me/919890360271?text=${encodeURIComponent(
    currentLang === 'mr'
      ? `नमस्कार, मी ${user?.name || 'शेतकरी'} बोलतोय. मला शेतातील पिकांविषयी सल्ला हवा आहे.`
      : `Namaskar, I am farmer ${user?.name || ''}. I need agronomic guidance for my farm.`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#245C2A] text-white rounded-xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FAF8F0] border border-white/20 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5 text-[#F2C94C]" />
            <span>{currentLang === 'mr' ? 'नोंदणीकृत शेतकरी' : 'Verified Farmer'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-marathi text-white">
            {t('farmer.welcome')}, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-[#FAF8F0]/90 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#F2C94C]" />
            <span>
              {user?.village ? `${user.village}, ` : ''}
              {user?.taluka || 'Ambegaon'}, {user?.district || 'Pune'}
            </span>
            {user?.farmArea && (
              <>
                <span>•</span>
                <span>{user.farmArea}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/farmer/crops/add"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#245C2A] font-bold text-sm shadow-sm hover:bg-[#FAF8F0] transition"
          >
            <PlusCircle className="w-4 h-4 text-[#245C2A]" />
            <span>{t('farmer.addCropBtn')}</span>
          </Link>
          <a
            href={whatsappInquiry}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-2.5 rounded-lg bg-[#438A35] hover:bg-[#79A83B] text-white shadow-sm transition"
            title="WhatsApp Store"
          >
            <MessageCircle className="w-5 h-5 text-[#F2C94C]" />
          </a>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#D7E1D1] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5D685B] uppercase">{t('farmer.summaryActiveCrops')}</p>
            <p className="text-2xl font-black text-[#263328]">{activeCrops.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D7E1D1] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FAF8F0] text-[#80552F] border border-[#D7E1D1] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5D685B] uppercase">{t('farmer.summaryHarvestedCrops')}</p>
            <p className="text-2xl font-black text-[#263328]">{harvestedCrops.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D7E1D1] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5D685B] uppercase">{t('farmer.summaryFarmArea')}</p>
            <p className="text-2xl font-black text-[#263328]">{user?.farmArea || '—'}</p>
          </div>
        </div>
      </div>

      {/* Main Section: My Crops Diary */}
      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D7E1D1] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#245C2A] font-marathi">
              {t('farmer.myCropsTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#5D685B]">
              {t('farmer.myCropsSubtitle')}
            </p>
          </div>
          <Link
            to="/farmer/crops"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#245C2A] hover:text-[#438A35]"
          >
            <span>{t('common.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#D7E1D1] border-t-[#245C2A] rounded-full animate-spin"></div>
          </div>
        ) : crops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crops.slice(0, 3).map((c) => (
              <div
                key={c._id}
                className="p-4 rounded-xl border border-[#D7E1D1] bg-[#FAF8F0]/40 hover:bg-white hover:border-[#245C2A] transition shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#263328] text-base font-marathi">
                      {c.cropName}
                    </h3>
                    {c.variety && (
                      <span className="text-xs text-[#5D685B] font-medium">वाण: {c.variety}</span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                    c.status === 'Growing'
                      ? 'bg-[#EAF2E3] text-[#245C2A] border-[#D7E1D1]'
                      : c.status === 'Harvested'
                      ? 'bg-stone-200 text-stone-800 border-stone-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#5D685B]">
                  <div className="flex items-center justify-between">
                    <span>वाढीचा टप्पा:</span>
                    <strong className="text-[#245C2A]">{c.growthStage || 'Vegetative'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>लागवड तारीख:</span>
                    <span>{new Date(c.sowingDate).toLocaleDateString()}</span>
                  </div>
                  {c.farmArea && (
                    <div className="flex items-center justify-between">
                      <span>क्षेत्र:</span>
                      <span>{c.farmArea}</span>
                    </div>
                  )}
                </div>

                {c.visibleProblems && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-tight">
                    <strong>लक्षणे:</strong> {c.visibleProblems}
                  </div>
                )}

                <div className="pt-2 border-t border-[#D7E1D1] flex items-center justify-between">
                  <Link
                    to={`/farmer/crops/${c._id}`}
                    className="text-xs font-bold text-[#245C2A] hover:underline"
                  >
                    तपशील व बदल →
                  </Link>
                  {c.cropRef && (
                    <Link
                      to={`/farming-guide/crops/${c.cropRef.slug || c.cropRef._id}`}
                      className="text-[11px] text-[#5D685B] hover:text-[#263328] flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3 text-[#245C2A]" />
                      <span>मार्गदर्शक पाहा</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-4 max-w-sm mx-auto">
            <Sprout className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-xs sm:text-sm text-[#5D685B]">
              {t('farmer.noCropsMessage')}
            </p>
            <Link
              to="/farmer/crops/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#245C2A] hover:bg-[#438A35] text-white text-xs sm:text-sm font-bold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('farmer.addCropBtn')}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Relevant Store Products & Crop Guides Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Guides */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#245C2A] font-marathi">
              {currentLang === 'mr' ? 'हंगामी शेती मार्गदर्शक' : 'Seasonal Crop Guides'}
            </h2>
            <Link to="/farming-guide" className="text-xs font-semibold text-[#245C2A] hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="space-y-2.5">
            {guides.map((g) => (
              <Link
                key={g._id}
                to={`/farming-guide/crops/${g.slug || g._id}`}
                className="p-3 rounded-lg border border-[#D7E1D1] hover:border-[#245C2A] hover:bg-[#FAF8F0] transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center font-bold text-sm">
                    {g.nameMr ? g.nameMr[0] : g.nameEn[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#263328] font-marathi">
                      {currentLang === 'mr' ? g.nameMr || g.nameEn : g.nameEn}
                    </h3>
                    <span className="text-[11px] text-[#5D685B]">{g.category} Crop</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#5D685B]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Store Products */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#245C2A] font-marathi">
              {currentLang === 'mr' ? 'दुकानातील महत्त्वाची उत्पादने' : 'Available at Pargaon Store'}
            </h2>
            <Link to="/products" className="text-xs font-semibold text-[#245C2A] hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="space-y-2.5">
            {featuredProducts.map((p) => (
              <Link
                key={p._id}
                to={`/products/${p.slug || p._id}`}
                className="p-3 rounded-lg border border-[#D7E1D1] hover:border-[#245C2A] hover:bg-[#FAF8F0] transition flex items-center justify-between gap-3"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#263328] font-marathi line-clamp-1">
                    {currentLang === 'mr' ? p.nameMr || p.nameEn : p.nameEn}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#5D685B] mt-0.5">
                    <span>{p.brand}</span>
                    <span>•</span>
                    <span className="text-[#245C2A] font-semibold">{p.category}</span>
                  </div>
                </div>
                <span className="text-xs text-[#245C2A] font-bold shrink-0">
                  {p.indicativePrice || 'View'} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboardPage;
