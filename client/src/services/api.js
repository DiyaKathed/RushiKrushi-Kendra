import axios from 'axios';

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
