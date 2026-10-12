import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

const CropCard = ({ crop }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const cropName = currentLang === 'mr' ? crop.nameMr || crop.nameEn : crop.nameEn;
  const intro = currentLang === 'mr' ? crop.introMr || crop.introEn : crop.introEn;

  const imageSource = crop.imageUrl || '/placeholder-agro.svg';

  const categoryColor = {
    Field: 'bg-[#FAF8F0] text-[#80552F] border-[#D7E1D1]',
    Vegetable: 'bg-[#EAF2E3] text-[#245C2A] border-[#B8D5B0]',
    Fruit: 'bg-[#FFF5F5] text-[#991B1B] border-[#FECACA]',
  }[crop.category] || 'bg-[#FAF8F0] text-[#263328] border-[#D7E1D1]';

  return (
    <div className="bg-white rounded-md border border-[#D7E1D1] shadow-card hover:border-[#438A35] hover:shadow-card-hover transition-all duration-200 flex flex-col h-full overflow-hidden group">
      {/* Crop Image */}
      <div className="relative aspect-16/10 w-full bg-[#FAF8F0] border-b border-[#D7E1D1] overflow-hidden">
        <img
          src={imageSource}
          alt={cropName}
          loading="lazy"
          className="w-full h-full object-cover object-center crop-card-image group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/placeholder-agro.svg';
          }}
        />

        {/* Category Tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`px-2 py-0.5 rounded-sm text-[11px] font-bold border shadow-xs ${categoryColor}`}>
            {crop.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-[#263328] group-hover:text-[#245C2A] transition font-marathi">
              <Link to={`/farming-guide/crops/${crop.slug || crop._id}`}>
                {cropName}
              </Link>
            </h3>
            <span className="text-xs text-[#5D685B] font-medium">
              {currentLang === 'mr' ? crop.nameEn : crop.nameMr}
            </span>
          </div>

          {crop.seasons && crop.seasons.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#438A35] font-semibold mt-1 mb-2">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-[#79A83B]" />
              <span className="line-clamp-1">{crop.seasons.join(', ')}</span>
            </div>
          )}

          {intro && (
            <p className="text-xs text-[#5D685B] line-clamp-3 leading-relaxed mt-1">
              {intro}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[#D7E1D1]">
          <Link
            to={`/farming-guide/crops/${crop.slug || crop._id}`}
            className="w-full inline-flex items-center justify-between py-2 px-3 rounded-md text-xs font-bold text-[#245C2A] bg-[#FAF8F0] hover:bg-[#EAF2E3] border border-[#D7E1D1] transition"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#438A35]" />
              <span>{t('common.readMore')}</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CropCard;
