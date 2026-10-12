import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Validates whether an identifier is a standard 36-character UUID.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates whether an identifier is a 24-character hexadecimal MongoDB ObjectId.
 */
const MONGO_ID_REGEX = /^[0-9a-f]{24}$/i;

export const isUuid = (val) => typeof val === 'string' && UUID_REGEX.test(val);
export const isMongoId = (val) => typeof val === 'string' && MONGO_ID_REGEX.test(val);

/**
 * Sanitizes user input for PostgREST .or() filter expressions.
 * Strips delimiters (commas, parentheses, quotes, percent signs, and backslashes)
 * to avoid syntax errors in PostgREST query parameters.
 */
export const sanitizeSearchTerm = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[,()\\"%']/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Normalizes a public.products row from Supabase into the camelCase shape
 * expected by React UI components, while preserving snake_case and providing _id.
 */
export const transformProduct = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    id: row.id,
    slug: row.slug || '',
    nameEn: row.name_en || '',
    nameMr: row.name_mr || '',
    brand: row.brand || '',
    category: row.category || '',
    imageUrl: row.image_url || '/placeholder-agro.svg',
    descriptionEn: row.description_en || '',
    descriptionMr: row.description_mr || '',
    packSizes: Array.isArray(row.pack_sizes) ? row.pack_sizes : [],
    technicalComposition: row.technical_composition || '',
    applicableCrops: Array.isArray(row.applicable_crops) ? row.applicable_crops : [],
    intendedUse: row.intended_use || '',
    dosage: row.dosage || '',
    safetyPrecautionsEn: row.safety_precautions_en || '',
    safetyPrecautionsMr: row.safety_precautions_mr || '',
    manufacturer: row.manufacturer || '',
    indicativePrice: row.indicative_price || '',
    availability: row.availability || 'in_stock',
    isFeatured: Boolean(row.is_featured),
    status: row.status || 'published',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Normalizes a public.crops row from Supabase into the camelCase shape
 * expected by React UI components, while preserving snake_case and providing _id.
 */
export const transformCrop = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    id: row.id,
    slug: row.slug || '',
    nameEn: row.name_en || '',
    nameMr: row.name_mr || '',
    category: row.category || '',
    imageUrl: row.image_url || '/placeholder-agro.svg',
    seasons: Array.isArray(row.seasons) ? row.seasons : [],
    introEn: row.intro_en || '',
    introMr: row.intro_mr || '',
    climateEn: row.climate_en || '',
    climateMr: row.climate_mr || '',
    temperatureRange: row.temperature_range || '',
    soilEn: row.soil_en || '',
    soilMr: row.soil_mr || '',
    sowingSeasonEn: row.sowing_season_en || '',
    sowingSeasonMr: row.sowing_season_mr || '',
    landPreparationEn: row.land_preparation_en || '',
    landPreparationMr: row.land_preparation_mr || '',
    seedSelectionEn: row.seed_selection_en || '',
    seedSelectionMr: row.seed_selection_mr || '',
    seedTreatmentEn: row.seed_treatment_en || '',
    seedTreatmentMr: row.seed_treatment_mr || '',
    seedRate: row.seed_rate || '',
    spacing: row.spacing || '',
    sowingMethodEn: row.sowing_method_en || '',
    sowingMethodMr: row.sowing_method_mr || '',
    irrigationEn: row.irrigation_en || '',
    irrigationMr: row.irrigation_mr || '',
    fertilizerSchedule: Array.isArray(row.fertilizer_schedule) ? row.fertilizer_schedule : [],
    growthStages: Array.isArray(row.growth_stages) ? row.growth_stages : [],
    pests: Array.isArray(row.pests) ? row.pests : [],
    diseases: Array.isArray(row.diseases) ? row.diseases : [],
    weedManagementEn: row.weed_management_en || '',
    weedManagementMr: row.weed_management_mr || '',
    harvestingEn: row.harvesting_en || '',
    harvestingMr: row.harvesting_mr || '',
    postHarvestEn: row.post_harvest_en || '',
    postHarvestMr: row.post_harvest_mr || '',
    commonMistakesEn: Array.isArray(row.common_mistakes_en) ? row.common_mistakes_en : [],
    commonMistakesMr: Array.isArray(row.common_mistakes_mr) ? row.common_mistakes_mr : [],
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
    relatedProductCategories: Array.isArray(row.related_product_categories)
      ? row.related_product_categories
      : [],
    status: row.status || 'published',
    sources: row.sources || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Normalizes a public.articles row from Supabase into the camelCase shape
 * expected by React UI components, while preserving snake_case and providing _id.
 */
export const transformArticle = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    id: row.id,
    slug: row.slug || '',
    titleEn: row.title_en || '',
    titleMr: row.title_mr || '',
    category: row.category || '',
    summaryEn: row.summary_en || '',
    summaryMr: row.summary_mr || '',
    contentEn: row.content_en || '',
    contentMr: row.content_mr || '',
    imageUrl: row.image_url || '/placeholder-agro.svg',
    sourceReferences: row.source_references || '',
    status: row.status || 'published',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

let cachedBrands = null;
let lastBrandsFetch = 0;
const BRANDS_CACHE_TTL_MS = 60000;

/**
 * Fetches distinct brand names for published products to populate catalog filter dropdowns.
 */
export const fetchPublishedBrands = async () => {
  const now = Date.now();
  if (cachedBrands && now - lastBrandsFetch < BRANDS_CACHE_TTL_MS) {
    return cachedBrands;
  }

  const { data, error } = await supabase
    .from('products')
    .select('brand')
    .eq('status', 'published');

  if (error || !data) {
    return cachedBrands || [];
  }

  const uniqueBrands = Array.from(new Set(data.map((r) => r.brand).filter(Boolean))).sort();
  cachedBrands = uniqueBrands;
  lastBrandsFetch = now;
  return uniqueBrands;
};

/**
 * Reads published products from Supabase with search, filtering, and pagination.
 */
export const getSupabaseProducts = async (params = {}) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured');
  }

  const page = parseInt(params.page, 10) || 1;
  const limit = parseInt(params.limit, 10) || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('status', 'published');

  if (params.featured === 'true' || params.featured === true) {
    query = query.eq('is_featured', true);
  }
  if (params.category && params.category !== 'All') {
    query = query.eq('category', params.category);
  }
  if (params.brand && params.brand !== 'All') {
    query = query.eq('brand', params.brand);
  }
  if (params.availability && params.availability !== 'All') {
    query = query.eq('availability', params.availability);
  }
  if (params.search) {
    const cleanSearch = sanitizeSearchTerm(params.search);
    if (cleanSearch) {
      query = query.or(
        `name_en.ilike.%${cleanSearch}%,name_mr.ilike.%${cleanSearch}%,brand.ilike.%${cleanSearch}%,technical_composition.ilike.%${cleanSearch}%`
      );
    }
  }

  query = query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  const [productsResult, brands] = await Promise.all([
    query,
    fetchPublishedBrands(),
  ]);

  if (productsResult.error) {
    throw productsResult.error;
  }

  const rows = productsResult.data || [];
  const total = typeof productsResult.count === 'number' ? productsResult.count : rows.length;

  return {
    data: {
      success: true,
      count: rows.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      brands,
      products: rows.map(transformProduct),
    },
  };
};

