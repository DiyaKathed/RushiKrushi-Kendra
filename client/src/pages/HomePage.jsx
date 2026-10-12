import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  ShoppingBag,
  Sprout,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Wheat,
  Apple,
  Carrot,
  Sparkles,
  Droplets
} from 'lucide-react';
import { getProducts, getCrops } from '../services/api';
import ProductCard from '../components/ProductCard';
import CropCard from '../components/CropCard';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredCrops, setFeaturedCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, cropRes] = await Promise.all([
          getProducts({ limit: 4, featured: 'true' }),
          getCrops({ limit: 3 })
        ]);
        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (cropRes.data.success) {
          setFeaturedCrops(cropRes.data.crops.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const whatsappMessage = currentLang === 'mr'
    ? 'नमस्कार, मला ऋषी कृषी सेवा केंद्रामार्फत पिकांविषयी माहिती व सल्ला हवा आहे.'
    : 'Namaskar, I would like to enquire about farming advice and agricultural inputs at Rushi Krushi Seva Kendra.';

  const encodedWhatsApp = `https://wa.me/919890360271?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 6.2 HERO SECTION */}
      <section className="relative bg-[#143618] text-white overflow-hidden border-b-2 border-[#245C2A]">
        {/* Background photo with genuine Indian agricultural context */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=1600&auto=format&fit=crop&q=80"
            alt="Indian farmer in lush green agricultural field"
            className="w-full h-full object-cover object-center filter brightness-[0.35]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/placeholder-agro.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C220E]/95 via-[#143618]/85 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="max-w-2xl space-y-5">
            {/* Local Business Identifier Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1C4920] border border-[#245C2A] text-[#F2C94C] text-xs sm:text-sm font-bold shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#F2C94C]" />
              <span>{t('home.localIdentifier')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-marathi">
              {t('home.heroTitle')}
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#EAF2E3] leading-relaxed max-w-xl font-medium">
              {t('home.heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <Link
                to="/farming-guide"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#F2C94C] hover:bg-[#e0b83b] text-[#263328] font-black text-base shadow-sm transition hover:-translate-y-0.5"
              >
                <BookOpen className="w-5 h-5 text-[#245C2A]" />
                <span>{t('home.heroCtaGuides')}</span>
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-transparent hover:bg-white/10 text-white border-2 border-white font-bold text-base transition hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-5 h-5 text-[#F2C94C]" />
                <span>{t('home.heroCtaProducts')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Badges Strip */}
        <div className="relative z-10 bg-[#0C220E] border-t border-[#1C4920] py-3.5 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-[#EAF2E3]">
              <CheckCircle className="w-4 h-4 text-[#F2C94C] shrink-0" />
              <span>{t('home.badges.verifiedGuidance')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#EAF2E3]">
              <ShieldCheck className="w-4 h-4 text-[#F2C94C] shrink-0" />
              <span>{t('home.badges.authenticInputs')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#EAF2E3]">
              <MapPin className="w-4 h-4 text-[#F2C94C] shrink-0" />
              <span>{t('home.badges.localSupport')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6.3 AGRICULTURAL CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#245C2A] font-marathi">
            {t('home.categoriesTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#5D685B] mt-1.5">
            {t('home.categoriesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Field Crops */}
          <Link
            to="/farming-guide?category=Field"
            className="group bg-white rounded-md border border-[#D7E1D1] p-4 text-center hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-md bg-[#FAF8F0] border border-[#D7E1D1] flex items-center justify-center text-[#80552F] group-hover:bg-[#EAF2E3] transition">
              <Wheat className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#263328] group-hover:text-[#245C2A] transition font-marathi">
              {currentLang === 'mr' ? 'हंगामी पिके' : 'Field Crops'}
            </h3>
            <span className="text-[11px] text-[#5D685B]">ऊस, सोयाबीन, गहू</span>
          </Link>

          {/* Vegetable Crops */}
          <Link
            to="/farming-guide?category=Vegetable"
            className="group bg-white rounded-md border border-[#D7E1D1] p-4 text-center hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-md bg-[#EAF2E3] border border-[#B8D5B0] flex items-center justify-center text-[#245C2A] group-hover:bg-[#FAF8F0] transition">
              <Carrot className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#263328] group-hover:text-[#245C2A] transition font-marathi">
              {currentLang === 'mr' ? 'भाजीपाला' : 'Vegetables'}
            </h3>
            <span className="text-[11px] text-[#5D685B]">कांदा, टोमॅटो, मिरची</span>
          </Link>

          {/* Fruit Crops */}
          <Link
            to="/farming-guide?category=Fruit"
            className="group bg-white rounded-md border border-[#D7E1D1] p-4 text-center hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-md bg-[#FFF5F5] border border-[#FECACA] flex items-center justify-center text-[#991B1B] transition">
              <Apple className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#263328] group-hover:text-[#245C2A] transition font-marathi">
              {currentLang === 'mr' ? 'फळबागा' : 'Fruit Crops'}
            </h3>
            <span className="text-[11px] text-[#5D685B]">डाळिंब, द्राक्षे, आंबा</span>
          </Link>

          {/* Seeds */}
          <Link
            to="/products?category=Seeds"
            className="group bg-white rounded-md border border-[#D7E1D1] p-4 text-center hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-md bg-[#FAF8F0] border border-[#D7E1D1] flex items-center justify-center text-[#245C2A] group-hover:bg-[#EAF2E3] transition">
              <Sprout className="w-6 h-6 text-[#438A35]" />
            </div>
            <h3 className="text-sm font-bold text-[#263328] group-hover:text-[#245C2A] transition font-marathi">
              {currentLang === 'mr' ? 'बियाणे' : 'Seeds'}
            </h3>
            <span className="text-[11px] text-[#5D685B]">प्रमाणित वाण</span>
          </Link>

          {/* Fertilizers */}
          <Link
            to="/products?category=Fertilizers"
            className="group bg-white rounded-md border border-[#D7E1D1] p-4 text-center hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1E40AF] transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#263328] group-hover:text-[#245C2A] transition font-marathi">
              {currentLang === 'mr' ? 'खते व पोषण' : 'Fertilizers'}
            </h3>
            <span className="text-[11px] text-[#5D685B]">NPK, सूक्ष्मअन्नद्रव्ये</span>
          </Link>

          {/* Crop Protection */}
          <Link
            to="/products?category=Insecticides"
            className="group bg-white rounded-md border border-[#D7E1D1] p-4 text-center hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-md bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0F766E] transition">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#263328] group-hover:text-[#245C2A] transition font-marathi">
              {currentLang === 'mr' ? 'पीक संरक्षण' : 'Protection'}
            </h3>
            <span className="text-[11px] text-[#5D685B]">कीटक व बुरशीनाशके</span>
          </Link>
        </div>
      </section>

      {/* 6.4 FEATURED FARMING GUIDES */}
      <section className="bg-[#EAF2E3] py-14 border-y border-[#D7E1D1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#438A35] uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{currentLang === 'mr' ? 'शास्त्रीय कृषी सल्ला' : 'Scientific Agronomy'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#245C2A] font-marathi">
                {t('home.featuredGuidesTitle')}
              </h2>
              <p className="text-sm text-[#5D685B] mt-1">
                {t('home.featuredGuidesSubtitle')}
              </p>
            </div>
            <Link
              to="/farming-guide"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#245C2A] hover:underline transition"
            >
              <span>{t('common.viewAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCrops.map((crop) => (
              <CropCard key={crop._id} crop={crop} />
            ))}
          </div>
        </div>
      </section>

      {/* 6.5 FEATURED PRODUCTS AT PHYSICAL STORE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#438A35] uppercase tracking-wider mb-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{currentLang === 'mr' ? 'पारगाव दुकानातील साठा' : 'Physical Store Inventory'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#245C2A] font-marathi">
              {t('home.featuredProductsTitle')}
            </h2>
            <p className="text-sm text-[#5D685B] mt-1">
              {t('home.featuredProductsSubtitle')}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#245C2A] hover:underline transition"
          >
            <span>{t('common.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6.6 ABOUT THE STORE INTRO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-md border border-[#D7E1D1] shadow-card p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-[#438A35] uppercase tracking-wider">
              {t('about.proprietorHeading')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#245C2A] font-marathi">
              {t('home.aboutSnippetTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[#263328] leading-relaxed">
              {t('home.aboutSnippetText')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-[#263328]">
                <CheckCircle className="w-4 h-4 text-[#438A35] shrink-0" />
                <span>{t('about.qualityTitle')}</span>
              </div>
              <div className="flex items-center gap-2 text-[#263328]">
                <CheckCircle className="w-4 h-4 text-[#438A35] shrink-0" />
                <span>{t('about.trustTitle')}</span>
              </div>
              <div className="flex items-center gap-2 text-[#263328]">
                <CheckCircle className="w-4 h-4 text-[#438A35] shrink-0" />
                <span>{t('about.serviceTitle')}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#245C2A] hover:bg-[#1C4920] text-white font-semibold text-sm transition shadow-xs"
              >
                <span>{t('common.learnMore')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+919890360271"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#D7E1D1] bg-[#FAF8F0] hover:bg-[#EAF2E3] text-[#263328] text-sm font-semibold transition"
              >
                <Phone className="w-4 h-4 text-[#245C2A]" />
                <span>{t('common.callUs')}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-md overflow-hidden border border-[#D7E1D1] shadow-xs aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=800&auto=format&fit=crop&q=80"
                alt="Rushi Krushi agricultural advice"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-agro.svg';
                }}
              />
            </div>
            <div className="absolute -bottom-3 -left-3 bg-[#245C2A] text-white p-3 rounded-md shadow-md border border-[#1C4920] text-xs hidden sm:block">
              <p className="font-bold">{t('common.proprietor')}</p>
              <p className="text-[#F2C94C]">Pargaon, Ambegaon, Pune</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6.7 COMMUNITY & FARMER NETWORK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-md bg-[#245C2A] text-white p-8 sm:p-12 text-center space-y-5 border border-[#1C4920] shadow-card">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black font-marathi">
              {t('home.communityTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[#EAF2E3] leading-relaxed">
              {t('home.communitySubtitle')}
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#F2C94C] hover:bg-[#e0b83b] text-[#263328] font-bold text-sm shadow-xs transition"
              >
                <Sprout className="w-4 h-4 text-[#245C2A]" />
                <span>{t('home.communityCtaRegister')}</span>
              </Link>
              <a
                href={encodedWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#438A35] hover:bg-[#357529] text-white font-bold text-sm shadow-xs border border-[#79A83B] transition"
              >
                <MessageCircle className="w-4 h-4 text-[#F2C94C]" />
                <span>{t('home.communityCtaWhatsapp')}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
