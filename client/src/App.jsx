import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

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
    <div className="flex flex-col min-h-screen bg-[#fbfbf8] text-stone-900">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
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
          <Route path="/admin/login" element={<LoginPage />} />

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

          {/* Administrator Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/crops"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminCropsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/crops/new"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminCropFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/crops/:id/edit"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminCropFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminArticlesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/new"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminArticleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/:id/edit"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminArticleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminEnquiriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={<AdminAppointmentsPage />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
