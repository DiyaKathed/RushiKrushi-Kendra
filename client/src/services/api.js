import axios from 'axios';
import { isSupabaseConfigured } from './supabase.js';
import {
  getSupabaseProducts,
  getSupabaseProduct,
  getSupabaseCrops,
  getSupabaseCrop,
  getSupabaseArticles,
  getSupabaseArticle,
} from './supabaseCatalog.js';

const apiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

const api = axios.create({
  baseURL: apiBase ? `${apiBase.replace(/\/$/, '')}/api` : '/api',
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

// Products API
export const getProducts = async (params) => {
  if (isSupabaseConfigured()) {
    try {
      const res = await getSupabaseProducts(params);
      if (res?.data?.success) {
        return res;
      }
    } catch (err) {
      console.warn('[Catalog] Supabase getProducts read failed; falling back to Express API:', err.message || err);
    }
  }
  return api.get('/products', { params });
};

export const getProduct = async (slugOrId) => {
  if (isSupabaseConfigured()) {
    try {
      const res = await getSupabaseProduct(slugOrId);
      if (res?.data?.success) {
        return res;
      }
      // If not found in published Supabase catalog (e.g. draft record or MongoDB ObjectId), fall through to Express
    } catch (err) {
      console.warn('[Catalog] Supabase getProduct read failed; falling back to Express API:', err.message || err);
    }
  }
  return api.get(`/products/${slugOrId}`);
};

export const adminGetProducts = (params) => api.get('/products/admin/all', { params });
export const adminCreateProduct = (data) => api.post('/products', data);
export const adminUpdateProduct = (id, data) => api.put(`/products/${id}`, data);
export const adminDeleteProduct = (id) => api.delete(`/products/${id}`);

// Crops API
export const getCrops = async (params) => {
  if (isSupabaseConfigured()) {
    try {
      const res = await getSupabaseCrops(params);
      if (res?.data?.success) {
        return res;
      }
    } catch (err) {
      console.warn('[Catalog] Supabase getCrops read failed; falling back to Express API:', err.message || err);
    }
  }
  return api.get('/crops', { params });
};

export const getCrop = async (slugOrId) => {
  if (isSupabaseConfigured()) {
    try {
      const res = await getSupabaseCrop(slugOrId);
      if (res?.data?.success) {
        return res;
      }
      // If not found in published Supabase catalog (e.g. draft record or MongoDB ObjectId), fall through to Express
    } catch (err) {
      console.warn('[Catalog] Supabase getCrop read failed; falling back to Express API:', err.message || err);
    }
  }
  return api.get(`/crops/${slugOrId}`);
};

export const adminGetCrops = (params) => api.get('/crops/admin/all', { params });
export const adminCreateCrop = (data) => api.post('/crops', data);
export const adminUpdateCrop = (id, data) => api.put(`/crops/${id}`, data);
export const adminDeleteCrop = (id) => api.delete(`/crops/${id}`);

// Articles API
export const getArticles = async (params) => {
  if (isSupabaseConfigured()) {
    try {
      const res = await getSupabaseArticles(params);
      if (res?.data?.success) {
        return res;
      }
    } catch (err) {
      console.warn('[Catalog] Supabase getArticles read failed; falling back to Express API:', err.message || err);
    }
  }
  return api.get('/articles', { params });
};

export const getArticle = async (slugOrId) => {
  if (isSupabaseConfigured()) {
    try {
      const res = await getSupabaseArticle(slugOrId);
      if (res?.data?.success) {
        return res;
      }
      // If not found in published Supabase catalog (e.g. draft record or MongoDB ObjectId), fall through to Express
    } catch (err) {
      console.warn('[Catalog] Supabase getArticle read failed; falling back to Express API:', err.message || err);
    }
  }
  return api.get(`/articles/${slugOrId}`);
};

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
