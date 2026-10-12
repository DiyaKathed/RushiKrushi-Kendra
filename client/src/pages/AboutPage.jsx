import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Award,
  HeartHandshake,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  Sprout,
  Users
} from 'lucide-react';

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] text-xs font-bold uppercase tracking-wider">
          <Sprout className="w-3.5 h-3.5" />
          <span>{t('common.tagline')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#245C2A] font-marathi">
          {t('about.title')}
        </h1>
        <p className="text-base text-[#5D685B] leading-relaxed">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Proprietor Section */}
      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 relative">
          <div className="rounded-xl overflow-hidden aspect-4/3 border border-[#D7E1D1] shadow-sm bg-[#FAF8F0]">
            <img
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80"
              alt="Mahadeo Savleram Dhobale, Proprietor"
              className="w-full h-full object-cover object-top"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder-agro.svg';
              }}
            />
          </div>
          <div className="mt-3 text-center sm:text-left">
            <h3 className="text-lg font-bold text-[#263328] font-marathi">
              {t('about.proprietorName')}
            </h3>
            <p className="text-xs font-bold text-[#245C2A] uppercase tracking-wide">
              {t('about.proprietorTitle')}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold text-[#245C2A] bg-[#EAF2E3] px-2.5 py-1 rounded-md border border-[#D7E1D1] uppercase tracking-wider">
            {t('about.proprietorHeading')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#245C2A] font-marathi">
            {currentLang === 'mr'
              ? 'शेतकऱ्यांना योग्य माहिती देऊन समृद्ध बनवणे हेच आमचे ध्येय'
              : 'Empowering Farmers Through Honest Knowledge and Genuine Inputs'}
          </h2>
          <p className="text-[#5D685B] leading-relaxed text-sm sm:text-base">
            {t('about.proprietorMessage')}
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#263328]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#438A35] shrink-0" />
              <span>{currentLang === 'mr' ? 'शासकीय परवानाधारक कृषी केंद्र' : 'Licensed Agricultural Retailer'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#438A35] shrink-0" />
              <span>{currentLang === 'mr' ? 'स्थानिक हवामानानुसार पीक सल्ला' : 'Custom Regional Agronomy'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#438A35] shrink-0" />
              <span>{currentLang === 'mr' ? '१००% अस्सल बियाणे व खते' : 'Genuine Seed & Fertilizer Stock'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#438A35] shrink-0" />
              <span>{currentLang === 'mr' ? 'थेट फोन व व्हॉट्सॲप संवाद' : 'Direct Call & WhatsApp Advisory'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Values */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#245C2A] font-marathi">
            {t('about.valuesHeading')}
          </h2>
          <p className="text-sm text-[#5D685B] mt-2">
            {t('common.brandValues')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#263328] font-marathi">
              {t('about.qualityTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-[#5D685B] leading-relaxed">
              {t('about.qualityDesc')}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#FAF8F0] text-[#80552F] border border-[#D7E1D1] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#263328] font-marathi">
              {t('about.trustTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-[#5D685B] leading-relaxed">
              {t('about.trustDesc')}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#263328] font-marathi">
              {t('about.serviceTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-[#5D685B] leading-relaxed">
              {t('about.serviceDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Store Location and Visit Details */}
      <div className="bg-[#FAF8F0] rounded-xl border border-[#D7E1D1] p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl font-extrabold text-[#245C2A] font-marathi">
            {t('about.locationHeading')}
          </h2>
          <p className="text-sm text-[#5D685B] leading-relaxed">
            {t('about.locationDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm">
          <div className="bg-white p-4 rounded-xl border border-[#D7E1D1] flex items-start gap-3 shadow-xs">
            <MapPin className="w-5 h-5 text-[#245C2A] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#263328]">{t('contact.addressTitle')}</p>
              <p className="text-xs text-[#5D685B] mt-0.5">{t('common.address')}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#D7E1D1] flex items-start gap-3 shadow-xs">
            <Clock className="w-5 h-5 text-[#80552F] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#263328]">{t('contact.hoursTitle')}</p>
              <p className="text-xs text-[#5D685B] mt-0.5">
                Sunday - Friday: 9:00 AM - 6:00 PM
              </p>
              <p className="text-xs font-bold text-rose-700 mt-0.5">Saturday: Closed</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#D7E1D1] flex items-start gap-3 shadow-xs">
            <Phone className="w-5 h-5 text-[#245C2A] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#263328]">{t('contact.phoneTitle')}</p>
              <p className="text-xs text-[#245C2A] font-bold mt-0.5">+91 9890360271</p>
              <p className="text-xs text-[#5D685B]">{t('common.email')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
