import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ShieldAlert,
  TestTube2,
  Droplets,
  Layers,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  BookOpen
} from 'lucide-react';

const INPUT_SECTIONS = [
  {
    id: 'npk',
    titleEn: 'Primary Macro-Nutrients (N-P-K)',
    titleMr: 'मुख्य अन्नद्रव्ये (नत्र-स्फुरद-पालाश / NPK)',
    icon: Sparkles,
    contentEn: {
      summary: 'Nitrogen (N), Phosphorus (P), and Potassium (K) are required in large quantities. Understanding their specific roles prevents unnecessary expenditure and avoids toxic imbalances.',
      details: [
        {
          label: 'Nitrogen (N) - नत्र',
          desc: 'Drives leaf vegetative canopy and lush green color. Excess creates weak succulent stems vulnerable to stem borers and sucking pests.'
        },
        {
          label: 'Phosphorus (P) - स्फुरद',
          desc: 'Fuels deep root establishment and energy transfer. Immobile in soil; must always be placed deep in the root zone as basal fertilizer.'
        },
        {
          label: 'Potassium (K) - पालाश',
          desc: 'Builds drought resistance, thickens rind/cell walls, and maximizes grain and fruit test weight and luster.'
        }
      ]
    },
    contentMr: {
      summary: 'नत्र, स्फुरद आणि पालाश ही पिकांची प्राथमिक अन्नद्रव्ये आहेत. यांचे संतुलित प्रमाण पिकाची निरोगी वाढ आणि भरघोस उत्पादनासाठी आवश्यक आहे.',
      details: [
        {
          label: 'नत्र (Nitrogen - N)',
          desc: 'पानांचा हिरवेपणा आणि शाकीय वाढ घडवून आणते. जास्त युरिया दिल्यास झाड लुसलुशीत होऊन किडींचा प्रादुर्भाव वाढतो.'
        },
        {
          label: 'स्फुरद (Phosphorus - P)',
          desc: 'मुळांची जोमदार वाढ आणि फुलोऱ्यासाठी गरजेचे. हे खत जमिनीत सरकत नाही, त्यामुळे पेरणीवेळी खोलवर देणे आवश्यक आहे.'
        },
        {
          label: 'पालाश (Potassium - K)',
          desc: 'रोगांशी लढण्याची ताकद, फळांचे/दाण्यांचे वजन, गोडी आणि आकर्षक रंग वाढवण्याचे काम पालाश करते.'
        }
      ]
    },
    categoryLink: 'Fertilizers'
  },
  {
    id: 'secondary',
    titleEn: 'Secondary Nutrients (Ca, Mg, Sulphur)',
    titleMr: 'दुय्यम अन्नद्रव्ये (कॅल्शियम, मॅग्नेशियम, गंधक)',
    icon: Layers,
    contentEn: {
      summary: 'Sulphur, Calcium, and Magnesium are just as crucial as NPK for oilseed crops, onions, and fruit development.',
      details: [
        {
          label: 'Sulphur (S) - गंधक',
          desc: 'Essential for oil content in soybean/groundnut and pungency/storage life in onions. Also acidifies high pH alkaline black soils.'
        },
        {
          label: 'Calcium (Ca) - कॅल्शियम',
          desc: 'Maintains cell wall strength, preventing blossom end rot in tomato and fruit cracking in pomegranate.'
        },
        {
          label: 'Magnesium (Mg) - मॅग्नेशियम',
          desc: 'The central atom in the chlorophyll molecule. Deficiency causes interveinal chlorosis (yellowing between green veins).'
        }
      ]
    },
    contentMr: {
      summary: 'गंधक, कॅल्शियम आणि मॅग्नेशियम ही दुय्यम अन्नद्रव्ये तेलबिया आणि भाजीपाल्यासाठी मुख्य खतांइतकीच महत्त्वाची असतात.',
      details: [
        {
          label: 'गंधक (Sulphur - S)',
          desc: 'कांद्याची टिकवणक्षमता आणि सोयाबीन/भुईमुगातील तेलाचे प्रमाण वाढवण्यासाठी एकरी १५-२० किलो गंधक देणे अत्यावश्यक आहे.'
        },
        {
          label: 'कॅल्शियम (Calcium - Ca)',
          desc: 'पेशीभित्ती मजबूत करून टोमॅटोचे तडकणे व डाळिंबाची फळगळ थांबवते.'
        },
        {
          label: 'मॅग्नेशियम (Magnesium - Mg)',
          desc: 'हरितद्रव्याचा मुख्य घटक. कमतरता असल्यास पानांच्या शिरांमधील भाग पिवळा पडतो.'
        }
      ]
    },
    categoryLink: 'Fertilizers'
  },
  {
    id: 'micronutrients',
    titleEn: 'Micronutrients (Zinc, Iron, Boron)',
    titleMr: 'सूक्ष्मअन्नद्रव्ये (झिंक, फेरस, बोरॉन)',
    icon: TestTube2,
    contentEn: {
      summary: 'Required in minute quantities but their absence halts metabolic enzymes. Maharashtra Grade-II foliar sprays deliver rapid correction.',
      details: [
        {
          label: 'Zinc (Zn) - जस्त',
          desc: 'Deficiency causes Khaira disease in rice and stunted white buds in maize. Apply Zinc Sulphate 10 kg/acre in basal soil.'
        },
        {
          label: 'Boron (B) - बोरॉन',
          desc: 'Essential for pollen germination and fruit setting. Prevents flower drop in cotton, tomato, and pomegranate.'
        },
        {
          label: 'Iron (Fe) - लोह',
          desc: 'Deficiency causes sudden bleaching/yellowing of young terminal leaves in calcareous alkaline soils of Maharashtra.'
        }
      ]
    },
    contentMr: {
      summary: 'अत्यंत सूक्ष्म प्रमाणात लागत असली तरी त्यांच्या अभावामुळे उत्पादनात २५-३०% घट होऊ शकते.',
      details: [
        {
          label: 'झिंक (Zinc - Zn)',
          desc: 'नवीन पानांचा आकार लहान राहणे आणि मका/सोयाबीनमध्ये पांढरे पट्टे पडणे थांबवण्यासाठी झिंक सल्फेट आवश्यक आहे.'
        },
        {
          label: 'बोरॉन (Boron - B)',
          desc: 'परागकण निर्मिती व फळधारणेसाठी आवश्यक. टोमॅटो व डाळिंबातील फुलगळ रोखण्यासाठी बोरॉनची फवारणी करतात.'
        },
        {
          label: 'फेरस (Iron - Fe)',
          desc: 'चुनखडीयुक्त जमिनीत कोवळी पाने पांढरी-पिवळी पडतात. त्यावर चिलेटेड फेरसची फवारणी फायदेशीर ठरते.'
        }
      ]
    },
    categoryLink: 'Micronutrients'
  },
  {
    id: 'cropProtection',
    titleEn: 'Crop Protection (Insecticides & Fungicides)',
    titleMr: 'पीक संरक्षण (कीटकनाशके व बुरशीनाशके)',
    icon: ShieldAlert,
    contentEn: {
      summary: 'Chemical crop protection should be the last line of defense in Integrated Pest Management (IPM). Never mix random chemicals without verifying compatibility.',
      details: [
        {
          label: 'Systemic vs Contact Fungicides',
          desc: 'Contact fungicides (like Mancozeb, Copper) coat the leaf surface preventively. Systemic fungicides (like Tebuconazole) enter the sap stream to cure established infections.'
        },
        {
          label: 'Rotating Chemical Modes of Action (MOA)',
          desc: 'Repeated use of the same insecticide creates insect resistance. Alternate between different IRAC chemical groups.'
        },
        {
          label: 'Pre-Harvest Interval (PHI) Compliance',
          desc: 'Always observe the mandatory waiting period between last pesticide application and crop harvest.'
        }
      ]
    },
    contentMr: {
      summary: 'रासायनिक औषधांचा वापर नेहमी एकात्मिक कीड व्यवस्थापनाचा (IPM) भाग म्हणून करावा. एकाच औषधाचा वारंवार वापर टाळावा.',
      details: [
        {
          label: 'स्पर्शजन्य व आंतरप्रवाही बुरशीनाशके',
          desc: 'स्पर्शजन्य औषधे (उदा. कॉपर, मॅन्कोझेब) पानांवर संरक्षक थर देतात; तर आंतरप्रवाही औषधे झाडाच्या रसात मिसळून रोग बरा करतात.'
        },
        {
          label: 'औषध बदलून फवारणे (MOA Rotation)',
          desc: 'एकाच कीटकनाशकाचा सतत वापर केल्यास किडींमध्ये प्रतिकारशक्ती तयार होते. नेहमी वेगवेगळ्या गटातील औषधे आलटून-पालटून फवारावीत.'
        },
        {
          label: 'काढणीपूर्वीची प्रतीक्षा वेळ (PHI)',
          desc: 'भाजीपाला काढण्यापूर्वी औषधाच्या लेबलवर दिलेली प्रतीक्षा वेळ पाळणे ग्राहकांच्या आरोग्यासाठी बंधनकारक आहे.'
        }
      ]
    },
    categoryLink: 'Insecticides'
  }
];

