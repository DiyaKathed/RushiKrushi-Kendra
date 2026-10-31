import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Search,
  X,
  Wheat,
  Carrot,
  Apple,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getCrops, getArticles, extractCrops, extractArticles } from '../services/api';
import CropCard from '../components/CropCard';

const FarmingGuidePage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [searchParams, setSearchParams] = useSearchParams();

  const [crops, setCrops] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchTerm.trim() !== '') params.search = searchTerm.trim();
        if (selectedCategory !== 'All') params.category = selectedCategory;

        const [cropRes, artRes] = await Promise.all([
          getCrops(params),
          getArticles()
        ]);

        setCrops(extractCrops(cropRes));
        setArticles(extractArticles(artRes));
      } catch (err) {
        console.error('Error fetching farming guides:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{currentLang === 'mr' ? 'शास्त्रीय शेती ज्ञानकोश' : 'Scientific Farming Knowledge'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#245C2A] font-marathi">
          {t('farmingGuide.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#5D685B] leading-relaxed">
          {t('farmingGuide.subtitle')}
        </p>
      </div>

      {/* Advisory Note */}
      <div className="bg-[#EAF2E3] border border-[#D7E1D1] rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm text-[#263328] shadow-xs">
        <ShieldCheck className="w-5 h-5 text-[#245C2A] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('farmingGuide.scientificDisclaimer')}
        </p>
      </div>

      {/* Search and Category Tabs */}
      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5D685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('farmingGuide.searchPlaceholder')}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#D7E1D1] text-sm text-[#263328] placeholder-[#5D685B] bg-[#FAF8F0]/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D685B] hover:text-[#263328]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => handleCategorySelect('All')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition border ${
              selectedCategory === 'All'
                ? 'bg-[#245C2A] text-white border-[#245C2A] shadow-xs'
                : 'bg-[#FAF8F0] text-[#263328] border-[#D7E1D1] hover:bg-[#EAF2E3]'
            }`}
          >
            {t('farmingGuide.categoryAll')}
          </button>

          <button
            type="button"
            onClick={() => handleCategorySelect('Field')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
              selectedCategory === 'Field'
                ? 'bg-[#245C2A] text-white border-[#245C2A] shadow-xs'
                : 'bg-[#FAF8F0] text-[#263328] border-[#D7E1D1] hover:bg-[#EAF2E3]'
            }`}
          >
            <Wheat className="w-4 h-4 text-[#F2C94C]" />
            <span>{t('farmingGuide.categoryField')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategorySelect('Vegetable')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
              selectedCategory === 'Vegetable'
                ? 'bg-[#245C2A] text-white border-[#245C2A] shadow-xs'
                : 'bg-[#FAF8F0] text-[#263328] border-[#D7E1D1] hover:bg-[#EAF2E3]'
            }`}
          >
            <Carrot className="w-4 h-4 text-[#438A35]" />
            <span>{t('farmingGuide.categoryVegetable')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategorySelect('Fruit')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
              selectedCategory === 'Fruit'
                ? 'bg-[#245C2A] text-white border-[#245C2A] shadow-xs'
                : 'bg-[#FAF8F0] text-[#263328] border-[#D7E1D1] hover:bg-[#EAF2E3]'
            }`}
          >
            <Apple className="w-4 h-4 text-[#80552F]" />
            <span>{t('farmingGuide.categoryFruit')}</span>
          </button>
        </div>
      </div>

      {/* Crop Guides Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs sm:text-sm text-[#5D685B]">
          <span>
            {currentLang === 'mr' ? 'उपलब्ध पीक मार्गदर्शक: ' : 'Available Guides: '}
            <strong className="text-[#263328] font-bold">{crops.length}</strong>
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#D7E1D1] border-t-[#245C2A] rounded-full animate-spin"></div>
            <p className="text-sm text-[#5D685B]">{t('common.loading')}</p>
          </div>
        ) : crops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <CropCard key={crop._id} crop={crop} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#D7E1D1] p-12 text-center space-y-3">
            <p className="text-[#5D685B] font-medium">{t('farmingGuide.noCropsFound')}</p>
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="text-xs text-[#245C2A] font-bold underline"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* Featured Educational Articles Section */}
      {articles.length > 0 && (
        <div className="pt-8 border-t border-[#D7E1D1] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#245C2A] font-marathi">
                {currentLang === 'mr' ? 'महत्त्वाचे कृषी व खत व्यवस्थापन लेख' : 'Featured Agronomy & Input Articles'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5D685B] mt-1">
                {currentLang === 'mr'
                  ? 'रासायनिक खते, कीटकनाशक फवारणी सुरक्षा आणि माती परीक्षण याविषयी तज्ज्ञ लेख.'
                  : 'Practical guides on balanced NPK, sprayer safety, and soil test interpretation.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => {
              const title = currentLang === 'mr' ? (article.titleMr || article.titleEn) : (article.titleEn || article.titleMr);
              const summary = currentLang === 'mr' ? (article.summaryMr || article.summaryEn) : (article.summaryEn || article.summaryMr);
              const img = article.imageUrl || article.image_url || '/placeholder-agro.svg';

              return (
                <div
                  key={article._id || article.slug}
                  className="bg-white rounded-xl border border-[#D7E1D1] shadow-card hover:shadow-card-hover transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="aspect-16/9 bg-[#FAF8F0] border-b border-[#D7E1D1] overflow-hidden">
                    <img
                      src={img}
                      alt={title || 'Article'}
                      className="article-card-image hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder-agro.svg';
                      }}
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="inline-block text-[11px] font-bold text-[#245C2A] uppercase tracking-wider bg-[#EAF2E3] px-2.5 py-0.5 rounded border border-[#D7E1D1]">
                        {article.category}
                      </span>
                      <h3 className="text-lg font-bold text-[#263328] hover:text-[#245C2A] transition font-marathi">
                        <Link to={`/farming-guide/articles/${article.slug || article._id}`}>
                          {title}
                        </Link>
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5D685B] line-clamp-2 leading-relaxed">
                        {summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#D7E1D1] flex items-center justify-between">
                      <span className="text-[11px] text-[#5D685B]">
                        {article.sourceReferences || 'ICAR / MPKV Rahuri'}
                      </span>
                      <Link
                        to={`/farming-guide/articles/${article.slug || article._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#245C2A] hover:text-[#438A35] transition"
                      >
                        <span>{t('common.readMore')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmingGuidePage;
