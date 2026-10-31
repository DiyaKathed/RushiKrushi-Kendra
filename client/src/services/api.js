import axios from 'axios';

/**
 * Robustly sanitizes and determines the API base URL.
 * Prevents duplicate '/api/api' paths regardless of how VITE_API_BASE_URL,
 * VITE_API_URL, or VITE_BACKEND_URL are defined in Vercel or local envs.
 *
 * Examples:
 * - "https://rushikrushi-kendra.onrender.com"      -> "https://rushikrushi-kendra.onrender.com/api"
 * - "https://rushikrushi-kendra.onrender.com/"     -> "https://rushikrushi-kendra.onrender.com/api"
 * - "https://rushikrushi-kendra.onrender.com/api"  -> "https://rushikrushi-kendra.onrender.com/api"
 * - "https://rushikrushi-kendra.onrender.com/api/" -> "https://rushikrushi-kendra.onrender.com/api"
 * - "" (local dev proxy)                           -> "/api"
 */
export const getApiBaseUrl = () => {
  const envUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    ''
  ).trim();

  if (!envUrl) {
    return '/api';
  }

  // Remove trailing slashes
  const clean = envUrl.replace(/\/+$/, '');

  // If already ends with /api, use it as is without duplicating
  if (clean.endsWith('/api')) {
    return clean;
  }

  return `${clean}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rushikrushi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Safely extracts an array of products from any API response format:
 * - { success: true, products: [...] }
 * - { products: [...] }
 * - [...] (direct array)
 * - { data: [...] } or { data: { products: [...] } }
 */
export const extractProducts = (res) => {
  const data = res?.data ?? res;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.data?.products)) return data.data.products;
  return [];
};

/**
 * Safely extracts an array of crops from any API response format:
 * - { success: true, crops: [...] }
 * - { crops: [...] }
 * - [...] (direct array)
 * - { data: [...] } or { data: { crops: [...] } }
 */
export const extractCrops = (res) => {
  const data = res?.data ?? res;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.crops)) return data.crops;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.data?.crops)) return data.data.crops;
  return [];
};

/**
 * Safely extracts an array of articles from any API response format:
 * - { success: true, articles: [...] }
 * - { articles: [...] }
 * - [...] (direct array)
 * - { data: [...] } or { data: { articles: [...] } }
 */
export const extractArticles = (res) => {
  const data = res?.data ?? res;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.articles)) return data.articles;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.data?.articles)) return data.data.articles;
  return [];
};

/**
 * Safely extracts a single entity (product, crop, article) from an API response.
 */
export const extractItem = (res, preferredKey) => {
  const data = res?.data ?? res;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  if (preferredKey && data[preferredKey] && typeof data[preferredKey] === 'object' && !Array.isArray(data[preferredKey])) {
    return data[preferredKey];
  }
  if (data.product && typeof data.product === 'object' && !Array.isArray(data.product)) return data.product;
  if (data.crop && typeof data.crop === 'object' && !Array.isArray(data.crop)) return data.crop;
  if (data.article && typeof data.article === 'object' && !Array.isArray(data.article)) return data.article;
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data;
  if (data._id || data.id || data.slug || data.nameEn || data.titleEn) return data;
  return null;
};

// Products API (Express / MongoDB Atlas single source of truth)
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (slugOrId) => api.get(`/products/${slugOrId}`);
export const adminGetProducts = (params) => api.get('/products/admin/all', { params });
export const adminCreateProduct = (data) => api.post('/products', data);
export const adminUpdateProduct = (id, data) => api.put(`/products/${id}`, data);
export const adminDeleteProduct = (id) => api.delete(`/products/${id}`);

// Crops API (Express / MongoDB Atlas single source of truth)
export const getCrops = (params) => api.get('/crops', { params });
export const getCrop = (slugOrId) => api.get(`/crops/${slugOrId}`);
export const adminGetCrops = (params) => api.get('/crops/admin/all', { params });
export const adminCreateCrop = (data) => api.post('/crops', data);
export const adminUpdateCrop = (id, data) => api.put(`/crops/${id}`, data);
export const adminDeleteCrop = (id) => api.delete(`/crops/${id}`);

// Articles API (Express / MongoDB Atlas single source of truth)
export const getArticles = (params) => api.get('/articles', { params });
export const getArticle = (slugOrId) => api.get(`/articles/${slugOrId}`);
export const adminGetArticles = (params) => api.get('/articles/admin/all', { params });
export const adminCreateArticle = (data) => api.post('/articles', data);
export const adminUpdateArticle = (id, data) => api.put(`/articles/${id}`, data);
export const adminDeleteArticle = (id) => api.delete(`/articles/${id}`);

// Farmer Crops API
export const getFarmerCrops = () => api.get('/farmer-crops');
export const getFarmerCrop = (id) => api.get(`/farmer-crops/${id}`);
export const createFarmerCrop = (data) => api.post('/farmer-crops', data);
export const updateFarmerCrop = (id, data) => api.put(`/farmer-crops/${id}`, data);
export const deleteFarmerCrop = (id) => api.delete(`/farmer-crops/${id}`);

// Contact Enquiries API
export const submitEnquiry = (data) => api.post('/enquiries', data);
export const getEnquiries = () => api.get('/enquiries');
export const updateEnquiryStatus = (id, status) => api.put(`/enquiries/${id}/status`, { status });
export const deleteEnquiry = (id) => api.delete(`/enquiries/${id}`);

// Admin Stats
export const getAdminStats = () => api.get('/stats');

// Image Upload
export const uploadImage = (formData) => {
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;
