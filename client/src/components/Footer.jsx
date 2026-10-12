import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Sprout,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Heart
} from 'lucide-react';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const whatsappMessage = currentLang === 'mr'
    ? 'नमस्कार, मला ऋषी कृषी सेवा केंद्रातील कृषी उत्पादनांविषयी व मार्गदर्शनाविषयी माहिती हवी आहे.'
    : 'Namaskar, I would like to enquire about agricultural products and farming advice at Rushi Krushi Seva Kendra.';

  const encodedWhatsApp = `https://wa.me/919890360271?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <footer className="bg-[#143618] text-[#EAF2E3] border-t-4 border-[#245C2A]">
      {/* Disclaimer Banner: Non E-Commerce Physical Store Notice */}
      <div className="bg-[#1C4920] border-b border-[#0C220E] py-3 px-4 text-xs sm:text-sm text-[#FAF8F0]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F2C94C] shrink-0 mt-0.5 sm:mt-0" />
            <p className="leading-relaxed">
              <span className="font-bold text-[#F2C94C]">
                {currentLang === 'mr' ? 'दुकान सूचना: ' : 'Store Notice: '}
              </span>
              {t('common.disclaimerNotEcommerce')}
            </p>
          </div>
          <a
            href={encodedWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#438A35] hover:bg-[#357529] text-white text-xs font-semibold shrink-0 transition shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t('common.whatsapp')}</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Store Brand & Proprietor */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-[#245C2A] border border-[#357529] flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-6 h-6 text-[#F2C94C]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-marathi">
                  {currentLang === 'mr' ? 'ऋषी कृषी सेवा केंद्र' : 'Rushi Krushi Seva Kendra'}
                </h3>
                <p className="text-xs text-[#F2C94C] font-semibold tracking-wide uppercase">
                  {t('common.tagline')}
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-300 leading-relaxed">
              {currentLang === 'mr'
                ? 'पारगाव व आंबेगाव परिसरातील शेतकऱ्यांचे हक्काचे कृषी सेवा केंद्र. दर्जेदार बियाणे, खते, औषधे आणि शास्त्रीय शेती सल्ला.'
                : 'Serving farmers across Pargaon, Shingave, and Ambegaon taluka with genuine agricultural inputs and honest agronomy advisory.'}
            </p>

            <div className="pt-2 text-xs text-stone-400 border-t border-agro-900">
              <p className="font-medium text-stone-200">
                {currentLang === 'mr' ? 'संचालक:' : 'Proprietor:'}{' '}
                <span className="text-emerald-400 font-bold">{t('common.proprietor')}</span>
              </p>
              <p className="mt-1 text-emerald-500 font-semibold">{t('common.brandValues')}</p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-agro-800 pb-2">
              {currentLang === 'mr' ? 'महत्त्वाचे दुवे' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>›</span> {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>›</span> {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>›</span> {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/farming-guide" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>›</span> {t('nav.farmingGuide')}
                </Link>
              </li>
              <li>
                <Link to="/inputs" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>›</span> {t('nav.fertilizerGuide')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>›</span> {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-stone-400 hover:text-amber-400 transition text-xs flex items-center gap-1.5 pt-2">
                  <span>›</span> {currentLang === 'mr' ? 'प्रशासक लॉगिन (Admin)' : 'Admin Portal Login'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Crop Guides */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-agro-800 pb-2">
              {currentLang === 'mr' ? 'प्रमुख पीक मार्गदर्शक' : 'Key Crop Guides'}
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link to="/farming-guide/crops/sugarcane" className="hover:text-emerald-400 transition">
                  • {currentLang === 'mr' ? 'ऊस लागवड व खत व्यवस्थापन' : 'Sugarcane Cultivation & Nutrition'}
                </Link>
              </li>
              <li>
                <Link to="/farming-guide/crops/onion" className="hover:text-emerald-400 transition">
                  • {currentLang === 'mr' ? 'कांदा लागवड व साठवणूक चाळ' : 'Onion Cultivation & Storage'}
                </Link>
              </li>
              <li>
                <Link to="/farming-guide/crops/soybean" className="hover:text-emerald-400 transition">
                  • {currentLang === 'mr' ? 'सोयाबीन पेरणी व कीड नियंत्रण' : 'Soybean Agronomy & IPM'}
                </Link>
              </li>
              <li>
                <Link to="/inputs" className="hover:text-emerald-400 transition">
                  • {currentLang === 'mr' ? 'नत्र-स्फुरद-पालाश (N-P-K) ज्ञानकोश' : 'NPK Fertilizer Guide & Soil Testing'}
                </Link>
              </li>
              <li>
                <Link to="/farming-guide" className="hover:text-emerald-400 transition text-emerald-400 text-xs font-semibold pt-1 block">
                  {currentLang === 'mr' ? 'सर्व पिकांची माहिती पाहा →' : 'View All Crops & Articles →'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Visit & Timings */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-agro-800 pb-2">
              {currentLang === 'mr' ? 'दुकानाचा पत्ता व संपर्क' : 'Store Location & Timings'}
            </h4>

            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <span>{t('common.address')}</span>
            </div>

            <div className="flex items-center gap-2.5 text-sm">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <a href="tel:+919890360271" className="hover:text-emerald-400 font-semibold text-white">
                +91 9890360271
              </a>
            </div>

            <div className="flex items-center gap-2.5 text-sm">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <a href="mailto:rushikrushi99@gmail.com" className="hover:text-emerald-400">
                rushikrushi99@gmail.com
              </a>
            </div>

            <div className="flex items-start gap-2.5 text-sm">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-stone-200">
                  {currentLang === 'mr' ? 'रविवार ते शुक्रवार' : 'Sunday to Friday'}:
                </p>
                <p className="text-xs text-stone-400">9:00 AM – 6:00 PM</p>
                <p className="text-xs font-bold text-rose-400 mt-0.5">
                  {currentLang === 'mr' ? 'शनिवार बंद (Saturday Closed)' : 'Saturday Closed'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Pargaon+Shingave+Ambegaon+Pune"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
              >
                <span>{t('common.directions')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="border-t border-agro-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>
            © {new Date().getFullYear()} Rushi Krushi Seva Kendra (ऋषी कृषी सेवा केंद्र).{' '}
            {currentLang === 'mr' ? 'सर्व हक्क राखीव.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>{currentLang === 'mr' ? 'महाराष्ट्रातील शेतकऱ्यांसाठी समर्पित' : 'Dedicated to Maharashtra farmers'}</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            </span>
            <Link to="/about" className="hover:text-stone-200 transition">
              {t('nav.about')}
            </Link>
            <Link to="/contact" className="hover:text-stone-200 transition">
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
