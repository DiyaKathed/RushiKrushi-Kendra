import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  X,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { getProducts, extractProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES_LIST = [
  'All',
  'Seeds',
  'Fertilizers',
  'Micronutrients',
  'Biofertilizers',
  'Insecticides',
  'Fungicides',
  'Herbicides',
  'Plant Growth Promoters',
  'Organic Inputs',
  'Farming Tools',
  'Spray Pumps',
  'Irrigation Accessories'
];

const ProductsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Available brands in the catalogue
  const [availableBrands, setAvailableBrands] = useState([]);

  useEffect(() => {
    // Sync URL query params if present
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchTerm.trim() !== '') params.search = searchTerm.trim();
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedBrand !== 'All') params.brand = selectedBrand;
        if (inStockOnly) params.availability = 'in_stock';

        const res = await getProducts(params);
        const items = extractProducts(res);
        setProducts(items);
        setTotal(res.data?.total ?? items.length);
        if (res.data?.brands && Array.isArray(res.data.brands)) {
          setAvailableBrands(['All', ...res.data.brands]);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCatalog, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedBrand, inStockOnly]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setInStockOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#EAF2E3] text-[#245C2A] border border-[#B8D5B0] text-xs font-bold uppercase tracking-wider">
          <ShoppingBag className="w-3.5 h-3.5 text-[#438A35]" />
          <span>{currentLang === 'mr' ? 'दुकान उत्पादन सूची' : 'Physical Store Catalogue'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#245C2A] font-marathi">
          {t('products.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#5D685B] leading-relaxed">
          {t('products.subtitle')}
        </p>
      </div>

      {/* Non E-Commerce Advisory Banner */}
      <div className="bg-[#FAF8F0] border border-[#D7E1D1] rounded-md p-4 flex items-start sm:items-center gap-3 text-xs sm:text-sm text-[#263328] shadow-xs">
        <ShieldCheck className="w-5 h-5 text-[#438A35] shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <p className="font-medium leading-relaxed">
            <span className="font-bold text-[#245C2A]">
              {currentLang === 'mr' ? 'महत्त्वाची नोंद: ' : 'Store Notice: '}
            </span>
            {t('common.disclaimerNotEcommerce')}
          </p>
        </div>
        <a
          href="tel:+919890360271"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#245C2A] hover:bg-[#1C4920] text-white font-semibold text-xs shrink-0 transition shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#F2C94C]" />
          <span>+91 9890360271</span>
        </a>
      </div>

      {/* Search & Filters Control Bar */}
      <div className="bg-white rounded-md border border-[#D7E1D1] shadow-card p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Live Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#5D685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('products.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-[#D7E1D1] text-sm focus:outline-hidden focus:ring-1 focus:ring-[#245C2A] focus:border-[#245C2A] transition"
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

          {/* Brand Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[#D7E1D1] text-sm focus:outline-hidden focus:ring-1 focus:ring-[#245C2A]"
            >
              <option value="All">{t('products.allBrands')}</option>
              {availableBrands.filter(b => b !== 'All').map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* In Stock Toggle */}
          <div className="md:col-span-3 flex items-center justify-between sm:justify-start gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-[#263328]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#245C2A] focus:ring-[#245C2A] accent-[#245C2A]"
              />
              <span>{t('products.inStockOnly')}</span>
            </label>

            {(searchTerm || selectedCategory !== 'All' || selectedBrand !== 'All' || inStockOnly) && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline underline-offset-2 ml-auto"
              >
                {t('products.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Slider / Wrap */}
        <div className="pt-2 border-t border-[#D7E1D1] flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES_LIST.map((category) => {
            const isSelected = selectedCategory === category;
            const categoryLabel = category === 'All'
              ? t('products.allCategories')
              : (t(`products.categories.${category}`) || category);

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-[#245C2A] text-white border-[#1C4920] shadow-xs'
                    : 'bg-[#FAF8F0] text-[#263328] border-[#D7E1D1] hover:bg-[#EAF2E3]'
                }`}
              >
                {categoryLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-600">
        <span>
          {currentLang === 'mr' ? 'एकूण उत्पादने: ' : 'Showing products: '}
          <strong className="text-stone-900 font-bold">{products.length}</strong>
        </span>
        {selectedCategory !== 'All' && (
          <span className="font-semibold text-agro-forest">
            {t(`products.categories.${selectedCategory}`) || selectedCategory}
          </span>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-agro-200 border-t-agro-forest rounded-full animate-spin"></div>
          <p className="text-sm text-stone-500">{t('common.loading')}</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">
            {t('products.noProductsFound')}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            {currentLang === 'mr'
              ? 'दुकानातील साठ्याविषयी किंवा विशेष ऑर्डरविषयी थेट दुकानदारांशी बोला.'
              : 'Contact our Pargaon store directly to enquire about batch availability or special procurement.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
            >
              {t('products.clearFilters')}
            </button>
            <a
              href="tel:+919890360271"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              {t('common.callUs')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
