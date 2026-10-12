-- ==============================================================================
-- Migration: 20261011120000_create_initial_schema.sql
-- Description: Core relational schema for Rushi Krushi Seva Kendra
-- Compatible with: Supabase PostgreSQL (Mumbai region / ap-south-1)
-- ==============================================================================

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Generic function for updating timestamps (hardened with search_path)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ==============================================================================
-- 3. PROFILES TABLE (Farmer & Store Admin profiles extending auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text UNIQUE,
  email text,
  role text NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
  preferred_language text NOT NULL DEFAULT 'mr' CHECK (preferred_language IN ('en', 'mr')),
  is_verified boolean DEFAULT true NOT NULL,
  village text DEFAULT '',
  taluka text DEFAULT 'Ambegaon',
  district text DEFAULT 'Pune',
  farm_area text DEFAULT '',
  soil_type text DEFAULT '',
  irrigation_method text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT chk_profiles_name_length CHECK (length(trim(name)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile record when a new user signs up in auth.users
-- Uses NULLIF to ensure empty strings are stored as NULL (avoiding UNIQUE collisions)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_phone text;
  clean_email text;
BEGIN
  clean_phone := NULLIF(TRIM(COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', '')), '');
  clean_email := NULLIF(TRIM(COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')), '');

  INSERT INTO public.profiles (
    id,
    name,
    phone,
    email,
    role,
    preferred_language,
    village,
    taluka,
    district,
    farm_area,
    soil_type,
    irrigation_method
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), 'Farmer Member'),
    clean_phone,
    clean_email,
    'farmer', -- New self-registered accounts are ALWAYS farmers (prevents privilege escalation)
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'preferred_language'), ''), 'mr'),
    COALESCE(NEW.raw_user_meta_data->>'village', ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'taluka'), ''), 'Ambegaon'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'district'), ''), 'Pune'),
    COALESCE(NEW.raw_user_meta_data->>'farm_area', ''),
    COALESCE(NEW.raw_user_meta_data->>'soil_type', ''),
    COALESCE(NEW.raw_user_meta_data->>'irrigation_method', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. PRODUCTS TABLE (Bilingual retail store agricultural input catalog)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_mr text NOT NULL,
  slug text UNIQUE NOT NULL,
  brand text NOT NULL,
  category text NOT NULL CHECK (
    category IN (
      'Seeds',
      'Fertilizers',
      'Micronutrients',
      'Biofertilizers',
      'Insecticides',
      'Fungicides',
      'Herbicides',
      'Plant Growth Promoters',
      'Organic Inputs',
      'Farming Tools',
      'Spray Pumps',
      'Irrigation Accessories',
      'Other'
    )
  ),
  image_url text DEFAULT '',
  description_en text DEFAULT '',
  description_mr text DEFAULT '',
  pack_sizes text[] DEFAULT '{}'::text[] NOT NULL,
  technical_composition text DEFAULT '',
  applicable_crops text[] DEFAULT '{}'::text[] NOT NULL,
  intended_use text DEFAULT '',
  dosage text DEFAULT '',
  safety_precautions_en text DEFAULT '',
  safety_precautions_mr text DEFAULT '',
  manufacturer text DEFAULT '',
  indicative_price text DEFAULT '',
  availability text NOT NULL DEFAULT 'in_stock' CHECK (
    availability IN ('in_stock', 'out_of_stock', 'seasonal')
  ),
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published' CHECK (
    status IN ('published', 'draft')
  ),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT chk_products_name_en CHECK (length(trim(name_en)) >= 2),
  CONSTRAINT chk_products_name_mr CHECK (length(trim(name_mr)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(availability);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);

-- Trigram indexes for fast search in English and Marathi
CREATE INDEX IF NOT EXISTS idx_products_search_en ON public.products USING gin(name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_search_mr ON public.products USING gin(name_mr gin_trgm_ops);

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 5. CROPS TABLE (Comprehensive crop cultivation guides & agronomy advice)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_mr text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('Field', 'Vegetable', 'Fruit')),
  image_url text DEFAULT '',
  seasons text[] DEFAULT '{}'::text[] NOT NULL,
  intro_en text DEFAULT '',
  intro_mr text DEFAULT '',
  climate_en text DEFAULT '',
  climate_mr text DEFAULT '',
  temperature_range text DEFAULT '',
  soil_en text DEFAULT '',
  soil_mr text DEFAULT '',
  sowing_season_en text DEFAULT '',
  sowing_season_mr text DEFAULT '',
  land_preparation_en text DEFAULT '',
  land_preparation_mr text DEFAULT '',
  seed_selection_en text DEFAULT '',
  seed_selection_mr text DEFAULT '',
  seed_treatment_en text DEFAULT '',
  seed_treatment_mr text DEFAULT '',
  seed_rate text DEFAULT '',
  spacing text DEFAULT '',
  sowing_method_en text DEFAULT '',
  sowing_method_mr text DEFAULT '',
  irrigation_en text DEFAULT '',
  irrigation_mr text DEFAULT '',
  fertilizer_schedule jsonb DEFAULT '[]'::jsonb NOT NULL,
  growth_stages jsonb DEFAULT '[]'::jsonb NOT NULL,
  pests jsonb DEFAULT '[]'::jsonb NOT NULL,
  diseases jsonb DEFAULT '[]'::jsonb NOT NULL,
  weed_management_en text DEFAULT '',
  weed_management_mr text DEFAULT '',
  harvesting_en text DEFAULT '',
  harvesting_mr text DEFAULT '',
  post_harvest_en text DEFAULT '',
  post_harvest_mr text DEFAULT '',
  common_mistakes_en text[] DEFAULT '{}'::text[] NOT NULL,
  common_mistakes_mr text[] DEFAULT '{}'::text[] NOT NULL,
  faqs jsonb DEFAULT '[]'::jsonb NOT NULL,
  related_product_categories text[] DEFAULT '{}'::text[] NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  sources text DEFAULT 'MPKV Rahuri & ICAR Guidelines',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT chk_crops_name_en CHECK (length(trim(name_en)) >= 2),
  CONSTRAINT chk_crops_name_mr CHECK (length(trim(name_mr)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_crops_slug ON public.crops(slug);
CREATE INDEX IF NOT EXISTS idx_crops_category ON public.crops(category);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(status);

DROP TRIGGER IF EXISTS trigger_crops_updated_at ON public.crops;
CREATE TRIGGER trigger_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 6. FARMER_CROPS TABLE (Private crop logs tracked by logged-in farmers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.farmer_crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  crop_ref uuid REFERENCES public.crops(id) ON DELETE SET NULL,
  variety text DEFAULT '',
  status text NOT NULL DEFAULT 'Growing' CHECK (
    status IN ('Planning', 'Growing', 'Harvested')
  ),
  sowing_date date DEFAULT CURRENT_DATE NOT NULL,
  farm_area text DEFAULT '',
  soil_type text DEFAULT '',
  irrigation_method text DEFAULT '',
  growth_stage text DEFAULT 'Vegetative',
  visible_problems text DEFAULT '',
  notes text DEFAULT '',
  photo_url text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT chk_farmer_crops_crop_name CHECK (length(trim(crop_name)) >= 1)
);

CREATE INDEX IF NOT EXISTS idx_farmer_crops_user_id ON public.farmer_crops(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_crops_crop_ref ON public.farmer_crops(crop_ref);
CREATE INDEX IF NOT EXISTS idx_farmer_crops_status ON public.farmer_crops(status);

DROP TRIGGER IF EXISTS trigger_farmer_crops_updated_at ON public.farmer_crops;
CREATE TRIGGER trigger_farmer_crops_updated_at
  BEFORE UPDATE ON public.farmer_crops
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 7. ARTICLES TABLE (Educational agronomy articles & seasonal advisories)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_mr text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL CHECK (
    category IN (
      'Fertilizer Management',
      'Crop Protection',
      'Soil Health',
      'Seasonal Advisory',
      'Irrigation Practices',
      'Organic Practices'
    )
  ),
  summary_en text DEFAULT '',
  summary_mr text DEFAULT '',
  content_en text NOT NULL,
  content_mr text NOT NULL,
  image_url text DEFAULT '',
  source_references text DEFAULT 'ICAR / MPKV Rahuri Agronomy Department',
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT chk_articles_title_en CHECK (length(trim(title_en)) >= 2),
  CONSTRAINT chk_articles_title_mr CHECK (length(trim(title_mr)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);

DROP TRIGGER IF EXISTS trigger_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 8. CONTACT_ENQUIRIES TABLE (Customer contact inquiries & agricultural queries)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text DEFAULT '',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'reviewed', 'resolved')
  ),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT chk_enquiries_name_length CHECK (length(trim(name)) >= 2),
  CONSTRAINT chk_enquiries_phone_length CHECK (length(trim(phone)) >= 10),
  CONSTRAINT chk_enquiries_subject_length CHECK (length(trim(subject)) >= 2),
  CONSTRAINT chk_enquiries_message_length CHECK (length(trim(message)) >= 5)
);

CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status ON public.contact_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created_at ON public.contact_enquiries(created_at DESC);

DROP TRIGGER IF EXISTS trigger_contact_enquiries_updated_at ON public.contact_enquiries;
CREATE TRIGGER trigger_contact_enquiries_updated_at
  BEFORE UPDATE ON public.contact_enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
