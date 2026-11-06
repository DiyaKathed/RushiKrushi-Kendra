import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-agro-200 border-t-agro-forest rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-stone-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If attempting to access an admin route, send to admin login, else farmer login
    const targetLogin = roleRequired === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  if (roleRequired && user?.role !== roleRequired) {
    const fallback = roleRequired === 'admin' ? '/admin/login' : '/';
    return <Navigate to={fallback} state={{ unauthorized: true, from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
