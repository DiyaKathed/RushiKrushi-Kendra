import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  CloudSun,
  Layers,
  Sprout,
  Droplets,
  Bug,
  AlertTriangle,
  Scissors,
  CheckCircle2,
  HelpCircle,
  ShoppingBag,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck2
} from 'lucide-react';
import { getCrop } from '../services/api';
import ProductCard from '../components/ProductCard';

const CropDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [crop, setCrop] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchCropGuide = async () => {
      setLoading(true);
      try {
        const res = await getCrop(slug);
        if (res.data.success) {
          setCrop(res.data.crop);
          setRelatedProducts(res.data.relatedProducts || []);
        }
      } catch (err) {
        console.error('Error fetching crop details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCropGuide();
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

  if (!crop) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-stone-800">Crop guide not found</h2>
        <p className="text-sm text-stone-500">The crop guide you are looking for is currently being reviewed or has moved.</p>
        <Link
          to="/farming-guide"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-agro-dark text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')} to Guides</span>
        </Link>
      </div>
    );
  }

  const cropName = currentLang === 'mr' ? crop.nameMr || crop.nameEn : crop.nameEn;
  const intro = currentLang === 'mr' ? crop.introMr || crop.introEn : crop.introEn;
  const climate = currentLang === 'mr' ? crop.climateMr || crop.climateEn : crop.climateEn;
  const soil = currentLang === 'mr' ? crop.soilMr || crop.soilEn : crop.soilEn;
  const sowingSeason = currentLang === 'mr' ? crop.sowingSeasonMr || crop.sowingSeasonEn : crop.sowingSeasonEn;
  const landPrep = currentLang === 'mr' ? crop.landPreparationMr || crop.landPreparationEn : crop.landPreparationEn;
  const seedSelection = currentLang === 'mr' ? crop.seedSelectionMr || crop.seedSelectionEn : crop.seedSelectionEn;
  const seedTreatment = currentLang === 'mr' ? crop.seedTreatmentMr || crop.seedTreatmentEn : crop.seedTreatmentEn;
  const sowingMethod = currentLang === 'mr' ? crop.sowingMethodMr || crop.sowingMethodEn : crop.sowingMethodEn;
  const irrigation = currentLang === 'mr' ? crop.irrigationMr || crop.irrigationEn : crop.irrigationEn;
  const weedMgmt = currentLang === 'mr' ? crop.weedManagementMr || crop.weedManagementEn : crop.weedManagementEn;
  const harvesting = currentLang === 'mr' ? crop.harvestingMr || crop.harvestingEn : crop.harvestingEn;
  const postHarvest = currentLang === 'mr' ? crop.postHarvestMr || crop.postHarvestEn : crop.postHarvestEn;
  const commonMistakes = currentLang === 'mr'
    ? (crop.commonMistakesMr && crop.commonMistakesMr.length > 0 ? crop.commonMistakesMr : crop.commonMistakesEn)
    : crop.commonMistakesEn;

  const imageSource = crop.imageUrl || '/placeholder-agro.svg';

  const whatsappInquiry = `https://wa.me/919890360271?text=${encodeURIComponent(
    currentLang === 'mr'
      ? `नमस्कार, मला ${cropName} पिकाच्या खत व कीड व्यवस्थापनाविषयी सल्ला हवा आहे.`
      : `Namaskar, I would like agronomic guidance regarding ${crop.nameEn} management.`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Link */}
      <div>
        <Link
          to="/farming-guide"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5D685B] hover:text-[#245C2A] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')} to Farming Guide</span>
        </Link>
      </div>

      {/* Hero Header Box */}
      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1]">
              {crop.category} Crop
            </span>
            {crop.seasons && crop.seasons.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F0] text-[#263328] border border-[#D7E1D1]">
                <Calendar className="w-3.5 h-3.5 text-[#245C2A]" />
                <span>{crop.seasons.join(', ')}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#245C2A] font-marathi">
            {cropName} {currentLang === 'mr' && `(${crop.nameEn})`}
          </h1>

          {intro && (
            <p className="text-sm sm:text-base text-[#5D685B] leading-relaxed">
              {intro}
            </p>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={whatsappInquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#245C2A] hover:bg-[#438A35] text-white font-bold text-xs sm:text-sm shadow-xs transition"
            >
              <MessageCircle className="w-4 h-4 text-[#F2C94C]" />
              <span>{currentLang === 'mr' ? 'या पिकाविषयी सल्ला विचारा' : 'Consult Store on WhatsApp'}</span>
            </a>
            <span className="text-xs text-[#5D685B] font-medium italic">
              Verified: {crop.sources || 'MPKV Rahuri & ICAR'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 aspect-16/10 rounded-xl overflow-hidden border border-[#D7E1D1] shadow-sm bg-[#FAF8F0]">
          <img
            src={imageSource}
            alt={cropName}
            className="crop-card-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/placeholder-agro.svg';
            }}
          />
        </div>
      </div>

      {/* Guide Layout: Sidebar Table of Contents + Main 28-Point Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table of Contents - Sticky on Desktop */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#D7E1D1] shadow-card p-5 space-y-3 lg:sticky lg:top-24">
          <h3 className="text-xs font-bold text-[#245C2A] uppercase tracking-wider border-b border-[#D7E1D1] pb-2">
            {t('farmingGuide.tocTitle')}
          </h3>
          <nav className="space-y-1 text-xs text-[#263328] max-h-[70vh] overflow-y-auto pr-1">
            <a href="#climate" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.climate')}
            </a>
            <a href="#soil" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.soil')}
            </a>
            <a href="#season" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.season')}
            </a>
            <a href="#seed" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.seedTreatment')}
            </a>
            <a href="#sowing" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.sowing')}
            </a>
            <a href="#irrigation" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.irrigation')}
            </a>
            <a href="#nutrient" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] text-[#245C2A] font-bold transition">
              {t('farmingGuide.sections.nutrient')}
            </a>
            <a href="#stages" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.stages')}
            </a>
            <a href="#pests" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.pests')}
            </a>
            <a href="#diseases" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.diseases')}
            </a>
            <a href="#weeds" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.weeds')}
            </a>
            <a href="#harvesting" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.harvesting')}
            </a>
            <a href="#mistakes" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.mistakes')}
            </a>
            <a href="#faqs" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.faqs')}
            </a>
            <a href="#products" className="block py-1.5 px-2 rounded hover:bg-[#EAF2E3] hover:text-[#245C2A] transition">
              {t('farmingGuide.sections.relatedProducts')}
            </a>
          </nav>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section: Climate & Soil */}
          <div id="climate" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-[#F2C94C]" />
              <span>{t('farmingGuide.sections.climate')}</span>
            </h2>
            <div className="text-sm text-[#263328] leading-relaxed space-y-2">
              <p>{climate}</p>
              {crop.temperatureRange && (
                <p className="font-semibold text-[#263328]">
                  {currentLang === 'mr' ? 'अनुकूल तापमान: ' : 'Optimal Temperatures: '}
                  <span className="text-[#245C2A]">{crop.temperatureRange}</span>
                </p>
              )}
            </div>
          </div>

          <div id="soil" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#80552F]" />
              <span>{t('farmingGuide.sections.soil')}</span>
            </h2>
            <div className="text-sm text-stone-700 leading-relaxed space-y-2">
              <p>{soil}</p>
              {landPrep && (
                <div className="pt-2">
                  <span className="font-bold text-stone-900 block mb-1">
                    {currentLang === 'mr' ? 'पूर्वमशागत:' : 'Land Preparation:'}
                  </span>
                  <p>{landPrep}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Sowing & Seed Treatment */}
          <div id="seed" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#438A35]" />
              <span>{t('farmingGuide.sections.seedTreatment')}</span>
            </h2>
            <div className="text-sm text-[#263328] leading-relaxed space-y-3">
              {seedSelection && (
                <div>
                  <span className="font-bold text-[#263328] block mb-1">
                    {currentLang === 'mr' ? 'शिफारस केलेले वाण:' : 'Recommended Varieties:'}
                  </span>
                  <p className="text-[#5D685B]">{seedSelection}</p>
                </div>
              )}
              {seedTreatment && (
                <div className="p-3.5 rounded-lg bg-[#EAF2E3] border border-[#D7E1D1] text-[#263328]">
                  <span className="font-bold text-[#245C2A] block mb-1">
                    {currentLang === 'mr' ? 'बीजप्रक्रिया (Seed Treatment):' : 'Seed Treatment Protocol:'}
                  </span>
                  <p className="leading-relaxed">{seedTreatment}</p>
                </div>
              )}
            </div>
          </div>

          <div id="sowing" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#245C2A]" />
              <span>{t('farmingGuide.sections.sowing')}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              {crop.seedRate && (
                <div className="p-3 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1]">
                  <span className="font-bold text-[#263328] block mb-0.5">
                    {currentLang === 'mr' ? 'बियाणे प्रमाण:' : 'Seed Rate:'}
                  </span>
                  <span className="text-[#5D685B]">{crop.seedRate}</span>
                </div>
              )}
              {crop.spacing && (
                <div className="p-3 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1]">
                  <span className="font-bold text-[#263328] block mb-0.5">
                    {currentLang === 'mr' ? 'लागवड अंतर:' : 'Spacing:'}
                  </span>
                  <span className="text-[#5D685B]">{crop.spacing}</span>
                </div>
              )}
            </div>
            {sowingMethod && (
              <p className="text-sm text-[#5D685B] leading-relaxed mt-2">{sowingMethod}</p>
            )}
          </div>

          {/* Section: Irrigation */}
          <div id="irrigation" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span>{t('farmingGuide.sections.irrigation')}</span>
            </h2>
            <p className="text-sm text-[#263328] leading-relaxed">{irrigation}</p>
          </div>

          {/* Section: Fertilizer Schedule & Nutrient Management */}
          <div id="nutrient" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#438A35]" />
                <span>{t('farmingGuide.sections.nutrient')}</span>
              </h2>
              <span className="text-[11px] font-bold text-[#245C2A] bg-[#EAF2E3] px-2.5 py-0.5 rounded border border-[#D7E1D1]">
                Balanced NPK
              </span>
            </div>

            {crop.fertilizerSchedule && crop.fertilizerSchedule.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-[#D7E1D1]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#245C2A] text-white">
                      <th className="p-3 font-bold">{currentLang === 'mr' ? 'वाढीचा टप्पा' : 'Growth Stage'}</th>
                      <th className="p-3 font-bold">{currentLang === 'mr' ? 'शिफारस खते व प्रमाण' : 'Fertilizer Recommendation'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E1D1] bg-white">
                    {crop.fertilizerSchedule.map((sched, idx) => (
                      <tr key={idx} className="hover:bg-[#EAF2E3]/40 transition">
                        <td className="p-3 font-bold text-[#263328] align-top whitespace-nowrap">
                          {sched.stage}
                        </td>
                        <td className="p-3 text-[#263328] leading-relaxed">
                          <p>{currentLang === 'mr' ? sched.notesMr || sched.notesEn : sched.notesEn}</p>
                          {sched.organic && (
                            <p className="text-xs font-semibold text-[#438A35] mt-1">
                              {sched.organic}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[#5D685B]">Standard balanced fertilization recommended.</p>
            )}

            <div className="text-xs text-[#5D685B] italic pt-2">
              {currentLang === 'mr'
                ? '* खताची मात्रा जमिनीच्या माती परीक्षणानुसार कमी-जास्त करणे हितावह ठरते.'
                : '* Calibrate final doses as per soil test health card.'}
            </div>
          </div>

          {/* Section: Growth Stages Timeline */}
          {crop.growthStages && crop.growthStages.length > 0 && (
            <div id="stages" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#80552F]" />
                <span>{t('farmingGuide.sections.stages')}</span>
              </h2>

              <div className="space-y-3">
                {crop.growthStages.map((stage, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] text-xs sm:text-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-[#263328] text-sm">
                        {currentLang === 'mr' ? stage.nameMr || stage.nameEn : stage.nameEn}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-[#EAF2E3] text-[#245C2A] font-bold text-xs border border-[#D7E1D1]">
                        {stage.durationDays}
                      </span>
                    </div>
                    <p className="text-[#5D685B]">
                      {currentLang === 'mr' ? stage.activitiesMr || stage.activitiesEn : stage.activitiesEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Pests and IPM */}
          {crop.pests && crop.pests.length > 0 && (
            <div id="pests" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
                <Bug className="w-5 h-5 text-rose-600" />
                <span>{t('farmingGuide.sections.pests')}</span>
              </h2>

              <div className="space-y-4">
                {crop.pests.map((pest, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 text-xs sm:text-sm space-y-2">
                    <span className="font-bold text-rose-950 text-sm sm:text-base block">
                      {currentLang === 'mr' ? pest.nameMr || pest.nameEn : pest.nameEn}
                    </span>
                    <p className="text-[#263328]">
                      <strong className="text-[#263328]">{currentLang === 'mr' ? 'लक्षणे: ' : 'Symptoms: '}</strong>
                      {currentLang === 'mr' ? pest.symptomsMr || pest.symptomsEn : pest.symptomsEn}
                    </p>
                    <div className="p-2.5 rounded bg-white border border-rose-200 text-[#245C2A] font-medium">
                      <strong>{currentLang === 'mr' ? 'नियंत्रण उपाय: ' : 'Management: '}</strong>
                      {currentLang === 'mr' ? pest.managementMr || pest.managementEn : pest.managementEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Diseases */}
          {crop.diseases && crop.diseases.length > 0 && (
            <div id="diseases" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>{t('farmingGuide.sections.diseases')}</span>
              </h2>

              <div className="space-y-4">
                {crop.diseases.map((dis, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs sm:text-sm space-y-2">
                    <span className="font-bold text-amber-950 text-sm sm:text-base block">
                      {currentLang === 'mr' ? dis.nameMr || dis.nameEn : dis.nameEn}
                    </span>
                    <p className="text-[#263328]">
                      <strong className="text-[#263328]">{currentLang === 'mr' ? 'लक्षणे: ' : 'Symptoms: '}</strong>
                      {currentLang === 'mr' ? dis.symptomsMr || dis.symptomsEn : dis.symptomsEn}
                    </p>
                    <div className="p-2.5 rounded bg-white border border-amber-200 text-[#245C2A] font-medium">
                      <strong>{currentLang === 'mr' ? 'उपाययोजना: ' : 'Management: '}</strong>
                      {currentLang === 'mr' ? dis.managementMr || dis.managementEn : dis.managementEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Weed Control & Harvesting */}
          <div id="weeds" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#245C2A]" />
              <span>{t('farmingGuide.sections.weeds')}</span>
            </h2>
            <p className="text-sm text-[#263328] leading-relaxed">{weedMgmt}</p>
          </div>

          <div id="harvesting" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#438A35]" />
              <span>{t('farmingGuide.sections.harvesting')}</span>
            </h2>
            <div className="text-sm text-[#263328] leading-relaxed space-y-3">
              <p>{harvesting}</p>
              {postHarvest && (
                <div className="p-3.5 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1]">
                  <span className="font-bold text-[#245C2A] block mb-1">
                    {currentLang === 'mr' ? 'काढणीपश्चात काळजी (Post-Harvest Care):' : 'Post-Harvest Protocol:'}
                  </span>
                  <p className="text-[#5D685B]">{postHarvest}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Common Mistakes to Avoid */}
          {commonMistakes && commonMistakes.length > 0 && (
            <div id="mistakes" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>{t('farmingGuide.sections.mistakes')}</span>
              </h2>
              <ul className="space-y-2 text-sm text-[#263328]">
                {commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section: FAQs */}
          {crop.faqs && crop.faqs.length > 0 && (
            <div id="faqs" className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#245C2A] font-marathi flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#F2C94C]" />
                <span>{t('farmingGuide.sections.faqs')}</span>
              </h2>

              <div className="space-y-3">
                {crop.faqs.map((faq, idx) => {
                  const q = currentLang === 'mr' ? faq.qMr || faq.qEn : faq.qEn;
                  const a = currentLang === 'mr' ? faq.aMr || faq.aEn : faq.aEn;
                  const isOpen = openFaq === idx;

                  return (
                    <div key={idx} className="border border-[#D7E1D1] rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full text-left p-3.5 font-bold text-[#263328] bg-[#FAF8F0] hover:bg-[#EAF2E3]/50 flex items-center justify-between gap-2 text-sm transition"
                      >
                        <span>{q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#245C2A]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-[#5D685B]" />}
                      </button>
                      {isOpen && (
                        <div className="p-3.5 text-xs sm:text-sm text-[#5D685B] bg-white border-t border-[#D7E1D1] leading-relaxed">
                          {a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Related Store Products */}
          <div id="products" className="pt-6 border-t border-[#D7E1D1] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#245C2A] font-marathi">
                  {t('farmingGuide.sections.relatedProducts')}
                </h2>
                <p className="text-xs sm:text-sm text-[#5D685B] mt-1">
                  {currentLang === 'mr'
                    ? 'या पिकासाठी ऋषी कृषी सेवा केंद्रामध्ये उपलब्ध असणारी दर्जेदार खते व औषधे.'
                    : 'Recommended certified inputs available at our Pargaon retail counter.'}
                </p>
              </div>
              <Link
                to="/products"
                className="text-xs sm:text-sm font-bold text-[#245C2A] hover:text-[#438A35]"
              >
                {t('common.viewAll')} →
              </Link>
            </div>

            {relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#FAF8F0] border border-[#D7E1D1] text-center text-xs text-[#5D685B]">
                Contact our shop for seasonal stock recommendations for this crop.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetailPage;
