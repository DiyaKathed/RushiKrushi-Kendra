import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, CheckCircle2, AlertCircle, Eye, Tag } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const productName = currentLang === 'mr' ? product.nameMr || product.nameEn : product.nameEn;
  const description = currentLang === 'mr' ? product.descriptionMr || product.descriptionEn : product.descriptionEn;

  const isAvailable = product.availability === 'in_stock';

  // WhatsApp enquiry message formatting as required by Part 8
  const whatsappText = currentLang === 'mr'
    ? `नमस्कार, मला ${productName} (${product.brand}) या उत्पादनाविषयी माहिती हवी आहे. हे उत्पादन ऋषी कृषी सेवा केंद्र, पारगाव येथे सध्या उपलब्ध आहे का?`
    : `Namaskar, I would like to enquire about ${product.nameEn} (${product.brand}). Is it available at Rushi Krushi Seva Kendra?`;

  const whatsappUrl = `https://wa.me/919890360271?text=${encodeURIComponent(whatsappText)}`;

  // Default fallback image if product image is empty
  const imageSource = product.imageUrl || '/placeholder-agro.svg';

  return (
    <div className="bg-white rounded-md border border-[#D7E1D1] shadow-card hover:border-[#438A35] hover:shadow-card-hover transition-all duration-200 flex flex-col h-full overflow-hidden group">
      {/* Product Image Box - Contained to display full packaging/bottles/sacks */}
      <div className="relative aspect-4/3 w-full bg-white border-b border-[#D7E1D1] p-3 flex items-center justify-center overflow-hidden">
        <img
          src={imageSource}
          alt={productName}
          loading="lazy"
          className="max-h-full max-w-full object-contain object-center product-card-image transition-transform duration-200 group-hover:scale-102"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/placeholder-agro.svg';
          }}
        />

        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
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
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-bold bg-[#FAF8F0] text-[#245C2A] border border-[#D7E1D1] shadow-xs">
            <Tag className="w-3 h-3 text-[#438A35]" />
            <span>{product.category}</span>
          </span>
        </div>
      </div>

      {/* Product Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[11px] font-bold text-[#5D685B] uppercase tracking-wider mb-1">
            {product.brand}
          </div>

          <h3 className="text-base font-bold text-[#263328] group-hover:text-[#245C2A] transition line-clamp-2 leading-snug">
            <Link to={`/products/${product.slug || product._id}`}>
              {productName}
            </Link>
          </h3>

          {product.technicalComposition && (
            <p className="text-xs text-[#5D685B] mt-1 line-clamp-1 italic">
              {product.technicalComposition}
            </p>
          )}

          {description && (
            <p className="text-xs text-[#5D685B] mt-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Pack sizes if available */}
          {product.packSizes && product.packSizes.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-[#5D685B]">
                {t('common.packSizes')}:
              </span>
              {product.packSizes.slice(0, 3).map((pack, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold bg-[#FAF8F0] text-[#263328] px-1.5 py-0.5 rounded-sm border border-[#D7E1D1]"
                >
                  {pack}
                </span>
              ))}
              {product.packSizes.length > 3 && (
                <span className="text-[11px] text-[#5D685B]">+{product.packSizes.length - 3}</span>
              )}
            </div>
          )}

          {/* Indicative Price */}
          {product.indicativePrice && (
            <div className="mt-2 text-xs text-[#263328]">
              <span className="text-[#5D685B]">{t('common.indicativePrice')}: </span>
              <span className="font-bold text-[#245C2A]">{product.indicativePrice}</span>
            </div>
          )}
        </div>

        {/* Action Buttons - Always aligned at bottom of card */}
        <div className="pt-3 border-t border-[#D7E1D1] flex items-center gap-2">
          <Link
            to={`/products/${product.slug || product._id}`}
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
