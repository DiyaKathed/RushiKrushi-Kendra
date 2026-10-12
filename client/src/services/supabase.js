import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables via Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if credentials exist and are not unedited placeholders
const isConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon-key-here')
);

if (!isConfigured) {
  // In development, alert developer without crashing the UI
  if (import.meta.env.DEV) {
    console.info(
      '%c[Supabase]%c Client is unconfigured or using placeholder values in client/.env. Existing mock/backend functionality remains active.',
      'color: #15803d; font-weight: bold;',
      'color: inherit;'
    );
  }
}

// Fallback dummy credentials to prevent createClient from throwing on initialization if env vars are missing
const safeUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isConfigured ? supabaseAnonKey : 'placeholder-anon-key';

/**
 * Supabase client instance configured with persistent browser session auth.
 * Uses public Anon Key only.
 */
export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Checks whether valid Supabase environment variables are present in the frontend.
 * @returns {boolean}
 */
export const isSupabaseConfigured = () => isConfigured;

/**
 * Tests the real network connection against the configured Supabase project.
 * Does NOT assume the connection works until a genuine network handshake completes.
 *
 * @returns {Promise<{ success: boolean, message: string, data?: any, error?: any }>}
 */
export const testSupabaseConnection = async () => {
  if (!isConfigured) {
    return {
      success: false,
      message:
        'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env and restart the Vite dev server.',
      error: 'MISSING_ENV_VARS',
    };
  }

  try {
    // 1. Verify Auth service connectivity
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      return {
        success: false,
        message: `Supabase Auth responded with an error: ${authError.message}`,
        error: authError,
      };
    }

    // 2. Verify PostgreSQL Database connectivity via PostgREST
    const { count, error: dbError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (dbError) {
      return {
        success: false,
        message: `Supabase Database query failed: ${dbError.message}`,
        error: dbError,
      };
    }

    return {
      success: true,
      message:
        'Successfully connected to your Supabase project in Mumbai, India! (Both Auth & PostgreSQL verified)',
      details: {
        authStatus: 'connected',
        databaseStatus: 'connected',
        productsTableVerified: true,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to connect to Supabase: ${err.message || 'Network error'}`,
      error: err,
    };
  }
};

// Expose diagnostic tools on window in dev mode for testing in browser console
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.testSupabaseConnection = testSupabaseConnection;
  window.isSupabaseConfigured = isSupabaseConfigured;
}

export default supabase;
