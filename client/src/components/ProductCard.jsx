import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, CheckCircle2, AlertCircle, Eye, Tag, Building2, Sprout } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  if (!product) return null;

  // Bilingual name mapping with fallbacks
  const nameEn = (product.nameEn || product.name_en || product.name || '').trim();
  const nameMr = (product.nameMr || product.name_mr || '').trim();
  const productName = currentLang === 'mr' ? (nameMr || nameEn) : (nameEn || nameMr);

  // Bilingual description mapping with fallbacks
  const descriptionEn = product.descriptionEn || product.description_en || product.description || '';
  const descriptionMr = product.descriptionMr || product.description_mr || '';
  const description = currentLang === 'mr' ? (descriptionMr || descriptionEn) : (descriptionEn || descriptionMr);

  // Availability & categorization
  const isAvailable = product.availability === 'in_stock' || product.is_available === true;
  const brand = (product.brand || product.company || '').trim();
  const category = product.category || 'General';
  const technicalComposition = product.technicalComposition || product.technical_composition || '';

  // Pack sizes normalization (handles array, single string, or comma-separated values, deduplicated)
  const rawPacks = product.packSizes || product.pack_sizes || product.packSize || product.pack_size;
  const packSizes = Array.from(new Set(Array.isArray(rawPacks)
    ? rawPacks.map(s => String(s).trim()).filter(Boolean)
    : (typeof rawPacks === 'string' && rawPacks.trim()
        ? rawPacks.split(',').map(s => s.trim()).filter(Boolean)
        : [])));

  // Stock quantity: display only when meaningful and available
  const rawStock = product.stockQuantity !== undefined ? product.stockQuantity : product.stock_quantity;
  const hasMeaningfulStock = rawStock !== undefined && rawStock !== null && rawStock !== '' && !isNaN(Number(rawStock)) && Number(rawStock) > 0;
  const stockQuantity = hasMeaningfulStock ? Number(rawStock) : null;

  // Price normalization: check numeric price first, then indicativePrice. Never invent or show ₹0.
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

  // WhatsApp enquiry message formatting
  const whatsappText = currentLang === 'mr'
    ? `नमस्कार, मला ${productName}${brand ? ` (${brand})` : ''} या उत्पादनाविषयी माहिती हवी आहे. हे उत्पादन ऋषी कृषी सेवा केंद्र, पारगाव येथे सध्या उपलब्ध आहे का?`
    : `Namaskar, I would like to enquire about ${nameEn || productName}${brand ? ` (${brand})` : ''}. Is it available at Rushi Krushi Seva Kendra?`;

  const whatsappUrl = `https://wa.me/919890360271?text=${encodeURIComponent(whatsappText)}`;

  // Check for real product image URL
  const hasRealImage = Boolean(
    (product.imageUrl && product.imageUrl.trim() !== '' && product.imageUrl !== '/placeholder-agro.svg') ||
    (product.image_url && product.image_url.trim() !== '') ||
    (product.image && product.image.trim() !== '') ||
    (Array.isArray(product.images) && product.images[0])
  );
  const imageSource = product.imageUrl || product.image_url || product.image || (Array.isArray(product.images) && product.images[0]) || '/placeholder-agro.svg';

  const altText = currentLang === 'mr'
    ? `${productName}${brand ? ` - ${brand}` : ''} अधिकृत पॅकेजिंग`
    : `${productName}${brand ? ` - ${brand}` : ''} official packaging`;

  return (
    <div className="bg-white rounded-md border border-[#D7E1D1] shadow-card hover:border-[#438A35] hover:shadow-card-hover transition-all duration-200 flex flex-col h-full overflow-hidden group">
      {/* Product Image Box - Contained to display full packaging/bottles/sacks */}
      <div className="relative aspect-4/3 w-full bg-[#FAF8F0]/40 border-b border-[#D7E1D1] p-3 flex items-center justify-center overflow-hidden">
        {hasRealImage ? (
          <img
            src={imageSource}
            alt={altText}
            loading="lazy"
            className="max-h-full max-w-full object-contain object-center product-card-image transition-transform duration-200 group-hover:scale-102"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/placeholder-agro.svg';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 bg-gradient-to-b from-[#FAF8F0] to-[#EAF2E3]/50 select-none">
            <div className="w-11 h-11 rounded-full bg-white border border-[#D7E1D1] flex items-center justify-center shadow-xs mb-1.5 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-5 h-5 text-[#438A35]" />
            </div>
            <span className="text-xs font-bold text-[#245C2A] uppercase tracking-wider line-clamp-1">
              {brand || 'Rushi Krushi'}
            </span>
            {packSizes.length > 0 && (
              <span className="text-[11px] font-semibold text-[#5D685B] mt-0.5">
                {packSizes[0]}
              </span>
            )}
            <span className="text-[10px] text-[#5D685B]/70 mt-1">
              {currentLang === 'mr' ? 'छायाचित्र लवकरच' : 'Image coming soon'}
            </span>
          </div>
        )}

        {/* Availability & Stock Badge */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold bg-[#EAF2E3] text-[#245C2A] border border-[#B8D5B0] shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-[#245C2A]" />
              <span>{t('common.inStock')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold bg-[#F4F8F2] text-[#5D685B] border border-[#D7E1D1]">
              <AlertCircle className="w-3 h-3 text-[#5D685B]" />
              <span>{t('common.outOfStock')}</span>
            </span>
          )}

          {hasMeaningfulStock && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-white text-[#245C2A] border border-[#D7E1D1] shadow-xs">
              {currentLang === 'mr' ? `साठा: ${stockQuantity} नग` : `Stock: ${stockQuantity}`}
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-bold bg-[#FAF8F0] text-[#245C2A] border border-[#D7E1D1] shadow-xs">
            <Tag className="w-3 h-3 text-[#438A35]" />
            <span>{category}</span>
          </span>
        </div>
      </div>

      {/* Product Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Company / Brand Badge */}
          {brand && (
            <div className="mb-1.5 flex items-center">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#245C2A] bg-[#EAF2E3] px-2 py-0.5 rounded-sm border border-[#B8D5B0] tracking-wide truncate max-w-full">
                <Building2 className="w-3 h-3 text-[#438A35] shrink-0" />
                <span className="truncate">{brand}</span>
              </span>
            </div>
          )}

          <h3 className="text-base font-bold text-[#263328] group-hover:text-[#245C2A] transition line-clamp-2 leading-snug">
            <Link to={`/products/${product.slug || product._id || product.id}`}>
              {productName}
            </Link>
          </h3>

          {technicalComposition && (
            <p className="text-xs text-[#5D685B] mt-1 line-clamp-1 italic">
              {technicalComposition}
            </p>
          )}

          {description && (
            <p className="text-xs text-[#5D685B] mt-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Pack sizes if available */}
          {packSizes.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-[#5D685B]">
                {t('common.packSizes')}:
              </span>
              {packSizes.slice(0, 3).map((pack, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold bg-[#FAF8F0] text-[#263328] px-1.5 py-0.5 rounded-sm border border-[#D7E1D1]"
                >
                  {pack}
                </span>
              ))}
              {packSizes.length > 3 && (
                <span className="text-[11px] text-[#5D685B]">+{packSizes.length - 3}</span>
              )}
            </div>
          )}

          {/* Price display with dated reference badge support */}
          {formattedPrice && (
            <div className="mt-2 text-xs flex flex-col gap-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[#5D685B] font-medium">
                  {product.priceListDate
                    ? (currentLang === 'mr' ? 'संदर्भ MRP:' : 'Ref. MRP:')
                    : `${t('common.indicativePrice')}:`}
                </span>
                <span className="font-bold text-[#245C2A] text-sm">{formattedPrice}</span>
              </div>
              {product.priceListDate && (
                <span className="text-[10px] text-[#5D685B]/80 italic">
                  {currentLang === 'mr' ? `(दि. ${product.priceListDate} सूचीनुसार)` : `(Ref: ${product.priceListDate} list)`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Always aligned at bottom of card */}
        <div className="pt-3 border-t border-[#D7E1D1] flex items-center gap-2">
          <Link
            to={`/products/${product.slug || product._id || product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold text-[#263328] bg-[#FAF8F0] hover:bg-[#EAF2E3] border border-[#D7E1D1] transition"
          >
            <Eye className="w-3.5 h-3.5 text-[#5D685B]" />
            <span>{t('common.learnMore')}</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold text-white bg-[#245C2A] hover:bg-[#1C4920] shadow-xs transition"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-[#F2C94C] text-[#245C2A]" />
            <span>{t('common.askProduct')}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
