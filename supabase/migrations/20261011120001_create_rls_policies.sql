-- ==============================================================================
-- Migration: 20261011120001_create_rls_policies.sql
-- Description: Hardened Row Level Security (RLS), Admin Authorization & Storage Policies
-- Compatible with: Supabase PostgreSQL (Mumbai region / ap-south-1)
-- ==============================================================================

-- 1. Helper Function: Check if the executing user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Security Trigger: Prevent users from elevating themselves to admin role on BOTH INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Non-admins cannot self-assign the admin role
    IF NEW.role = 'admin' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access Denied: You cannot assign an administrator role to a new profile.';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Non-admins cannot alter their role or elevate privileges
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access Denied: You cannot modify user role or elevate privileges.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
CREATE TRIGGER trigger_protect_profile_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- ==============================================================================
-- 3. EXPLICIT LEAST-PRIVILEGE GRANTS
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.products, public.crops, public.articles TO anon;
GRANT INSERT ON public.contact_enquiries TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.farmer_crops, public.products, public.crops, public.articles, public.contact_enquiries TO authenticated;

-- ==============================================================================
-- 4. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. POLICIES: PROFILES TABLE
-- ==============================================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND (role = 'farmer' OR public.is_admin()));

-- ==============================================================================
-- 6. POLICIES: PRODUCTS TABLE
-- ==============================================================================
DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public"
  ON public.products
  FOR SELECT
  TO public
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "products_insert_admin_only" ON public.products;
CREATE POLICY "products_insert_admin_only"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_update_admin_only" ON public.products;
CREATE POLICY "products_update_admin_only"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_delete_admin_only" ON public.products;
CREATE POLICY "products_delete_admin_only"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 7. POLICIES: CROPS TABLE
-- ==============================================================================
DROP POLICY IF EXISTS "crops_select_public" ON public.crops;
CREATE POLICY "crops_select_public"
  ON public.crops
  FOR SELECT
  TO public
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "crops_insert_admin_only" ON public.crops;
CREATE POLICY "crops_insert_admin_only"
  ON public.crops
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "crops_update_admin_only" ON public.crops;
CREATE POLICY "crops_update_admin_only"
  ON public.crops
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "crops_delete_admin_only" ON public.crops;
CREATE POLICY "crops_delete_admin_only"
  ON public.crops
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 8. POLICIES: ARTICLES TABLE
-- ==============================================================================
DROP POLICY IF EXISTS "articles_select_public" ON public.articles;
CREATE POLICY "articles_select_public"
  ON public.articles
  FOR SELECT
  TO public
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "articles_insert_admin_only" ON public.articles;
CREATE POLICY "articles_insert_admin_only"
  ON public.articles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "articles_update_admin_only" ON public.articles;
CREATE POLICY "articles_update_admin_only"
  ON public.articles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "articles_delete_admin_only" ON public.articles;
CREATE POLICY "articles_delete_admin_only"
  ON public.articles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 9. POLICIES: FARMER_CROPS TABLE (Strict Isolation for Farmer Private Records)
-- ==============================================================================
DROP POLICY IF EXISTS "farmer_crops_select_owner_or_admin" ON public.farmer_crops;
CREATE POLICY "farmer_crops_select_owner_or_admin"
  ON public.farmer_crops
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "farmer_crops_insert_owner" ON public.farmer_crops;
CREATE POLICY "farmer_crops_insert_owner"
  ON public.farmer_crops
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "farmer_crops_update_owner" ON public.farmer_crops;
CREATE POLICY "farmer_crops_update_owner"
  ON public.farmer_crops
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "farmer_crops_delete_owner_or_admin" ON public.farmer_crops;
CREATE POLICY "farmer_crops_delete_owner_or_admin"
  ON public.farmer_crops
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- 10. POLICIES: CONTACT_ENQUIRIES TABLE (Input-Validated & Customer Privacy Protected)
-- ==============================================================================
DROP POLICY IF EXISTS "contact_enquiries_insert_public" ON public.contact_enquiries;
CREATE POLICY "contact_enquiries_insert_public"
  ON public.contact_enquiries
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'pending' AND
    length(trim(name)) >= 2 AND
    length(trim(phone)) >= 10 AND
    length(trim(subject)) >= 2 AND
    length(trim(message)) >= 5
  );

DROP POLICY IF EXISTS "contact_enquiries_select_admin_only" ON public.contact_enquiries;
CREATE POLICY "contact_enquiries_select_admin_only"
  ON public.contact_enquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "contact_enquiries_update_admin_only" ON public.contact_enquiries;
CREATE POLICY "contact_enquiries_update_admin_only"
  ON public.contact_enquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "contact_enquiries_delete_admin_only" ON public.contact_enquiries;
CREATE POLICY "contact_enquiries_delete_admin_only"
  ON public.contact_enquiries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 11. STORAGE BUCKET: STORE-MEDIA & FOLDER-LEVEL ROLE ISOLATION
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-media',
  'store-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Drop all possible previous/draft policy names to avoid any overlapping rule conflicts
DROP POLICY IF EXISTS "store_media_read_public" ON storage.objects;
DROP POLICY IF EXISTS "store_media_admin_all" ON storage.objects;
DROP POLICY IF EXISTS "store_media_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "store_media_manage_owner_or_admin" ON storage.objects;
DROP POLICY IF EXISTS "store_media_farmer_insert_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "store_media_farmer_manage_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "store_media_farmer_delete_own_folder" ON storage.objects;

-- 11.1 Public read for any image in store-media
CREATE POLICY "store_media_read_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'store-media');

-- 11.2 Store Admin has full management over the entire bucket
CREATE POLICY "store_media_admin_all"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'store-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'store-media' AND public.is_admin());

-- 11.3 Farmers can ONLY upload inside their own folder: farmer-crops/<auth.uid()>/...
-- Farmers CANNOT upload into, replace, or overwrite products/, crops/, or articles/
CREATE POLICY "store_media_farmer_insert_own_folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'store-media' AND
    (storage.foldername(name))[1] = 'farmer-crops' AND
    (storage.foldername(name))[2] = (auth.uid())::text
  );

-- 11.4 Farmers can update or delete ONLY images inside their own user-scoped folder
CREATE POLICY "store_media_farmer_manage_own_folder"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'store-media' AND
    (storage.foldername(name))[1] = 'farmer-crops' AND
    (storage.foldername(name))[2] = (auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'store-media' AND
    (storage.foldername(name))[1] = 'farmer-crops' AND
    (storage.foldername(name))[2] = (auth.uid())::text
  );

CREATE POLICY "store_media_farmer_delete_own_folder"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'store-media' AND
    (storage.foldername(name))[1] = 'farmer-crops' AND
    (storage.foldername(name))[2] = (auth.uid())::text
  );