const InputsKnowledgePage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{currentLang === 'mr' ? 'कृषी निविष्ठा ज्ञानकोश' : 'Agricultural Input Knowledge Base'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#245C2A] font-marathi">
          {t('inputs.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#5D685B] leading-relaxed">
          {t('inputs.subtitle')}
        </p>
      </div>

      {/* Soil Testing Foundation Banner */}
      <div className="bg-[#FAF8F0] border-2 border-[#80552F]/30 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
        <div className="w-14 h-14 rounded-xl bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center shrink-0">
          <TestTube2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#245C2A] font-marathi">
            {currentLang === 'mr' ? 'माती परीक्षण हाच शेतीचा पाया!' : 'Soil Testing is the Core Foundation!'}
          </h2>
          <p className="text-xs sm:text-sm text-[#263328] leading-relaxed">
            {t('inputs.soilTestingBanner')}
          </p>
        </div>
        <Link
          to="/contact"
          className="shrink-0 px-5 py-2.5 rounded-lg bg-[#245C2A] hover:bg-[#438A35] text-white font-bold text-xs sm:text-sm transition shadow-xs"
        >
          {currentLang === 'mr' ? 'माती नमुना पद्धती विचारा' : 'Enquire About Soil Testing'}
        </Link>
      </div>

      {/* Toxicity Triangle Explainer Guide */}
      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#245C2A] font-marathi">
            {currentLang === 'mr' ? 'कीटकनाशक बाटलीवरील रंगीत त्रिकोण कसे वाचावे?' : 'How to Read Indian Pesticide Toxicity Triangles'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5D685B] mt-1">
            {currentLang === 'mr'
              ? 'केंद्रीय कीटकनाशक मंडळाच्या (CIBRC) नियमानुसार प्रत्येक औषधाच्या डब्यावर खालीलप्रमाणे विषारीपणाचे रंगीत चिन्ह असते.'
              : 'Official CIBRC safety classification labels on pesticide containers in India.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-rose-300 bg-rose-50/70 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-rose-600 rotate-45 inline-block"></span>
              <span className="font-extrabold text-rose-900 text-sm">Bright Red (अत्यंत विषारी)</span>
            </div>
            <p className="text-xs text-rose-800">
              Extremely Toxic. Oral LD50 &lt; 50 mg/kg. Highest precaution required. Never spray without full PPE suit.
            </p>
          </div>

          <div className="border border-[#F2C94C] bg-amber-50/70 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-amber-500 rotate-45 inline-block"></span>
              <span className="font-extrabold text-amber-900 text-sm">Bright Yellow (जास्त विषारी)</span>
            </div>
            <p className="text-xs text-amber-800">
              Highly Toxic. Oral LD50 50-500 mg/kg. Requires complete protective gloves and eye protection.
            </p>
          </div>

          <div className="border border-blue-300 bg-blue-50/70 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-600 rotate-45 inline-block"></span>
              <span className="font-extrabold text-blue-900 text-sm">Bright Blue (मध्यम विषारी)</span>
            </div>
            <p className="text-xs text-blue-800">
              Moderately Toxic. Oral LD50 500-5000 mg/kg. Standard agricultural formulation level.
            </p>
          </div>

          <div className="border border-[#D7E1D1] bg-[#EAF2E3] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-[#438A35] rotate-45 inline-block"></span>
              <span className="font-extrabold text-[#245C2A] text-sm">Bright Green (कमी विषारी)</span>
            </div>
            <p className="text-xs text-[#263328]">
              Slightly Toxic / Biological inputs. Oral LD50 &gt; 5000 mg/kg. Safe for beneficial predatory insects.
            </p>
          </div>
        </div>
      </div>

      {/* Input Modules Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#245C2A] font-marathi">
          {currentLang === 'mr' ? 'कृषी निविष्ठांचे प्रकार व कार्य' : 'Categories of Agricultural Inputs'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INPUT_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const title = currentLang === 'mr' ? sec.titleMr : sec.titleEn;
            const content = currentLang === 'mr' ? sec.contentMr : sec.contentEn;

            return (
              <div
                key={sec.id}
                className="bg-white rounded-xl border border-[#D7E1D1] p-6 shadow-card hover:shadow-card-hover transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#263328] font-marathi">
                      {title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5D685B] leading-relaxed">
                    {content.summary}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {content.details.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] text-xs">
                        <span className="font-bold text-[#263328] block mb-0.5">{item.label}</span>
                        <span className="text-[#5D685B] leading-relaxed">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D7E1D1] flex items-center justify-between">
                  <Link
                    to={`/products?category=${sec.categoryLink}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C2A] hover:text-[#438A35] transition"
                  >
                    <span>{currentLang === 'mr' ? 'दुकानातील उपलब्ध उत्पादने पाहा' : 'View Store Products'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pesticide Safety Precaution Checklist */}
      <div className="bg-[#245C2A] text-white rounded-xl p-6 sm:p-10 space-y-4 shadow-card">
        <h2 className="text-xl sm:text-2xl font-black font-marathi flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#F2C94C]" />
          <span>{t('inputs.pesticideSafetyTitle')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#FAF8F0] pt-2">
          {t('inputs.pesticideSafetyPoints', { returnObjects: true })?.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-white/10 border border-white/20">
              <CheckCircle2 className="w-4 h-4 text-[#F2C94C] shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputsKnowledgePage;
