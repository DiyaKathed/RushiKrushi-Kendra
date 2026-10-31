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
  Sprout
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

  const nameEn = product.nameEn || product.name_en || product.name || '';
  const nameMr = product.nameMr || product.name_mr || '';
  const productName = currentLang === 'mr' ? (nameMr || nameEn) : (nameEn || nameMr);

  const descriptionEn = product.descriptionEn || product.description_en || product.description || '';
  const descriptionMr = product.descriptionMr || product.description_mr || '';
  const description = currentLang === 'mr' ? (descriptionMr || descriptionEn) : (descriptionEn || descriptionMr);

  const safetyPrecautionsEn = product.safetyPrecautionsEn || product.safety_precautions_en || '';
  const safetyPrecautionsMr = product.safetyPrecautionsMr || product.safety_precautions_mr || '';
  const safetyPrecautions = currentLang === 'mr' ? (safetyPrecautionsMr || safetyPrecautionsEn) : (safetyPrecautionsEn || safetyPrecautionsMr);

  const brand = product.brand || '';
  const category = product.category || 'General';
  const indicativePrice = product.indicativePrice || product.indicative_price || product.price || '';

  const packSizes = Array.isArray(product.packSizes)
    ? product.packSizes
    : (Array.isArray(product.pack_sizes) ? product.pack_sizes : []);

  const applicableCrops = Array.isArray(product.applicableCrops)
    ? product.applicableCrops
    : (Array.isArray(product.applicable_crops) ? product.applicable_crops : []);

  const isAvailable = product.availability === 'in_stock' || product.is_available === true;

  // Pre-filled WhatsApp message as specified in Part 8
  const whatsappText = currentLang === 'mr'
    ? `नमस्कार, मला ${productName}${brand ? ` (${brand})` : ''} या उत्पादनाविषयी चौकशी करायची आहे. हे उत्पादन ऋषी कृषी सेवा केंद्र, पारगाव येथे उपलब्ध आहे का?`
    : `Namaskar, I would like to enquire about ${nameEn || productName}${brand ? ` (${brand})` : ''}. Is it available at Rushi Krushi Seva Kendra?`;

  const whatsappUrl = `https://wa.me/919890360271?text=${encodeURIComponent(whatsappText)}`;

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
          <div className="aspect-square rounded-md overflow-hidden bg-white border border-[#D7E1D1] relative p-6 flex items-center justify-center">
            <img
              src={imageSource}
              alt={productName}
              className="max-h-full max-w-full object-contain object-center product-card-image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder-agro.svg';
              }}
            />

            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-bold bg-[#FAF8F0] text-[#245C2A] border border-[#D7E1D1] shadow-xs">
                <Tag className="w-3.5 h-3.5 text-[#438A35]" />
                <span>{category}</span>
              </span>
            </div>
          </div>

          {/* Physical Store In-Stock Status */}
          <div className="p-3 rounded-md bg-[#FAF8F0] border border-[#D7E1D1] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5D685B]">{t('common.status')}:</span>
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
          </div>
        </div>

        {/* Right: Product Details & Enquiry Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              {brand && (
                <span className="text-xs font-bold text-[#5D685B] uppercase tracking-wider">
                  {brand}
                </span>
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

            {/* Pack sizes */}
            {packSizes.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-bold text-[#263328] uppercase tracking-wide">
                  {t('common.packSizes')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {packSizes.map((pack, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-sm text-xs font-semibold bg-[#FAF8F0] border border-[#D7E1D1] text-[#263328]"
                    >
                      {pack}
                    </span>
                  ))}
                </div>
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
                      <Sprout className="w-3 h-3 text-[#438A35]" />
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

            {/* Indicative Price */}
            {indicativePrice && (
              <div className="p-3 rounded-md bg-[#FAF8F0] border border-[#D7E1D1] text-xs sm:text-sm text-[#263328]">
                <span className="font-medium text-[#5D685B]">{t('common.indicativePrice')}: </span>
                <span className="font-black text-[#245C2A] text-base">{indicativePrice}</span>
                <span className="block text-[11px] text-[#5D685B] mt-0.5">
                  (Subject to batch and official government subsidy norms where applicable)
                </span>
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
