-- ==============================================================================
-- RUSHI KRUSHI SEVA KENDRA - CATALOG SEED DATA MIGRATION
-- Migration: 20261012080000_seed_catalog_data.sql
-- Target Tables: public.products, public.crops, public.articles
-- Scope: Catalog data only (no users, profiles, farmer_crops, or enquiries)
-- Properties:
--   1. Idempotent: Uses ON CONFLICT (slug) DO UPDATE. Can be safely executed multiple times.
--   2. Preserves Primary Keys: Does not regenerate existing UUIDs during repeat imports.
--   3. Preserves Timestamps: created_at is preserved; updated_at is updated on conflict.
--   4. Preserves All Bilingual Text: Exact English and Marathi Unicode Devanagari strings.
--   5. Full Structure Preservation: Arrays (text[]) and complex agronomy plans (jsonb).
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. SEED PRODUCTS (6 Retail Products)
-- ==============================================================================
INSERT INTO public.products (
  name_en,
  name_mr,
  slug,
  brand,
  category,
  image_url,
  description_en,
  description_mr,
  pack_sizes,
  technical_composition,
  applicable_crops,
  intended_use,
  dosage,
  safety_precautions_en,
  safety_precautions_mr,
  manufacturer,
  indicative_price,
  availability,
  is_featured,
  status
)
VALUES (
  'Coragen Insecticide (Rynaxypyr 18.5% SC)',
  'कोराजन कीटकनाशक (रिनॅक्सिपायर १८.५% एससी)',
  'coragen-insecticide-rynaxypyr-18-5-sc',
  'FMC India',
  'Insecticides',
  'https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=800&auto=format&fit=crop&q=80',
  'Broad-spectrum anthranilic diamide insecticide providing long-lasting control of early shoot borer in sugarcane, pod borer in soybean, and fruit borer in tomato.',
  'ऊस खोडकीड, सोयाबीन शेंगा पोखरणाऱ्या अळ्या आणि टोमॅटो फळ पोखरणाऱ्या अळ्यांवर उत्कृष्ट व दीर्घकालीन नियंत्रण देणारे आधुनिक कीटकनाशक.',
  ARRAY['10 ml', '30 ml', '60 ml', '150 ml']::text[],
  'Chlorantraniliprole 18.5% SC w/w',
  ARRAY['Sugarcane', 'Soybean', 'Tomato', 'Chilli', 'Maize', 'Cotton']::text[],
  'Foliar spray and drenching for lepidopteran pest control',
  '0.4 ml per liter of water (60 ml per acre in 150-200 liters water)',
  'Wear gloves and face mask during mixing. Maintain recommended Pre-Harvest Interval (PHI) of 14 days before harvest.',
  'फवारणी करताना हातमोजे व मास्क वापरा. काढणीपूर्वी किमान १४ दिवस अगोदर फवारणी थांबवा.',
  'FMC India Pvt Ltd',
  '₹190 - ₹1,850 (Pack size dependent)',
  'in_stock',
  true,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mr = EXCLUDED.name_mr,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  description_en = EXCLUDED.description_en,
  description_mr = EXCLUDED.description_mr,
  pack_sizes = EXCLUDED.pack_sizes,
  technical_composition = EXCLUDED.technical_composition,
  applicable_crops = EXCLUDED.applicable_crops,
  intended_use = EXCLUDED.intended_use,
  dosage = EXCLUDED.dosage,
  safety_precautions_en = EXCLUDED.safety_precautions_en,
  safety_precautions_mr = EXCLUDED.safety_precautions_mr,
  manufacturer = EXCLUDED.manufacturer,
  indicative_price = EXCLUDED.indicative_price,
  availability = EXCLUDED.availability,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.products (
  name_en,
  name_mr,
  slug,
  brand,
  category,
  image_url,
  description_en,
  description_mr,
  pack_sizes,
  technical_composition,
  applicable_crops,
  intended_use,
  dosage,
  safety_precautions_en,
  safety_precautions_mr,
  manufacturer,
  indicative_price,
  availability,
  is_featured,
  status
)
VALUES (
  'IFFCO 10:26:26 Complex NPK Fertilizer',
  'इफ्को १०:२६:२६ एनपीके संयुक्त खत',
  'iffco-10-26-26-complex-npk-fertilizer',
  'IFFCO',
  'Fertilizers',
  'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&auto=format&fit=crop&q=80',
  'High phosphorus and potash grade granulated fertilizer. Essential basal application for sugarcane, onion, potato, and flowering stages in vegetable crops.',
  'उच्च स्फुरद व पालाशयुक्त दाणेदार खत. ऊस, कांदा, बटाटा या पिकांसाठी पायाभूत खत म्हणून आणि भाजीपाल्यात फुले व फळे पोसण्यासाठी अतिशय उपयुक्त.',
  ARRAY['50 kg Bag']::text[],
  'Total Nitrogen (N) 10%, Available Phosphate (P2O5) 26%, Soluble Potash (K2O) 26%',
  ARRAY['Sugarcane', 'Onion', 'Tomato', 'Pomegranate', 'Wheat', 'Potato']::text[],
  'Basal dressing and early stage soil application',
  '50-100 kg per acre as per soil test recommendation',
  'Store in a cool, dry place away from direct moisture. Keep bags elevated from concrete floors.',
  'खताची पोती दमट जागेत ठेवू नका. कोरड्या जागी लाकडी फळ्यांवर साठवणूक करा.',
  'Indian Farmers Fertiliser Cooperative Ltd (IFFCO)',
  '₹1,470 per 50kg bag (Govt. Subsidized MRP)',
  'in_stock',
  true,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mr = EXCLUDED.name_mr,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  description_en = EXCLUDED.description_en,
  description_mr = EXCLUDED.description_mr,
  pack_sizes = EXCLUDED.pack_sizes,
  technical_composition = EXCLUDED.technical_composition,
  applicable_crops = EXCLUDED.applicable_crops,
  intended_use = EXCLUDED.intended_use,
  dosage = EXCLUDED.dosage,
  safety_precautions_en = EXCLUDED.safety_precautions_en,
  safety_precautions_mr = EXCLUDED.safety_precautions_mr,
  manufacturer = EXCLUDED.manufacturer,
  indicative_price = EXCLUDED.indicative_price,
  availability = EXCLUDED.availability,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.products (
  name_en,
  name_mr,
  slug,
  brand,
  category,
  image_url,
  description_en,
  description_mr,
  pack_sizes,
  technical_composition,
  applicable_crops,
  intended_use,
  dosage,
  safety_precautions_en,
  safety_precautions_mr,
  manufacturer,
  indicative_price,
  availability,
  is_featured,
  status
)
VALUES (
  'Mahyco Phule Samarth Onion Seeds (Late Kharif / Rangda)',
  'फुले समर्थ कांदा बियाणे (रांगडा व उन्हाळी)',
  'mahyco-phule-samarth-onion-seeds',
  'Mahyco / MPKV Selection',
  'Seeds',
  'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
  'High yielding red onion variety suited for Late Kharif (Rangda) and Rabi seasons in Western Maharashtra. Firm bulbs with excellent storage capability.',
  'पश्चिम महाराष्ट्रातील रांगडा व रब्बी हंगामासाठी उत्कृष्ट कांदा वाण. गडद लाल रंग, मध्यम गोल आकार आणि टिकवणक्षमता उत्तम.',
  ARRAY['500 gm', '1 kg Tin']::text[],
  'Certified True-to-Type Pure Seed, Minimum 70% Germination',
  ARRAY['Onion']::text[],
  'Nursery bed sowing for seedling transplantation',
  '4 to 5 kg seed per acre for transplanting nursery',
  'Treated with Thiram/Captan fungicide. Do not use for human consumption or cattle feed.',
  'बियाण्यावर बुरशीनाशक प्रक्रिया केलेली आहे. खाण्यासाठी किंवा गुरांच्या चाऱ्यासाठी वापरू नका.',
  'Maharashtra Hybrid Seeds Co. Pvt. Ltd.',
  '₹1,200 - ₹1,600 per kg (Seasonal variation)',
  'in_stock',
  true,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mr = EXCLUDED.name_mr,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  description_en = EXCLUDED.description_en,
  description_mr = EXCLUDED.description_mr,
  pack_sizes = EXCLUDED.pack_sizes,
  technical_composition = EXCLUDED.technical_composition,
  applicable_crops = EXCLUDED.applicable_crops,
  intended_use = EXCLUDED.intended_use,
  dosage = EXCLUDED.dosage,
  safety_precautions_en = EXCLUDED.safety_precautions_en,
  safety_precautions_mr = EXCLUDED.safety_precautions_mr,
  manufacturer = EXCLUDED.manufacturer,
  indicative_price = EXCLUDED.indicative_price,
  availability = EXCLUDED.availability,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.products (
  name_en,
  name_mr,
  slug,
  brand,
  category,
  image_url,
  description_en,
  description_mr,
  pack_sizes,
  technical_composition,
  applicable_crops,
  intended_use,
  dosage,
  safety_precautions_en,
  safety_precautions_mr,
  manufacturer,
  indicative_price,
  availability,
  is_featured,
  status
)
VALUES (
  'Custodia Fungicide (Azoxystrobin 11% + Tebuconazole 18.3% SC)',
  'कस्टोडिया बुरशीनाशक (अ‍ॅझॉक्सीस्ट्रॉबिन ११% + टेबुकोनॅझोल १८.३% एससी)',
  'custodia-fungicide-azoxystrobin-tebuconazole',
  'ADAMA India',
  'Fungicides',
  'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&auto=format&fit=crop&q=80',
  'Broad-spectrum dual action systemic fungicide effective against powdery mildew, anthracnose, leaf spot, and purple blotch in onion and vegetables.',
  'कांद्यावरील करपा (Purple Blotch), डाळिंब व टोमॅटोवरील भुरी आणि तांबेरा रोगावर नियंत्रण ठेवणारे दुहेरी परिणामकारक आंतरप्रवाही बुरशीनाशक.',
  ARRAY['100 ml', '250 ml', '500 ml', '1 Liter']::text[],
  'Azoxystrobin 11% + Tebuconazole 18.3% w/w SC',
  ARRAY['Onion', 'Tomato', 'Pomegranate', 'Grapes', 'Chilli']::text[],
  'Preventive and curative foliar spray',
  '1.5 to 2 ml per liter of water (300 ml per acre)',
  'Do not spray within 10 days of onion or tomato harvest. Toxic to aquatic organisms.',
  'पाण्याच्या स्रोतांजवळ फवारणी करू नका. फवारणीनंतर २० दिवस काढणी करू नका.',
  'ADAMA India Pvt Ltd',
  '₹420 - ₹1,550',
  'in_stock',
  true,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mr = EXCLUDED.name_mr,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  description_en = EXCLUDED.description_en,
  description_mr = EXCLUDED.description_mr,
  pack_sizes = EXCLUDED.pack_sizes,
  technical_composition = EXCLUDED.technical_composition,
  applicable_crops = EXCLUDED.applicable_crops,
  intended_use = EXCLUDED.intended_use,
  dosage = EXCLUDED.dosage,
  safety_precautions_en = EXCLUDED.safety_precautions_en,
  safety_precautions_mr = EXCLUDED.safety_precautions_mr,
  manufacturer = EXCLUDED.manufacturer,
  indicative_price = EXCLUDED.indicative_price,
  availability = EXCLUDED.availability,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.products (
  name_en,
  name_mr,
  slug,
  brand,
  category,
  image_url,
  description_en,
  description_mr,
  pack_sizes,
  technical_composition,
  applicable_crops,
  intended_use,
  dosage,
  safety_precautions_en,
  safety_precautions_mr,
  manufacturer,
  indicative_price,
  availability,
  is_featured,
  status
)
VALUES (
  'Multiplex Kranti Complete Micronutrient Foliar Fertilizer',
  'मल्टिप्लेक्स क्रांती संपूर्ण सूक्ष्मअन्नद्रव्य खत',
  'multiplex-kranti-complete-micronutrient',
  'Multiplex Group',
  'Micronutrients',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80',
  'Balanced formulation containing Zinc, Iron, Manganese, Copper, Boron, and Molybdenum certified under Maharashtra State Micronutrient Grade-II standards.',
  'महाराष्ट्र शासन ग्रेड-२ प्रमाणित सूक्ष्मअन्नद्रव्ये (झिंक, फेरस, मॅंगनीज, बोरॉन, कॉपर). पिकातील पिवळेपणा दूर करून चयापचय क्रिया व उत्पादन वाढवते.',
  ARRAY['250 ml', '500 ml', '1 Liter', '5 Liter']::text[],
  'Chelated Multi-Micronutrient Liquid (Grade II Maharashtra)',
  ARRAY['Sugarcane', 'Soybean', 'Pomegranate', 'Vegetables', 'Wheat']::text[],
  'Foliar spray to correct hidden micro-nutrient deficiencies',
  '2.5 ml per liter of water (500 ml per acre)',
  'Compatible with most non-alkaline insecticides and fungicides. Shake container well before use.',
  'अल्कलाईन औषधांसोबत मिसळू नका. वापरण्यापूर्वी बाटली चांगली हलवून घ्या.',
  'Karnataka Agro Chemicals (Multiplex)',
  '₹280 - ₹850',
  'in_stock',
  false,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mr = EXCLUDED.name_mr,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  description_en = EXCLUDED.description_en,
  description_mr = EXCLUDED.description_mr,
  pack_sizes = EXCLUDED.pack_sizes,
  technical_composition = EXCLUDED.technical_composition,
  applicable_crops = EXCLUDED.applicable_crops,
  intended_use = EXCLUDED.intended_use,
  dosage = EXCLUDED.dosage,
  safety_precautions_en = EXCLUDED.safety_precautions_en,
  safety_precautions_mr = EXCLUDED.safety_precautions_mr,
  manufacturer = EXCLUDED.manufacturer,
  indicative_price = EXCLUDED.indicative_price,
  availability = EXCLUDED.availability,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.products (
  name_en,
  name_mr,
  slug,
  brand,
  category,
  image_url,
  description_en,
  description_mr,
  pack_sizes,
  technical_composition,
  applicable_crops,
  intended_use,
  dosage,
  safety_precautions_en,
  safety_precautions_mr,
  manufacturer,
  indicative_price,
  availability,
  is_featured,
  status
)
VALUES (
  'Aspee Battery Operated Knapsack Sprayer 16L (12V/12Ah)',
  'अस्पी बॅटरी ऑपरेटेड नॅपसॅक फवारणी पंप (१६ लिटर)',
  'aspee-battery-operated-knapsack-sprayer-16l',
  'Aspee Agricultural Equipment',
  'Spray Pumps',
  'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
  'High efficiency 16-liter chemical resistant backpack sprayer with rechargeable 12V dry battery, stainless steel telescopic lance, and multi-pattern nozzles.',
  '१६ लिटर क्षमतेचा मजबूत बॅटरी फवारणी पंप. एका चार्जिंगमध्ये २५ ते ३० टाक्या फवारणी, स्टील लान्स आणि विविध प्रकारची नोझल्स समाविष्ट.',
  ARRAY['1 Unit (with charger & nozzle set)']::text[],
  'High-pressure diaphragm pump, 12V 12Ah maintenance-free battery',
  ARRAY['All Field Crops', 'Vegetables', 'Horticulture Orchards']::text[],
  'Foliar spraying of water-soluble fertilizers, bio-stimulants, and pesticides',
  'N/A',
  'Flush pump with clean water immediately after every pesticide application. Recharge battery every 4 weeks when idle.',
  'फवारणी संपल्यावर पंप स्वच्छ पाण्याने धुवून घ्या. महिन्यातून एकदा बॅटरी अवश्य चार्ज करा.',
  'American Spring & Pressing Works Pvt. Ltd. (ASPEE)',
  '₹2,600 - ₹3,100 approx.',
  'in_stock',
  false,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mr = EXCLUDED.name_mr,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  description_en = EXCLUDED.description_en,
  description_mr = EXCLUDED.description_mr,
  pack_sizes = EXCLUDED.pack_sizes,
  technical_composition = EXCLUDED.technical_composition,
  applicable_crops = EXCLUDED.applicable_crops,
  intended_use = EXCLUDED.intended_use,
  dosage = EXCLUDED.dosage,
  safety_precautions_en = EXCLUDED.safety_precautions_en,
  safety_precautions_mr = EXCLUDED.safety_precautions_mr,
  manufacturer = EXCLUDED.manufacturer,
  indicative_price = EXCLUDED.indicative_price,
  availability = EXCLUDED.availability,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  updated_at = now();

-- ==============================================================================
-- 2. SEED CROPS (3 Agronomic Cultivation Guides)
-- ==============================================================================
INSERT INTO public.crops (
  name_en,
  name_mr,
  slug,
  category,
  image_url,
  seasons,
  intro_en,
  intro_mr,
  climate_en,
  climate_mr,
  temperature_range,
  soil_en,
  soil_mr,
  sowing_season_en,
  sowing_season_mr,
  land_preparation_en,
  land_preparation_mr,
  seed_selection_en,
  seed_selection_mr,
  seed_treatment_en,
  seed_treatment_mr,
  seed_rate,
  spacing,
  sowing_method_en,
  sowing_method_mr,
  irrigation_en,
  irrigation_mr,
  fertilizer_schedule,
  growth_stages,
  pests,
  diseases,
  weed_management_en,
  weed_management_mr,
  harvesting_en,
  harvesting_mr,
  post_harvest_en,
  post_harvest_mr,
  common_mistakes_en,
  common_mistakes_mr,
  faqs,
  related_product_categories,
  status,
  sources
)
VALUES (
  'Sugarcane',
  'ऊस',
  'sugarcane',
  'Field',
  'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=800&auto=format&fit=crop&q=80',
  ARRAY['Adsali (July-August)', 'Pre-Seasonal (October-November)', 'Suru (January-February)']::text[],
  'Sugarcane (Saccharum officinarum) is the premier perennial commercial crop of Western Maharashtra and the Ambegaon-Junnar-Khed belt. It forms the economic backbone of local cooperative sugar factories.',
  'ऊस हे पश्चिम महाराष्ट्र व आंबेगाव परिसरातील शेतकऱ्यांचे प्रमुख बारमाही नगदी पीक आहे. स्थानिक साखर कारखान्यांच्या सहकार्याने हे पीक भागातील अर्थकारणाचा कणा मानले जाते.',
  'Tropical and sub-tropical climate. Requires abundant sunshine and high humidity during elongation stage.',
  'उष्ण व दमट हवामान. कांड्या सुटण्याच्या काळात भरपूर सूर्यप्रकाश व उबदार हवामान गरजेचे असते.',
  '20°C to 38°C optimum for germination and tiller development',
  'Medium to deep well-drained black soil (काळी जमीन) with pH 6.5 to 8.0. Avoid waterlogged or saline-alkali patches.',
  'मध्यम ते भारी, पाण्याचा चांगला निचरा होणारी काळी जमीन उत्तम. जमिनीचा सामू ६.५ ते ८.० असावा. चोपण व चिबड जमीन टाळावी.',
  'Adsali: 15 July to 15 August; Pre-Seasonal: 15 Oct to 15 Nov; Suru: 15 Jan to 15 Feb.',
  'आडसाली: १५ जुलै ते १५ ऑगस्ट; पूर्वहंगामी: १५ ऑक्टोबर ते १५ नोव्हेंबर; सुरू: १५ जानेवारी ते १५ फेब्रुवारी.',
  'Deep plowing up to 35-40 cm followed by 2 cross harrowings. Add 20-25 tonnes well-decomposed FYM (शेणखत) per hectare. Prepare ridges and furrows at 4 to 5 feet spacing.',
  'जमिनीची ३५-४० सेंमी खोल नांगरट करून २ कुळवाच्या पाळ्या द्याव्यात. एकरी १०-१२ ट्रॉली चांगले कुजलेले शेणखत मिसळावे. ४ ते ५ फुटांवर सरी-वरंबे तयार करावेत.',
  'Choose pure, disease-free seed sets of varieties Co 86032 (Nira), CoM 0265 (Phule 265), or VSI 08005 from a certified 9 to 10 month old nursery.',
  'को. ८६०३२ (निरा), को.एम. ०२६५ (फुले २६५) किंवा व्हीएसआय ०८००५ या खात्रीशीर वाणांचे ९ ते १० महिने वयाच्या बेणे मळ्यातून निरोगी बेणे निवडावे.',
  'Dip single or double eye bud sets in a solution of Carbendazim 50% WP (100 gm) + Chlorpyrifos 20% EC (250 ml) + Urea (1 kg) in 100 liters of water for 15 minutes. Follow with Azotobacter & PSB bio-fertilizer treatment.',
  '१०० लिटर पाण्यात १०० ग्रॅम बाविस्टिन (कार्बेन्डाझिम) + २५० मिली क्लोरपायरीफॉस + १ किलो युरिया मिसळून बेणे १०-१५ मिनिटे बुडवावे. त्यानंतर ॲझोटोबॅक्टर व पीएसबी जिवाणू संवर्धकाची प्रक्रिया करावी.',
  '25,000 to 30,000 two-bud sets per hectare (10,000 to 12,000 sets per acre)',
  '4 feet to 5 feet row-to-row spacing for drip irrigation & mechanization',
  'Wet planting method (ओलवून बेणे दाबणे) or Dry planting followed by immediate light irrigation. Ensure eye buds face sideways.',
  'सरीमध्ये हलके पाणी सोडून डोळे बाजूला राहतील अशा बेताने बेणे चिखलात दाबावे.',
  'Drip irrigation delivers 40-50% water savings and allows fertigation. Regular irrigation intervals of 8-10 days in winter, 5-6 days in summer.',
  'ठिबक सिंचनाने ४०-५०% पाण्याची बचत होते व खते थेट मुळाशी देता येतात. पाटपाणी असल्यास हिवाळ्यात ८-१० दिवसांनी आणि उन्हाळ्यात ५-६ दिवसांनी पाणी द्यावे.',
  '[{"stage":"Basal Application at Planting (लागवडीवेळी)","n":"10%","p":"50%","k":"50%","organic":"5 tonnes FYM + 50 kg Neem Cake","notesEn":"Apply 1 bag IFFCO 10:26:26 + 1 bag Urea + 10 kg Zinc Sulphate per acre in furrow.","notesMr":"एकरी १ गोणी १०:२६:२६ + १ गोणी युरिया + १० किलो झिंक सल्फेट सरीत टाकावे."},{"stage":"Tillering stage - 6 to 8 weeks (फुटवे फुटण्याची अवस्था)","n":"40%","p":"0%","k":"0%","notesEn":"Apply Urea 100 kg per acre with earthing up or through fertigation.","notesMr":"एकरी २ गोणी युरिया देऊन हलकी भर लावावी."},{"stage":"Grand Growth & Earthing Up - 16 weeks (मोठी बांधणी)","n":"50%","p":"50%","k":"50%","notesEn":"Final dose: Urea 100 kg + Single Super Phosphate 100 kg + Muriate of Potash 50 kg per acre.","notesMr":"मोठ्या बांधणीच्या वेळी उरलेली संपूर्ण खतमात्रा देऊन सरी फोडून वरंबा बांधावा."}]'::jsonb,
  '[{"nameEn":"Germination & Establishment","nameMr":"उगवण व बेणे स्थिरावणे","durationDays":"1 to 35 Days","activitiesEn":"Ensure adequate moisture, gap filling if required within 25 days.","activitiesMr":"वाफसा टिकवून ठेवणे, २५ दिवसांच्या आत नांग्या भरणे."},{"nameEn":"Tillering Stage","nameMr":"फुटवे फुटण्याचा काळ","durationDays":"35 to 120 Days","activitiesEn":"Weed management, pest monitoring for early shoot borer, first top-dressing.","activitiesMr":"तण नियंत्रण, खोडकिडीचे निरीक्षण, पहिली खताची मात्रा व हलकी भर."},{"nameEn":"Grand Growth Stage","nameMr":"कांड्या सुटणे व जोमदार वाढ","durationDays":"120 to 270 Days","activitiesEn":"Heavy irrigation management, fertilizer application at earthing up, propping.","activitiesMr":"मोठी बांधणी, नियमित पाणी, आंतरमशागत, लोळणे टाळण्यासाठी बांधणी."},{"nameEn":"Ripening & Maturity","nameMr":"पक्वता व साखर भरणे","durationDays":"270 to 360+ Days","activitiesEn":"Withhold irrigation 10-15 days prior to harvest to concentrate sucrose.","activitiesMr":"कापणीपूर्वी १०-१५ दिवस पाणी बंद करून साखर उतारा वाढवणे."}]'::jsonb,
  '[{"nameEn":"Early Shoot Borer (खोडकीड)","nameMr":"खोडकीड (Chilo infuscatellus)","symptomsEn":"Central shoot dries up causing ''dead heart'' which can be pulled out easily and gives foul smell.","symptomsMr":"पिकाचा मधला पोंगा वाळतो (डेड हार्ट), ओढल्यास सहज हाता येतो व दुर्गंधी येते.","managementEn":"Early earthing up. Spray Coragen (0.4 ml/L) or install pheromone traps @ 5 per acre.","managementMr":"हलकी बांधणी करावी. कोराजन (०.४ मिली/लिटर) फवारावे किंवा एकरी ५ कामगंध सापळे लावावेत."},{"nameEn":"White Grub (हुमणी कीड)","nameMr":"हुमणी अळी (Holotrichia serrata)","symptomsEn":"Grubs feed on sugarcane roots causing sudden wilting and drying of clumps in patches.","symptomsMr":"अळ्या मुळे कुरतडतात, ज्यामुळे ऊस पिवळा पडून तुकड्या-तुकड्यात वाळू लागतो.","managementEn":"Collect adult beetles after monsoon pre-showers from Neem trees. Drench Chlorpyrifos 20 EC or Fipronil in affected spots.","managementMr":"पहिल्या पावसानंतर कडुनिंबाच्या झाडावरील भुंगेरे गोळा करून नष्ट करावेत. फिप्रोनिल किंवा क्लोरपायरीफॉस ड्रेंचिंग करावे."}]'::jsonb,
  '[{"nameEn":"Grassy Shoot Disease (गवती वाढ रोग)","nameMr":"गवती वाढ रोग (Phytoplasma)","symptomsEn":"Profuse slender tillers look like grass; leaves turn pale yellow to white; cane formation fails.","symptomsMr":"असंख्य बारीक गव्हाणी फुटवे फुटतात, पाने पांढरी पडतात व कांड्या तयार होत नाहीत.","managementEn":"Use hot water treated seed sets. Uproot and burn diseased clumps immediately.","managementMr":"उष्णजल प्रक्रिया केलेले बेणे वापरावे. रोगट उसाची बेटे उपटून जाळून नष्ट करावीत."},{"nameEn":"Smut (चाबूक काणी)","nameMr":"चाबूक काणी रोग","symptomsEn":"Central shoot transforms into a long black whip-like structure covered with fungal spores.","symptomsMr":"शेंड्यातून लांब काळ्या चाबकासारखा पोंगा बाहेर पडतो ज्यावर काजळीसारखी भुकटी असते.","managementEn":"Dip seed sets in Carbendazim (1 gm/liter). Uproot diseased canes inside a polythene bag to avoid spore spread.","managementMr":"लागवडीपूर्वी कार्बेन्डाझिम प्रक्रिया करावी. रोगट झाडे प्लास्टिक पिशवीत झाकून उपटावीत."}]'::jsonb,
  'Apply Atrazine 50% WP @ 1 kg/acre as pre-emergence herbicide within 3-4 days of planting on moist soil. Follow with 2 hand weedings at 30 and 60 days.',
  'लागवडीनंतर ३-४ दिवसांत ओल असताना एकरी १ किलो ॲट्राझिन ५०% डब्ल्यूपी फवारावे. ३० व ६० दिवसांनी खुरपणी करावी.',
  'Harvest when brix reading reaches 18-20% and lower leaves dry naturally. Cut canes at ground level using a sharp billhook to enable healthy ratoon growth.',
  'साखरेचे प्रमाण १८-२० ब्रिक्स झाल्यावर जमिनीलगत तीक्ष्ण कोयत्याने कापणी करावी, जेणेकरून खोडवा चांगला फुटतो.',
  'Transport to sugar mill within 24 to 36 hours of harvest to minimize sucrose inversion and driage loss.',
  'कापणीनंतर २४ ते ३६ तासांच्या आत ऊस कारखान्यात पोहोचवावा, अन्यथा साखर उतारा घटतो.',
  ARRAY['Using old ratoon crop canes as seed material instead of specialized 9-month seed nurseries.', 'Over-irrigation in heavy black soils causing root asphyxiation and poor tillering.', 'Excessive nitrogenous fertilizer (Urea) application without balancing phosphorus and potassium.']::text[],
  ARRAY['खात्रीशीर बेणे मळ्याऐवजी खोडव्याचे बेणे वापरणे.', 'भारी जमिनीत अतिपाणी देऊन मुळांना हवा न मिळू देणे.', 'स्फुरद व पालाश न देता फक्त युरियाचा बेसुमार वापर करणे.']::text[],
  '[{"qEn":"Which variety is best suited for Ambegaon taluka?","qMr":"आंबेगाव तालुक्यासाठी कोणता ऊस वाण सर्वोत्तम आहे?","aEn":"Co 86032 (Nira) and CoM 0265 (Phule 265) perform exceptionally well across local cooperative sugar factory operational zones.","aMr":"को. ८६०३२ (निरा) आणि को.एम. ०२६५ (फुले २६५) हे वाण भीमाशंकर व विघ्नहर साखर कारखाना कार्यक्षेत्रात सर्वाधिक उत्पादन देतात."}]'::jsonb,
  ARRAY['Seeds', 'Fertilizers', 'Insecticides', 'Micronutrients']::text[],
  'published',
  'Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri'
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mr = EXCLUDED.name_mr,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  seasons = EXCLUDED.seasons,
  intro_en = EXCLUDED.intro_en,
  intro_mr = EXCLUDED.intro_mr,
  climate_en = EXCLUDED.climate_en,
  climate_mr = EXCLUDED.climate_mr,
  temperature_range = EXCLUDED.temperature_range,
  soil_en = EXCLUDED.soil_en,
  soil_mr = EXCLUDED.soil_mr,
  sowing_season_en = EXCLUDED.sowing_season_en,
  sowing_season_mr = EXCLUDED.sowing_season_mr,
  land_preparation_en = EXCLUDED.land_preparation_en,
  land_preparation_mr = EXCLUDED.land_preparation_mr,
  seed_selection_en = EXCLUDED.seed_selection_en,
  seed_selection_mr = EXCLUDED.seed_selection_mr,
  seed_treatment_en = EXCLUDED.seed_treatment_en,
  seed_treatment_mr = EXCLUDED.seed_treatment_mr,
  seed_rate = EXCLUDED.seed_rate,
  spacing = EXCLUDED.spacing,
  sowing_method_en = EXCLUDED.sowing_method_en,
  sowing_method_mr = EXCLUDED.sowing_method_mr,
  irrigation_en = EXCLUDED.irrigation_en,
  irrigation_mr = EXCLUDED.irrigation_mr,
  fertilizer_schedule = EXCLUDED.fertilizer_schedule,
  growth_stages = EXCLUDED.growth_stages,
  pests = EXCLUDED.pests,
  diseases = EXCLUDED.diseases,
  weed_management_en = EXCLUDED.weed_management_en,
  weed_management_mr = EXCLUDED.weed_management_mr,
  harvesting_en = EXCLUDED.harvesting_en,
  harvesting_mr = EXCLUDED.harvesting_mr,
  post_harvest_en = EXCLUDED.post_harvest_en,
  post_harvest_mr = EXCLUDED.post_harvest_mr,
  common_mistakes_en = EXCLUDED.common_mistakes_en,
  common_mistakes_mr = EXCLUDED.common_mistakes_mr,
  faqs = EXCLUDED.faqs,
  related_product_categories = EXCLUDED.related_product_categories,
  status = EXCLUDED.status,
  sources = EXCLUDED.sources,
  updated_at = now();

INSERT INTO public.crops (
  name_en,
  name_mr,
  slug,
  category,
  image_url,
  seasons,
  intro_en,
  intro_mr,
  climate_en,
  climate_mr,
  temperature_range,
  soil_en,
  soil_mr,
  sowing_season_en,
  sowing_season_mr,
  land_preparation_en,
  land_preparation_mr,
  seed_selection_en,
  seed_selection_mr,
  seed_treatment_en,
  seed_treatment_mr,
  seed_rate,
  spacing,
  sowing_method_en,
  sowing_method_mr,
  irrigation_en,
  irrigation_mr,
  fertilizer_schedule,
  growth_stages,
  pests,
  diseases,
  weed_management_en,
  weed_management_mr,
  harvesting_en,
  harvesting_mr,
  post_harvest_en,
  post_harvest_mr,
  common_mistakes_en,
  common_mistakes_mr,
  faqs,
  related_product_categories,
  status,
  sources
)
VALUES (
  'Onion',
  'कांदा',
  'onion',
  'Vegetable',
  'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
  ARRAY['Kharif (June-October)', 'Late Kharif / Rangda (Sept-Jan)', 'Rabi (Nov-April)']::text[],
  'Onion (Allium cepa) is a cornerstone cash crop in Pune district, notably in Ambegaon, Junnar, and Khed. The Rabi crop is famous for superior keeping quality in traditional ''Chawl'' storage structures.',
  'कांदा हे पुणे जिल्ह्यातील आंबेगाव, जुन्नर आणि खेड पट्ट्यातील शेतकऱ्यांचे अत्यंत महत्त्वाचे नगदी पीक आहे. रब्बी कांदा चाळीत दीर्घकाळ टिकण्यासाठी प्रसिद्ध आहे.',
  'Cool climate during early vegetative stage and warm, dry weather during bulb development and maturity.',
  'सुरुवातीला थंड व आल्हाददायक हवामान आणि कांदा पोसण्याच्या व पक्वतेच्या काळात कोरडे व उष्ण हवामान उपयुक्त ठरते.',
  '13°C to 24°C before bulb formation; 30°C to 35°C during bulb maturity',
  'Well-drained sandy loam or medium black soil rich in organic matter. Soil pH 6.5 to 7.5.',
  'पाण्याचा उत्तम निचरा होणारी मध्यम काळी किंवा गाळाची जमीन. सेंद्रिय कर्ब मुबलक असावा व सामू ६.५ ते ७.५ असावा.',
  'Kharif nursery: May-June; Rangda: Aug-Sept; Rabi: Oct-Nov. Transplant 40-45 day old seedlings.',
  'खरीप बियाणे: मे-जून; रांगडा: ऑगस्ट-सप्टेंबर; रब्बी: ऑक्टोबर-नोव्हेंबर. ४०-४५ दिवसांची रोपे पुनर्लागवडीसाठी वापरावीत.',
  'Deep plowing and 2-3 harrowings to achieve fine tilth. Incorporate 10 tonnes FYM and prepare flat beds or broad bed furrows (BBF).',
  'जमीन भुसभुशीत करून १०-१२ ट्रॉली चांगले शेणखत मिसळावे. सपाट वाफे किंवा रुंद वरंबा-सरी (BBF) पद्धत अवलंबावी.',
  'Recommended varieties: Phule Samarth, Bhima Kiran, Bhima Shakti, Agrifound Light Red.',
  'फुले समर्थ, भीमा किरण, भीमा शक्ती किंवा ॲग्रीफाऊंड लाईट रेड या दर्जेदार वाणांची निवड करावी.',
  'Treat seed with Trichoderma viride (5 gm/kg seed) or Thiram (3 gm/kg seed) to prevent damping-off disease in nursery.',
  'रोपवाटिकेतील मर रोग टाळण्यासाठी ट्रायकोडर्मा ५ ग्रॅम किंवा थायरम ३ ग्रॅम प्रति किलो बियाण्यावर चोळावे.',
  '8 to 10 kg seed per hectare (3.5 to 4 kg per acre) for transplanting',
  '15 cm row-to-row and 10 cm plant-to-plant',
  'Transplant healthy seedlings in evening hours or cloudy weather. Dip roots in Carbendazim solution before planting.',
  'संध्याकाळच्या वेळी १० × १५ सेंमी अंतरावर पुनर्लागवड करावी. लागवडीपूर्वी रोपांची मुळे बुरशीनाशक द्रावणात बुडवावीत.',
  'Frequent light irrigations. Drip/sprinkler irrigation prevents soil crusting and bulb rotting. Stop watering 10-15 days before harvest.',
  'हलके व नियमित पाणी द्यावे. ठिबक किंवा तुषार सिंचन पद्धत सर्वोत्तम. काढणीपूर्वी १०-१२ दिवस पाणी पूर्णपणे बंद करावे.',
  '[{"stage":"Basal Application at Transplanting (लागवड करताना)","n":"33%","p":"100%","k":"50%","organic":"Sulphur 15 kg/acre + 10:26:26 (1 bag)","notesEn":"Sulphur is crucial for onion pungency, bulb firmness, and storage life.","notesMr":"कांद्याचा तिखटपणा, रंग आणि टिकवणक्षमता वाढवण्यासाठी एकरी १५ किलो गंधक (Sulphur) देणे आवश्यक आहे."},{"stage":"30 Days after Transplanting (३० दिवसांनी)","n":"33%","p":"0%","k":"0%","notesEn":"Top dress 50 kg Urea per acre.","notesMr":"एकरी १ गोणी युरिया द्यावा."},{"stage":"45-50 Days after Transplanting (४५-५० दिवसांनी)","n":"34%","p":"0%","k":"50%","notesEn":"Final dose: Urea 25 kg + MOP 25 kg or 0:0:50 spray for bulb filling.","notesMr":"कांदा पोसण्यासाठी पालाशची मात्रा किंवा ००:००:५० ची फवारणी करावी."}]'::jsonb,
  '[{"nameEn":"Nursery Stage","nameMr":"रोपवाटिका अवस्था","durationDays":"1 to 45 Days","activitiesEn":"Nursery bed management, damping-off control.","activitiesMr":"रोप तयार करणे, मर रोगापासून संरक्षण."},{"nameEn":"Transplantation & Establishment","nameMr":"पुनर्लागवड व मुळे धरणे","durationDays":"45 to 65 Days","activitiesEn":"Transplanting, initial light irrigation, gap filling.","activitiesMr":"लागवड, हलके पाणी देणे व रोपे स्थिर करणे."},{"nameEn":"Bulb Development Stage","nameMr":"कांदा पोसण्याची अवस्था","durationDays":"65 to 110 Days","activitiesEn":"Thrips monitoring, purple blotch prevention, potash application.","activitiesMr":"फुलकिडे (थ्रिप्स) नियंत्रण, करपा प्रतिबंध, पालाश खत नियोजन."},{"nameEn":"Neck Fall & Maturity","nameMr":"मान पडणे व पक्वता","durationDays":"110 to 135 Days","activitiesEn":"Stop irrigation when 50% neck falls. Pull bulbs for curing.","activitiesMr":"५०% माना पडल्यावर पाणी बंद करणे व काढणी करून वाळवणे."}]'::jsonb,
  '[{"nameEn":"Thrips (फुलकिडे / मावा)","nameMr":"फुलकिडे (Thrips tabaci)","symptomsEn":"Silvery white patches and curled leaves caused by sap sucking nymphs and adults.","symptomsMr":"पानांवर पांढुरके चट्टे पडतात, पाने वाकडी होतात व पिकाची वाढ खुंटते.","managementEn":"Install blue/yellow sticky traps. Spray Fipronil 5% SC (1.5 ml/L) or Spinetoram (1 ml/L).","managementMr":"निळे चिकट सापळे लावावेत. फिप्रोनिल ५% एससी (१.५ मिली/लिटर) फवारावे."}]'::jsonb,
  '[{"nameEn":"Purple Blotch / Karpa (जांभळा करपा)","nameMr":"जांभळा करपा रोग (Alternaria porri)","symptomsEn":"Sunken, purple to dark brown spots on leaves with concentric rings leading to leaf dieback.","symptomsMr":"पानांवर मध्यभागी जांभळट-तपकिरी रंगाचे लांबट चट्टे पडतात व पाने सुकू लागतात.","managementEn":"Spray Custodia or Mancozeb 75 WP (2.5 gm/L) with sticker (स्प्रेडर/स्टिकर).","managementMr":"मॅन्कोझेब (२.५ ग्रॅम/लिटर) किंवा कस्टोडिया बुरशीनाशक स्टिकर मिसळून फवारावे."}]'::jsonb,
  'Apply Oxyfluorfen 23.5% EC (Goal) @ 100-120 ml per acre at 15-20 days after transplanting when weeds are in 2-3 leaf stage.',
  'लागवडीनंतर १५-२० दिवसांनी गोल (ऑक्सीफ्लुरफेन) १००-१२० मिली प्रति एकर या प्रमाणात फवारावे.',
  'Harvest when 50-70% of plant tops have fallen over (neck fall). Field cure under shade with leaves intact for 4-5 days.',
  '५० ते ७०% कांद्याच्या माना पडल्यावर काढणी करावी. शेतात पाला झाकून ४-५ दिवस सावलीत सुकवावे.',
  'Cut tops leaving 2.5 cm neck. Grade bulbs and store in well-ventilated traditional onion Chawls.',
  'कांद्याची मान २ ते २.५ सेंमी ठेवून कापावी. प्रतवारी करून हवेशीर कांदा चाळीत साठवावा.',
  ARRAY['Applying excess nitrogen late in the season which causes thick-necked onions and rapid rotting in storage.', 'Harvesting prematurely before neck fall.', 'Neglecting Sulphur fertilization during basal dressing.']::text[],
  ARRAY['कांदा पोसताना उशिरा युरिया देणे ज्यामुळे कांद्याची मान जाड होते व चाळीत सडतो.', 'माना पडण्यापूर्वी घाईघाईने काढणी करणे.', 'लागवडीच्या वेळी गंधक न वापरणे.']::text[],
  '[{"qEn":"How to prevent onion rotting in storage chawl?","qMr":"कांदा चाळीत सडू नये म्हणून काय करावे?","aEn":"Stop watering 15 days before harvest, cure bulbs thoroughly, do not apply late nitrogen, and ensure cross-ventilation in storage.","aMr":"काढणीपूर्वी १५ दिवस पाणी बंद करा, मान व्यवस्थित वाळवा, उशिरा युरिया देऊ नका आणि चाळीत खेळती हवा ठेवा."}]'::jsonb,
  ARRAY['Seeds', 'Fertilizers', 'Fungicides', 'Insecticides']::text[],
  'published',
  'Directorate of Onion and Garlic Research (DOGR), Rajgurunagar, Pune'
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mr = EXCLUDED.name_mr,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  seasons = EXCLUDED.seasons,
  intro_en = EXCLUDED.intro_en,
  intro_mr = EXCLUDED.intro_mr,
  climate_en = EXCLUDED.climate_en,
  climate_mr = EXCLUDED.climate_mr,
  temperature_range = EXCLUDED.temperature_range,
  soil_en = EXCLUDED.soil_en,
  soil_mr = EXCLUDED.soil_mr,
  sowing_season_en = EXCLUDED.sowing_season_en,
  sowing_season_mr = EXCLUDED.sowing_season_mr,
  land_preparation_en = EXCLUDED.land_preparation_en,
  land_preparation_mr = EXCLUDED.land_preparation_mr,
  seed_selection_en = EXCLUDED.seed_selection_en,
  seed_selection_mr = EXCLUDED.seed_selection_mr,
  seed_treatment_en = EXCLUDED.seed_treatment_en,
  seed_treatment_mr = EXCLUDED.seed_treatment_mr,
  seed_rate = EXCLUDED.seed_rate,
  spacing = EXCLUDED.spacing,
  sowing_method_en = EXCLUDED.sowing_method_en,
  sowing_method_mr = EXCLUDED.sowing_method_mr,
  irrigation_en = EXCLUDED.irrigation_en,
  irrigation_mr = EXCLUDED.irrigation_mr,
  fertilizer_schedule = EXCLUDED.fertilizer_schedule,
  growth_stages = EXCLUDED.growth_stages,
  pests = EXCLUDED.pests,
  diseases = EXCLUDED.diseases,
  weed_management_en = EXCLUDED.weed_management_en,
  weed_management_mr = EXCLUDED.weed_management_mr,
  harvesting_en = EXCLUDED.harvesting_en,
  harvesting_mr = EXCLUDED.harvesting_mr,
  post_harvest_en = EXCLUDED.post_harvest_en,
  post_harvest_mr = EXCLUDED.post_harvest_mr,
  common_mistakes_en = EXCLUDED.common_mistakes_en,
  common_mistakes_mr = EXCLUDED.common_mistakes_mr,
  faqs = EXCLUDED.faqs,
  related_product_categories = EXCLUDED.related_product_categories,
  status = EXCLUDED.status,
  sources = EXCLUDED.sources,
  updated_at = now();

INSERT INTO public.crops (
  name_en,
  name_mr,
  slug,
  category,
  image_url,
  seasons,
  intro_en,
  intro_mr,
  climate_en,
  climate_mr,
  temperature_range,
  soil_en,
  soil_mr,
  sowing_season_en,
  sowing_season_mr,
  land_preparation_en,
  land_preparation_mr,
  seed_selection_en,
  seed_selection_mr,
  seed_treatment_en,
  seed_treatment_mr,
  seed_rate,
  spacing,
  sowing_method_en,
  sowing_method_mr,
  irrigation_en,
  irrigation_mr,
  fertilizer_schedule,
  growth_stages,
  pests,
  diseases,
  weed_management_en,
  weed_management_mr,
  harvesting_en,
  harvesting_mr,
  post_harvest_en,
  post_harvest_mr,
  common_mistakes_en,
  common_mistakes_mr,
  faqs,
  related_product_categories,
  status,
  sources
)
VALUES (
  'Soybean',
  'सोयाबीन',
  'soybean',
  'Field',
  'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80',
  ARRAY['Kharif (June-October)']::text[],
  'Soybean (Glycine max) is a major Kharif oilseed and protein-rich pulse crop in Maharashtra. It restores soil fertility through biological nitrogen fixation.',
  'सोयाबीन हे महाराष्ट्रातील खरीप हंगामातील अत्यंत महत्त्वाचे तेलबिया पीक आहे. मुळांवरील गाठींमुळे हे पीक जमिनीची सुपीकता वाढवते.',
  'Warm and moist climate. Requires well-distributed rainfall of 600-750 mm.',
  'उष्ण व दमट हवामान. ६०० ते ७५० मिमी नियमित पाऊस पिकासाठी अनुकूल असतो.',
  '22°C to 32°C',
  'Well-drained fertile black soil with good water retention. Avoid highly saline soils.',
  'मध्यम ते भारी, पाण्याचा उत्तम निचरा होणारी सुपीक काळी जमीन.',
  'June 20 to July 10, after receipt of 75-100 mm monsoon soaking rainfall.',
  '२० जून ते १० जुलै, जमिनीत ७५ ते १०० मिमी ओलावा झाल्यावरच पेरणी करावी.',
  '1 plowing and 2 harrowings. Sowing with BBF (Broad Bed Furrow) planter recommended for climate resilience.',
  '१ नांगरट व २ कुळवाच्या पाळ्या. बीबीएफ (रुंद वरंबा-सरी) यंत्राने पेरणी करणे अत्यंत फायदेशीर ठरते.',
  'JS 335, JS 93-05, Phule Sangam (KDS 726), Phule Kimaya (KDS 753).',
  'फुले संगम (केडीएस ७२६), फुले किमया (केडीएस ७५३), जेएस ३३५ किंवा जेएस ९३-०५.',
  'Bradyrhizobium japonicum (250 gm) + PSB (250 gm) + Trichoderma (5 gm/kg) per 10 kg seed.',
  '१० किलो बियाण्यास २५० ग्रॅम रायझोबियम जिवाणू खत + २५० ग्रॅम पीएसबी + ५० ग्रॅम ट्रायकोडर्मा लावावे.',
  '25 to 30 kg per acre (variety dependent)',
  '45 cm between rows, 5 to 7 cm between plants',
  'Sow at 3-4 cm depth with seed drill. Avoid deep sowing which reduces emergence.',
  'बियाणे ३ ते ४ सेंमी खोलीवर पेरावे. जास्त खोल पेरल्यास उगवण क्षमता घटते.',
  'Rainfed crop; supplemental irrigation during flowering (40-45 DAS) and pod filling (60-70 DAS) if dry spells occur.',
  'मुख्यत्वे पावसावर अवलंबून; परंतु फुलोरा व शेंगा भरण्याच्या काळात पावसाचा खंड पडल्यास संरक्षित पाणी द्यावे.',
  '[{"stage":"Basal Application at Sowing (पेरणीच्या वेळी)","n":"12 kg","p":"24 kg","k":"12 kg","organic":"Sulphur 10 kg/acre + DAP or 10:26:26","notesEn":"Apply complete dose at the time of sowing. Sulphur increases oil content.","notesMr":"पेरणीवेळी एकरी १ गोणी १०:२६:२६ किंवा डीएपी + १० किलो गंधक द्यावे."}]'::jsonb,
  '[{"nameEn":"Germination & Seedling","nameMr":"उगवण व रोप अवस्था","durationDays":"1 to 20 Days","activitiesEn":"Ensure proper stand, weed control.","activitiesMr":"उगवण तपासणे, तण नियंत्रण."},{"nameEn":"Flowering Stage","nameMr":"फुलोरा अवस्था","durationDays":"35 to 55 Days","activitiesEn":"Critical irrigation if rain halts, avoid pesticide spray during peak bee activity.","activitiesMr":"पाण्याचा ताण पडू न देणे, मधमाश्यांच्या परागीभवनास बाधा न आणणे."},{"nameEn":"Pod Development & Maturity","nameMr":"शेंगा भरणे व पक्वता","durationDays":"60 to 105 Days","activitiesEn":"Pod borer management, timely harvest before shattering.","activitiesMr":"शेंगा पोखरणाऱ्या अळीचे नियंत्रण, शेंगा फुटण्यापूर्वी वेळेवर कापणी."}]'::jsonb,
  '[{"nameEn":"Girdle Beetle & Stem Fly (चकती भुंगा व खोडमाशी)","nameMr":"चकती भुंगा व खोडमाशी","symptomsEn":"Girdling cuts on stem causing upper branches to wilt and dry.","symptomsMr":"फांदीवर गोलाकार खाचा पाडल्याने वरील शेंडा वाळतो.","managementEn":"Spray Chlorantraniliprole 18.5% SC (Coragen) @ 3 ml per 10 liters.","managementMr":"कोराजन (३ मिली/१० लिटर) किंवा थायामेथोक्सम फवारावे."}]'::jsonb,
  '[{"nameEn":"Rust & Anthracnose (तांबेरा व शेंगावरील करपा)","nameMr":"तांबेरा व शेंगावरील करपा","symptomsEn":"Brown pustules underneath leaves in rust; dark sunken spots on pods in anthracnose.","symptomsMr":"पानांच्या खाली तांबूस रंगाचे ठिपके पडतात व शेंगांवर काळे चट्टे येतात.","managementEn":"Spray Tebuconazole 25.9% EC @ 1 ml/liter.","managementMr":"टेबुकोनॅझोल (१ मिली/लिटर) किंवा प्रोपिकोनाझोल फवारावे."}]'::jsonb,
  'Apply pre-emergence herbicide like Pendimethalin 38.7% CS @ 700 ml/acre within 48 hours of sowing on moist soil.',
  'पेरणीनंतर ४८ तासांच्या आत ओल असताना पेंडीमिथॅलीन ७०० मिली प्रति एकर फवारावे.',
  'Harvest when 90% leaves turn yellow and drop off, and pods make a rattling sound when shaken.',
  '९०% पाने पिवळी पडून गळल्यावर आणि शेंगा खुळखुळ वाजल्यावर कापणी करावी.',
  'Dry pods in sun to 10-12% seed moisture before threshing. Set thresher RPM low (350-400) to prevent seed coat cracking.',
  'मळणी करताना मळणी यंत्राची गती मध्यम ठेवावी, जेणेकरून बियाण्याला तडे जाणार नाहीत.',
  ARRAY['Sowing in dry soil before adequate rainfall.', 'High thresher RPM cracking the seed embryo.', 'Skipping bio-fertilizer seed treatment.']::text[],
  ARRAY['पुरेसा पाऊस पडण्यापूर्वी घाईघाईने कोरड्यात पेरणी करणे.', 'मळणी यंत्राचा वेग जास्त ठेवून बियाणे फोडणे.', 'रायझोबियम जिवाणू संवर्धक न वापरणे.']::text[],
  '[{"qEn":"Why is Phule Sangam (KDS 726) so popular?","qMr":"फुले संगम (KDS 726) वाण इतका लोकप्रिय का आहे?","aEn":"Phule Sangam yields 12-15 quintals per acre, has high resistance to rust, and pods do not shatter easily.","aMr":"फुले संगम वाण तांबेरा रोगास प्रतिकारक असून एकरी १२ ते १५ क्विंटल उत्पादन देते आणि शेंगा लवकर फुटत नाहीत."}]'::jsonb,
  ARRAY['Seeds', 'Fertilizers', 'Insecticides', 'Fungicides']::text[],
  'published',
  'Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri'
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_mr = EXCLUDED.name_mr,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  seasons = EXCLUDED.seasons,
  intro_en = EXCLUDED.intro_en,
  intro_mr = EXCLUDED.intro_mr,
  climate_en = EXCLUDED.climate_en,
  climate_mr = EXCLUDED.climate_mr,
  temperature_range = EXCLUDED.temperature_range,
  soil_en = EXCLUDED.soil_en,
  soil_mr = EXCLUDED.soil_mr,
  sowing_season_en = EXCLUDED.sowing_season_en,
  sowing_season_mr = EXCLUDED.sowing_season_mr,
  land_preparation_en = EXCLUDED.land_preparation_en,
  land_preparation_mr = EXCLUDED.land_preparation_mr,
  seed_selection_en = EXCLUDED.seed_selection_en,
  seed_selection_mr = EXCLUDED.seed_selection_mr,
  seed_treatment_en = EXCLUDED.seed_treatment_en,
  seed_treatment_mr = EXCLUDED.seed_treatment_mr,
  seed_rate = EXCLUDED.seed_rate,
  spacing = EXCLUDED.spacing,
  sowing_method_en = EXCLUDED.sowing_method_en,
  sowing_method_mr = EXCLUDED.sowing_method_mr,
  irrigation_en = EXCLUDED.irrigation_en,
  irrigation_mr = EXCLUDED.irrigation_mr,
  fertilizer_schedule = EXCLUDED.fertilizer_schedule,
  growth_stages = EXCLUDED.growth_stages,
  pests = EXCLUDED.pests,
  diseases = EXCLUDED.diseases,
  weed_management_en = EXCLUDED.weed_management_en,
  weed_management_mr = EXCLUDED.weed_management_mr,
  harvesting_en = EXCLUDED.harvesting_en,
  harvesting_mr = EXCLUDED.harvesting_mr,
  post_harvest_en = EXCLUDED.post_harvest_en,
  post_harvest_mr = EXCLUDED.post_harvest_mr,
  common_mistakes_en = EXCLUDED.common_mistakes_en,
  common_mistakes_mr = EXCLUDED.common_mistakes_mr,
  faqs = EXCLUDED.faqs,
  related_product_categories = EXCLUDED.related_product_categories,
  status = EXCLUDED.status,
  sources = EXCLUDED.sources,
  updated_at = now();

-- ==============================================================================
-- 3. SEED ARTICLES (2 Agronomy Educational Articles)
-- ==============================================================================
INSERT INTO public.articles (
  title_en,
  title_mr,
  slug,
  category,
  summary_en,
  summary_mr,
  content_en,
  content_mr,
  image_url,
  source_references,
  status
)
VALUES (
  'Understanding N-P-K & Secondary Nutrients: A Practical Guide for Farmers',
  'नत्र-स्फुरद-पालाश आणि दुय्यम अन्नद्रव्ये: शेतकऱ्यांसाठी मार्गदर्शक',
  'understanding-npk-and-secondary-nutrients',
  'Fertilizer Management',
  'Learn what Nitrogen, Phosphorus, and Potassium actually do in your crops and how to balance chemical fertilizers with organic matter.',
  'नत्र, स्फुरद आणि पालाश पिकासाठी नेमके काय काम करतात आणि रासायनिक खतांचा समतोल सेंद्रिय खतांसोबत कसा ठेवावा याविषयी सविस्तर माहिती.',
  '### The Three Macro-Nutrients Explained

Every agricultural crop requires 16 to 17 essential nutrient elements. The three primary macro-nutrients consumed in the largest quantities are Nitrogen (N), Phosphorus (P), and Potassium (K).

#### 1. Nitrogen (N) — The Growth Driver
- **What it does:** Builds chlorophyll, amino acids, and plant proteins.
- **Signs of Deficiency:** Older bottom leaves turn pale yellow starting from the leaf tip. Crop appears stunted with thin stalks.
- **Excess Hazards:** Applying excess Urea causes weak, succulent stalks that lodge easily in winds, attracts sucking pests, and delays flowering.

#### 2. Phosphorus (P) — The Root & Flower Architect
- **What it does:** Drives early root establishment, energy transfer (ATP), and flower initiation.
- **Signs of Deficiency:** Leaves turn dark green with reddish-purple tints along veins. Poor tillering in sugarcane and wheat.
- **Practical Rule:** Phosphorus moves very slowly in soil. Always place it deep in the root zone during basal application rather than broadcasting on the surface.

#### 3. Potassium (K) — The Quality & Defense Pillar
- **What it does:** Regulates stomatal opening, water balance, starch synthesis, and grain/fruit filling.
- **Signs of Deficiency:** Leaf margins and tips scorch and dry up (''leaf burn''). Produce has poor shelf life and dull color.

### Secondary Nutrients Matter
- **Sulphur (S):** Crucial for oil synthesis in soybean and pungency/color in onion.
- **Calcium (Ca) & Magnesium (Mg):** Essential for cell wall rigidity and chlorophyll core.',
  '### मुख्य अन्नद्रव्यांचे पिकातील कार्य

पिकाच्या सर्वांगीण वाढीसाठी १६ ते १७ आवश्यक अन्नद्रव्यांची गरज असते. त्यातील नत्र (N), स्फुरद (P) आणि पालाश (K) ही मुख्य अन्नद्रव्ये पिकाला मोठ्या प्रमाणात लागतात.

#### १. नत्र (Nitrogen - N): शाकीय वाढीचा इंजिन
- **मुख्य कार्य:** पानांमध्ये हरीतद्रव्य (क्लोरोफिल) तयार करणे, झाडाची उंची आणि फुटवे वाढवणे.
- **कमतरतेची लक्षणे:** खालची जुनी पाने टोकाकडून पिवळी पडतात. झाडांची वाढ खुंटते.
- **अतिवापराचे दुष्परिणाम:** युरियाचा अतिरेक केल्यास झाड लुसलुशीत होऊन किडी-रोगांना बळी पडते आणि वाऱ्याने लोळते.

#### २. स्फुरद (Phosphorus - P): मुळे व फुलोऱ्याचा पाया
- **मुख्य कार्य:** मुळांची जोमदार वाढ करणे, पिकाला ऊर्जा देणे आणि फुलांची संख्या वाढवणे.
- **कमतरतेची लक्षणे:** पानांच्या शिरा जांभळट-तांबूस होतात, मुळांची वाढ थांबते.
- **महत्त्वाची टीप:** स्फुरदयुक्त खते (उदा. सिंगल सुपर फॉस्फेट किंवा डीएपी) फेकून न देता नेहमी मुळांच्या सानिध्यात खोलवर द्यावीत.

#### ३. पालाश (Potassium - K): वजन, चकाकी व रोगप्रतिकार
- **मुख्य कार्य:** पिकाची रोगप्रतिकारक्षमता वाढवणे, पाण्याचा ताण सहन करणे आणि फळे/दाण्यांचे वजन व चकाकी वाढवणे.
- **कमतरतेची लक्षणे:** पानांच्या कडा करपल्यासारख्या दिसतात.

### दुय्यम अन्नद्रव्यांचे महत्त्व
- **गंधक (Sulphur):** कांद्याचा तिखटपणा आणि सोयाबीन, भुईमुगातील तेलाचे प्रमाण वाढवण्यासाठी गंधक अत्यंत गरजेचे आहे.',
  'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&auto=format&fit=crop&q=80',
  'ICAR Indian Institute of Soil Science, Bhopal',
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_mr = EXCLUDED.title_mr,
  category = EXCLUDED.category,
  summary_en = EXCLUDED.summary_en,
  summary_mr = EXCLUDED.summary_mr,
  content_en = EXCLUDED.content_en,
  content_mr = EXCLUDED.content_mr,
  image_url = EXCLUDED.image_url,
  source_references = EXCLUDED.source_references,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.articles (
  title_en,
  title_mr,
  slug,
  category,
  summary_en,
  summary_mr,
  content_en,
  content_mr,
  image_url,
  source_references,
  status
)
VALUES (
  'Safe Pesticide Application, Label Reading & Pre-Harvest Intervals (PHI)',
  'कीटकनाशकांचा सुरक्षित वापर, लेबल वाचन आणि काढणीपूर्व प्रतीक्षा काळ (PHI)',
  'safe-pesticide-application-and-phi-guidelines',
  'Crop Protection',
  'A safety guide on reading chemical bottle color triangles, wearing PPE, proper nozzle calibration, and avoiding toxic residues on vegetables.',
  'औषधांच्या बाटलीवरील धोक्याचे त्रिकोण ओळखणे, संरक्षक किट वापरणे आणि फवारणीनंतर काढणी कधी करावी (PHI) याविषयी महत्त्वाची माहिती.',
  '### Reading Indian Pesticide Toxicity Triangles

Every pesticide sold in India features a mandatory toxicity identification triangle on the container:
- **Red Triangle (Extremely Toxic):** Oral LD50 < 50 mg/kg. Highest caution, restricted usage.
- **Yellow Triangle (Highly Toxic):** Oral LD50 50-500 mg/kg. Requires complete protective gear.
- **Blue Triangle (Moderately Toxic):** Oral LD50 500-5000 mg/kg. Common in agricultural formulations.
- **Green Triangle (Slightly Toxic):** Oral LD50 > 5000 mg/kg. Relatively safer, but basic hygiene mandatory.

### What is Pre-Harvest Interval (PHI)?
Pre-Harvest Interval (काढणीपूर्व प्रतीक्षा काळ) is the minimum number of days that must elapse between the last chemical pesticide spray and the harvesting of crops for consumption or market.

| Crop | Chemical | Recommended PHI |
|---|---|---|
| Tomato | Coragen (Chlorantraniliprole) | 3 Days |
| Tomato | Mancozeb | 7-10 Days |
| Onion | Custodia (Azoxystrobin+Tebuconazole) | 10-14 Days |
| Sugarcane | Atrazine Herbicide | 60+ Days |

Failure to observe PHI leads to chemical residues that fail food safety lab tests and harm consumer health.',
  '### कीटकनाशकांच्या बाटलीवरील विषारीपणाचे त्रिकोण

भारतातील प्रत्येक कीटकनाशकाच्या लेबलवर खालीलप्रमाणे रंगीत त्रिकोण दिलेला असतो:
- **लाल त्रिकोण (अत्यंत विषारी):** अत्यंत घातक, हाताळताना सर्वोच्च खबरदारी आवश्यक.
- **पिवळा त्रिकोण (जास्त विषारी):** संपूर्ण सुरक्षा साधने (मास्क, गॉगल) वापरणे अनिवार्य.
- **निळा त्रिकोण (मध्यम विषारी):** शेतीमध्ये सामान्यतः वापरली जाणारी औषधे.
- **हिरवा त्रिकोण (कमी विषारी):** सेंद्रिय व जैविक औषधे.

### काढणीपूर्व प्रतीक्षा काळ (PHI) म्हणजे काय?
फवारणी केल्याच्या दिवसापासून ते भाजीपाला/फळे काढणी करण्यापर्यंतचा जो सुरक्षित कालावधी पाळावा लागतो त्याला **PHI (Pre-Harvest Interval)** म्हणतात.

| पीक | औषध | पाळावयाचे दिवस (PHI) |
|---|---|---|
| टोमॅटो | कोराजन | ३ दिवस |
| कांदा | कस्टोडिया | १० ते १४ दिवस |
| भाजीपाला | प्रोक्लेम | ५ दिवस |

हा कालावधी न पाळल्यास शेतमालावर विषारी अंश राहतात जे ग्राहकांच्या आरोग्यास घातक ठरतात.',
  'https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=800&auto=format&fit=crop&q=80',
  'Central Insecticides Board & Registration Committee (CIBRC), Govt of India',
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_mr = EXCLUDED.title_mr,
  category = EXCLUDED.category,
  summary_en = EXCLUDED.summary_en,
  summary_mr = EXCLUDED.summary_mr,
  content_en = EXCLUDED.content_en,
  content_mr = EXCLUDED.content_mr,
  image_url = EXCLUDED.image_url,
  source_references = EXCLUDED.source_references,
  status = EXCLUDED.status,
  updated_at = now();

-- ==============================================================================
-- 4. VALIDATION ASSERTIONS
-- ==============================================================================
DO $$
DECLARE
  v_prod_count integer;
  v_crop_count integer;
  v_art_count integer;
BEGIN
  SELECT count(*) INTO v_prod_count FROM public.products;
  SELECT count(*) INTO v_crop_count FROM public.crops;
  SELECT count(*) INTO v_art_count FROM public.articles;

  IF v_prod_count < 6 THEN
    RAISE EXCEPTION 'Validation failed: Expected at least 6 products, found %', v_prod_count;
  END IF;

  IF v_crop_count < 3 THEN
    RAISE EXCEPTION 'Validation failed: Expected at least 3 crops, found %', v_crop_count;
  END IF;

  IF v_art_count < 2 THEN
    RAISE EXCEPTION 'Validation failed: Expected at least 2 articles, found %', v_art_count;
  END IF;

  RAISE NOTICE 'Seed validation passed: % products, % crops, % articles verified.',
    v_prod_count, v_crop_count, v_art_count;
END $$;

COMMIT;