/**
 * Reads a single published product from Supabase by slug or UUID, with related products.
 */
export const getSupabaseProduct = async (slugOrId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured');
  }
  if (!slugOrId) return null;

  // MongoDB ObjectIds belong to Express/MongoDB; do not query Supabase UUID column with them
  if (isMongoId(slugOrId)) {
    return null;
  }

  let query = supabase
    .from('products')
    .select('*')
    .eq('status', 'published');

  if (isUuid(slugOrId)) {
    query = query.eq('id', slugOrId);
  } else {
    query = query.eq('slug', slugOrId);
  }

  const { data: productRow, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  if (!productRow) {
    return null;
  }

  // Fetch up to 4 related published products in the same category
  const { data: relatedRows } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .eq('category', productRow.category)
    .neq('id', productRow.id)
    .limit(4);

  return {
    data: {
      success: true,
      product: transformProduct(productRow),
      related: (relatedRows || []).map(transformProduct),
    },
  };
};

/**
 * Reads published crops from Supabase with search, category filtering, and limits.
 */
export const getSupabaseCrops = async (params = {}) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured');
  }

  let query = supabase
    .from('crops')
    .select('*', { count: 'exact' })
    .eq('status', 'published');

  if (params.category && params.category !== 'All') {
    query = query.eq('category', params.category);
  }
  if (params.search) {
    const cleanSearch = sanitizeSearchTerm(params.search);
    if (cleanSearch) {
      query = query.or(`name_en.ilike.%${cleanSearch}%,name_mr.ilike.%${cleanSearch}%`);
    }
  }

  query = query.order('name_en', { ascending: true });

  if (params.limit) {
    const limit = parseInt(params.limit, 10);
    if (limit > 0) {
      query = query.limit(limit);
    }
  }

  const { data: rows, error, count } = await query;
  if (error) {
    throw error;
  }

  const list = rows || [];
  return {
    data: {
      success: true,
      count: list.length,
      total: typeof count === 'number' ? count : list.length,
      crops: list.map(transformCrop),
    },
  };
};

