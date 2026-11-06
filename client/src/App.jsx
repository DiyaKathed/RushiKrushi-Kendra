import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import FarmingGuidePage from './pages/FarmingGuidePage';
import CropDetailPage from './pages/CropDetailPage';
import InputsKnowledgePage from './pages/InputsKnowledgePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Farmer Pages
import FarmerDashboardPage from './pages/farmer/FarmerDashboardPage';
import FarmerProfilePage from './pages/farmer/FarmerProfilePage';
import MyCropsPage from './pages/farmer/MyCropsPage';
import AddEditCropPage from './pages/farmer/AddEditCropPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCropsPage from './pages/admin/AdminCropsPage';
import AdminCropFormPage from './pages/admin/AdminCropFormPage';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';
import AdminArticleFormPage from './pages/admin/AdminArticleFormPage';
import AdminEnquiriesPage from './pages/admin/AdminEnquiriesPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';

function App() {
  return (
    <Routes>
      {/* 1. Public Farmer Website & Customer Routes (with Public Header & Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/farming-guide" element={<FarmingGuidePage />} />
        <Route path="/farming-guide/crops/:slug" element={<CropDetailPage />} />
        <Route path="/farming-guide/articles/:slug" element={<ArticleDetailPage />} />
        <Route path="/inputs" element={<InputsKnowledgePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Farmer Protected Routes */}
        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute>
              <FarmerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/profile"
          element={
            <ProtectedRoute>
              <FarmerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/crops"
          element={
            <ProtectedRoute>
              <MyCropsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/crops/add"
          element={
            <ProtectedRoute>
              <AddEditCropPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/crops/:id"
          element={
            <ProtectedRoute>
              <AddEditCropPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 2. Dedicated Administrator Login Portal */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* 3. Protected Administrator Control Panel (Dedicated AdminLayout) */}
      <Route
        element={
          <ProtectedRoute roleRequired="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/products/new" element={<AdminProductFormPage />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="/admin/crops" element={<AdminCropsPage />} />
        <Route path="/admin/crops/new" element={<AdminCropFormPage />} />
        <Route path="/admin/crops/:id/edit" element={<AdminCropFormPage />} />
        <Route path="/admin/articles" element={<AdminArticlesPage />} />
        <Route path="/admin/articles/new" element={<AdminArticleFormPage />} />
        <Route path="/admin/articles/:id/edit" element={<AdminArticleFormPage />} />
        <Route path="/admin/enquiries" element={<AdminEnquiriesPage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
      </Route>

      {/* 4. Global Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
