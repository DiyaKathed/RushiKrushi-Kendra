import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MessageCircle,
  Phone,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShieldAlert,
  ArrowLeft,
  Share2,
  Calendar,
  Layers,
  Sprout,
  Building2
} from 'lucide-react';
import { getProduct, extractItem, extractProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackSize, setSelectedPackSize] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getProduct(slug);
        const item = extractItem(res, 'product');
        if (item) {
          setProduct(item);
          const rel = extractProducts(res.data?.related || []);
          setRelatedProducts(rel);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-agro-200 border-t-agro-forest rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-stone-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-stone-800">Product not found</h2>
        <p className="text-sm text-stone-500">The product you are looking for might have been moved or removed.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-agro-dark text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </Link>
      </div>
    );
  }

  const nameEn = (product.nameEn || product.name_en || product.name || '').trim();
  const nameMr = (product.nameMr || product.name_mr || '').trim();
  const productName = currentLang === 'mr' ? (nameMr || nameEn) : (nameEn || nameMr);

  const descriptionEn = product.descriptionEn || product.description_en || product.description || '';
  const descriptionMr = product.descriptionMr || product.description_mr || '';
  const description = currentLang === 'mr' ? (descriptionMr || descriptionEn) : (descriptionEn || descriptionMr);

  const safetyPrecautionsEn = product.safetyPrecautionsEn || product.safety_precautions_en || '';
  const safetyPrecautionsMr = product.safetyPrecautionsMr || product.safety_precautions_mr || '';
  const safetyPrecautions = currentLang === 'mr' ? (safetyPrecautionsMr || safetyPrecautionsEn) : (safetyPrecautionsEn || safetyPrecautionsMr);

  const brand = (product.brand || product.company || '').trim();
  const category = product.category || 'General';

  // Pack sizes normalization (deduplicated for customer display)
  const rawPacks = product.packSizes || product.pack_sizes || product.packSize || product.pack_size;
  const packSizes = Array.from(new Set(Array.isArray(rawPacks)
    ? rawPacks.map(s => String(s).trim()).filter(Boolean)
    : (typeof rawPacks === 'string' && rawPacks.trim()
        ? rawPacks.split(',').map(s => s.trim()).filter(Boolean)
        : [])));

  // Stock quantity: display only when available and meaningful
  const rawStock = product.stockQuantity !== undefined ? product.stockQuantity : product.stock_quantity;
  const hasMeaningfulStock = rawStock !== undefined && rawStock !== null && rawStock !== '' && !isNaN(Number(rawStock)) && Number(rawStock) > 0;
  const stockQuantity = hasMeaningfulStock ? Number(rawStock) : null;

  // Price formatting: check numeric price, then indicativePrice. Never show ₹0.
  let formattedPrice = null;
  if (product.price !== null && product.price !== undefined && product.price !== '') {
    const numPrice = Number(product.price);
    if (!isNaN(numPrice) && numPrice > 0) {
      formattedPrice = `₹${numPrice.toLocaleString('en-IN')}`;
    }
  }
  if (!formattedPrice) {
    const rawIndicative = product.indicativePrice || product.indicative_price;
    if (rawIndicative && typeof rawIndicative === 'string') {
      const trimmed = rawIndicative.trim();
      if (trimmed && trimmed !== '0' && trimmed !== '₹0' && trimmed !== '₹0.00' && !trimmed.toLowerCase().includes('₹0/')) {
        formattedPrice = trimmed;
      }
    }
  }

  const applicableCrops = Array.isArray(product.applicableCrops)
    ? product.applicableCrops
    : (Array.isArray(product.applicable_crops) ? product.applicable_crops : []);

  const isAvailable = product.availability === 'in_stock' || product.is_available === true;

  // Active variant matching for multi-pack products
  const activeVariant = Array.isArray(product.variants) && selectedPackSize
    ? product.variants.find((v) => v.packSize === selectedPackSize)
    : null;

  // Calculate dynamic display price based on active pack variant or baseline formattedPrice
  let displayPrice = formattedPrice;
  if (activeVariant && activeVariant.mrp) {
    displayPrice = `₹${activeVariant.mrp.toLocaleString('en-IN')}`;
  }

  // Pre-filled WhatsApp message including selected pack variant
  const packSuffix = selectedPackSize ? ` [पॅक: ${selectedPackSize}]` : '';
  const packSuffixEn = selectedPackSize ? ` [Pack: ${selectedPackSize}]` : '';
  const whatsappText = currentLang === 'mr'
    ? `नमस्कार, मला ${productName}${brand ? ` (${brand})` : ''}${packSuffix} या उत्पादनाविषयी चौकशी करायची आहे. हे उत्पादन ऋषी कृषी सेवा केंद्र, पारगाव येथे उपलब्ध आहे का?`
    : `Namaskar, I would like to enquire about ${nameEn || productName}${brand ? ` (${brand})` : ''}${packSuffixEn}. Is it available at Rushi Krushi Seva Kendra?`;

  const whatsappUrl = `https://wa.me/919890360271?text=${encodeURIComponent(whatsappText)}`;

  const hasRealImage = Boolean(
    (product.imageUrl && product.imageUrl.trim() !== '' && product.imageUrl !== '/placeholder-agro.svg') ||
    (product.image_url && product.image_url.trim() !== '') ||
    (product.image && product.image.trim() !== '') ||
    (Array.isArray(product.images) && product.images[0])
  );
  const imageSource = product.imageUrl || product.image_url || product.image || (Array.isArray(product.images) && product.images[0]) || '/placeholder-agro.svg';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-agro-forest transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')} to Catalogue</span>
        </Link>
      </div>

      {/* Main Product Showcase */}
      <div className="bg-white rounded-md border border-[#D7E1D1] shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
        {/* Left: Product Image Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square rounded-md overflow-hidden bg-[#FAF8F0]/40 border border-[#D7E1D1] relative p-6 flex items-center justify-center">
            {hasRealImage ? (
              <img
                src={imageSource}
                alt={currentLang === 'mr'
                  ? `${productName}${brand ? ` - ${brand}` : ''} अधिकृत पॅकेजिंग`
                  : `${productName}${brand ? ` - ${brand}` : ''} official packaging`}
                className="max-h-full max-w-full object-contain object-center product-card-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-agro.svg';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-[#FAF8F0] to-[#EAF2E3]/50 select-none">
                <div className="w-16 h-16 rounded-full bg-white border border-[#D7E1D1] flex items-center justify-center shadow-xs mb-3">
                  <Sprout className="w-8 h-8 text-[#438A35]" />
                </div>
                <span className="text-sm font-bold text-[#245C2A] uppercase tracking-wider">
                  {brand || 'Rushi Krushi'}
                </span>
                {packSizes.length > 0 && (
                  <span className="text-xs font-semibold text-[#5D685B] mt-1">
                    {packSizes.join(' • ')}
                  </span>
                )}
                <span className="text-[11px] text-[#5D685B]/70 mt-2">
                  {currentLang === 'mr' ? 'अधिकृत छायाचित्र लवकरच उपलब्ध' : 'Official packaging image coming soon'}
                </span>
              </div>
            )}

            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-bold bg-[#FAF8F0] text-[#245C2A] border border-[#D7E1D1] shadow-xs">
                <Tag className="w-3.5 h-3.5 text-[#438A35]" />
                <span>{category}</span>
              </span>
            </div>
          </div>

          {/* Physical Store In-Stock Status & Stock Quantity */}
          <div className="p-3 rounded-md bg-[#FAF8F0] border border-[#D7E1D1] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5D685B]">{t('common.status')}:</span>
            <div className="flex items-center gap-2">
              {isAvailable ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C2A] bg-[#EAF2E3] px-3 py-1 rounded-sm border border-[#B8D5B0]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#245C2A]" />
                  <span>{t('common.inStock')}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5D685B] bg-[#F4F8F2] px-3 py-1 rounded-sm border border-[#D7E1D1]">
                  <AlertCircle className="w-3.5 h-3.5 text-[#5D685B]" />
                  <span>{t('common.outOfStock')}</span>
                </span>
              )}
              {hasMeaningfulStock && (
                <span className="inline-flex items-center text-xs font-bold text-[#245C2A] bg-white px-2.5 py-1 rounded-sm border border-[#D7E1D1]">
                  {currentLang === 'mr' ? `उपलब्ध साठा: ${stockQuantity} नग` : `Available Stock: ${stockQuantity} units`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Details & Enquiry Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              {/* Company / Brand Badge */}
              {brand && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C2A] bg-[#EAF2E3] px-2.5 py-1 rounded-sm border border-[#B8D5B0] uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5 text-[#438A35]" />
                    <span>{brand}</span>
                  </span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#263328] mt-1 font-marathi leading-tight">
                {productName}
              </h1>
              {currentLang === 'mr' && nameEn && nameMr && nameEn !== nameMr && (
                <p className="text-sm text-[#5D685B] font-medium mt-0.5">{nameEn}</p>
              )}
            </div>

            {/* Technical Composition */}
            {product.technicalComposition && (
              <div className="p-3 rounded-md bg-[#FAF8F0] border border-[#D7E1D1] text-xs sm:text-sm">
                <span className="font-bold text-[#245C2A]">{t('products.technicalComposition')}: </span>
                <span className="text-[#263328] font-medium">{product.technicalComposition}</span>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="text-sm text-[#263328] leading-relaxed space-y-2">
                <p>{description}</p>
              </div>
            )}

            {/* Available Pack Sizes with Interactive Variant Selector */}
            {packSizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#263328] uppercase tracking-wide">
                    {t('common.packSizes')}
                  </span>
                  {selectedPackSize && (
                    <span className="text-[11px] font-semibold text-[#245C2A] bg-[#EAF2E3] px-2 py-0.5 rounded-sm border border-[#B8D5B0]">
                      {currentLang === 'mr' ? `निवडलेला पॅक: ${selectedPackSize}` : `Selected: ${selectedPackSize}`}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {packSizes.map((pack, idx) => {
                    const isSelected = selectedPackSize === pack;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPackSize(isSelected ? '' : pack)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition border cursor-pointer ${
                          isSelected
                            ? 'bg-[#245C2A] text-white border-[#245C2A] shadow-xs'
                            : 'bg-[#FAF8F0] hover:bg-[#EAF2E3] border-[#D7E1D1] text-[#263328]'
                        }`}
                      >
                        {pack}
                      </button>
                    );
                  })}
                </div>
                {Array.isArray(product.variants) && product.variants.length > 0 && !selectedPackSize && (
                  <p className="text-[11px] text-[#5D685B] italic">
                    {currentLang === 'mr'
                      ? 'विशिष्ट पॅकिंगचा संदर्भ दर पाहण्यासाठी पॅक आकारावर क्लिक करा'
                      : 'Click any pack size to view its specific reference price'}
                  </p>
                )}
              </div>
            )}

            {/* Recommended Crops */}
            {applicableCrops.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-[#263328] uppercase tracking-wide">
                  {t('products.applicableCrops')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {applicableCrops.map((crop, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-[#EAF2E3] text-[#245C2A] border border-[#B8D5B0]"
                    >
                      <Sprout className="w-3.5 h-3.5 text-[#438A35]" />
                      <span>{crop}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dosage & Intended Use */}
            {(product.dosage || product.intendedUse) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                {product.dosage && (
                  <div className="p-3 rounded-md bg-[#FAF8F0] border border-[#D7E1D1]">
                    <span className="font-bold text-[#263328] block mb-0.5">{t('products.dosageGuidance')}:</span>
                    <span className="text-[#5D685B]">{product.dosage}</span>
                  </div>
                )}
                {product.intendedUse && (
                  <div className="p-3 rounded-md bg-[#FAF8F0] border border-[#D7E1D1]">
                    <span className="font-bold text-[#263328] block mb-0.5">{t('products.intendedUse')}:</span>
                    <span className="text-[#5D685B]">{product.intendedUse}</span>
                  </div>
                )}
              </div>
            )}

            {/* Safety Precautions */}
            {safetyPrecautions && (
              <div className="p-3.5 rounded-md bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                  <ShieldAlert className="w-4 h-4 text-[#B45309]" />
                  <span>{t('products.safetyPrecautions')}</span>
                </div>
                <p className="leading-relaxed">{safetyPrecautions}</p>
              </div>
            )}

            {/* Price / Indicative Price / Dated Reference Pricing */}
            {displayPrice && (
              <div className="p-4 rounded-xl bg-[#FAF8F0] border border-[#D7E1D1] space-y-1.5">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-[#5D685B] uppercase tracking-wider">
                    {product.priceListDate
                      ? (currentLang === 'mr' ? 'संदर्भ MRP (किंमत)' : 'Reference MRP')
                      : t('common.indicativePrice')}
                  </span>
                  <span className="text-2xl font-black text-[#245C2A]">{displayPrice}</span>
                </div>
                {product.priceListDate ? (
                  <div className="text-[11px] text-[#5D685B] space-y-0.5 pt-1 border-t border-[#D7E1D1]/60">
                    <p className="font-semibold text-[#263328]">
                      {currentLang === 'mr'
                        ? `* कंपनी अधिकृत दरसूची संदर्भ: दि. ${product.priceListDate}`
                        : `* Official Company Price List Reference: ${product.priceListDate}`}
                    </p>
                    <p className="italic">
                      {currentLang === 'mr'
                        ? 'प्रत्यक्ष शेतकरी विक्री दर, वर्तमान साठा व सवलत माहितीसाठी खालील व्हॉट्सॲप बटनावर थेट संपर्क साधा.'
                        : 'Actual farmer store price, batch availability and retail discounts are confirmed upon WhatsApp enquiry.'}
                    </p>
                  </div>
                ) : (
                  <span className="block text-[11px] text-[#5D685B]">
                    {currentLang === 'mr'
                      ? '(किंमत पॅकिंग आकार व अधिकृत शासकीय दरानुसार असू शकते)'
                      : '(Subject to batch and official government subsidy norms where applicable)'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action CTAs: Direct WhatsApp & Call Buttons */}
          <div className="pt-4 border-t border-[#D7E1D1] space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-md bg-[#245C2A] hover:bg-[#1C4920] text-white font-bold text-sm shadow-xs transition"
              >
                <MessageCircle className="w-5 h-5 fill-[#F2C94C] text-[#245C2A]" />
                <span>{t('products.askViaWhatsapp')}</span>
              </a>

              <a
                href="tel:+919890360271"
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-md bg-[#FAF8F0] hover:bg-[#EAF2E3] text-[#263328] font-bold text-sm border border-[#D7E1D1] transition"
              >
                <Phone className="w-4 h-4 text-[#245C2A]" />
                <span>{t('products.callStoreDirect')}</span>
              </a>
            </div>

            <p className="text-[11px] text-[#5D685B] text-center">
              {t('common.disclaimerNotEcommerce')}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="text-xl sm:text-2xl font-black text-agro-dark font-marathi">
            {currentLang === 'mr' ? 'याच प्रवर्गातील इतर उत्पादने' : 'Other Products in this Category'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