/**
 * Reads a single published crop guide from Supabase with related store products.
 */
export const getSupabaseCrop = async (slugOrId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured');
  }
  if (!slugOrId) return null;

  // MongoDB ObjectIds belong to Express/MongoDB; do not query Supabase UUID column with them
  if (isMongoId(slugOrId)) {
    return null;
  }

  let query = supabase
    .from('crops')
    .select('*')
    .eq('status', 'published');

  if (isUuid(slugOrId)) {
    query = query.eq('id', slugOrId);
  } else {
    query = query.eq('slug', slugOrId);
  }

  const { data: cropRow, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  if (!cropRow) {
    return null;
  }

  // Fetch related products matching this crop or associated categories
  let relatedProducts = [];
  try {
    const { data: directMatch } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .contains('applicable_crops', [cropRow.name_en])
      .limit(6);

    relatedProducts = directMatch ? [...directMatch] : [];

    if (
      relatedProducts.length < 4 &&
      Array.isArray(cropRow.related_product_categories) &&
      cropRow.related_product_categories.length > 0
    ) {
      const { data: catMatches } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .in('category', cropRow.related_product_categories)
        .limit(6);

      if (catMatches) {
        const seen = new Set(relatedProducts.map((p) => p.id));
        for (const p of catMatches) {
          if (!seen.has(p.id) && relatedProducts.length < 6) {
            seen.add(p.id);
            relatedProducts.push(p);
          }
        }
      }
    }
  } catch (relErr) {
    console.warn('[Catalog] Related products lookup warning:', relErr.message || relErr);
  }

  return {
    data: {
      success: true,
      crop: transformCrop(cropRow),
      relatedProducts: relatedProducts.map(transformProduct),
    },
  };
};

/**
 * Reads published educational articles from Supabase with search and category filtering.
 */
export const getSupabaseArticles = async (params = {}) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured');
  }

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('status', 'published');

  if (params.category && params.category !== 'All') {
    query = query.eq('category', params.category);
  }
  if (params.search) {
    const cleanSearch = sanitizeSearchTerm(params.search);
    if (cleanSearch) {
      query = query.or(
        `title_en.ilike.%${cleanSearch}%,title_mr.ilike.%${cleanSearch}%,summary_en.ilike.%${cleanSearch}%,summary_mr.ilike.%${cleanSearch}%`
      );
    }
  }

  query = query.order('created_at', { ascending: false });

  if (params.limit) {
    const limit = parseInt(params.limit, 10);
    if (limit > 0) {
      query = query.limit(limit);
    }
  }

  const { data: rows, error, count } = await query;
  if (error) {
    throw error;
  }

  const list = rows || [];
  return {
    data: {
      success: true,
      count: list.length,
      total: typeof count === 'number' ? count : list.length,
      articles: list.map(transformArticle),
    },
  };
};

/**
 * Reads a single published article from Supabase with related category articles.
 */
export const getSupabaseArticle = async (slugOrId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured');
  }
  if (!slugOrId) return null;

  // MongoDB ObjectIds belong to Express/MongoDB; do not query Supabase UUID column with them
  if (isMongoId(slugOrId)) {
    return null;
  }

  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published');

  if (isUuid(slugOrId)) {
    query = query.eq('id', slugOrId);
  } else {
    query = query.eq('slug', slugOrId);
  }

  const { data: articleRow, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  if (!articleRow) {
    return null;
  }

  // Fetch up to 3 related published articles in the same category
  const { data: relatedRows } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('category', articleRow.category)
    .neq('id', articleRow.id)
    .limit(3);

  return {
    data: {
      success: true,
      article: transformArticle(articleRow),
      related: (relatedRows || []).map(transformArticle),
    },
  };
};
