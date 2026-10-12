import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rushikrushi_token') || null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          // If user has preferred language saved and differs from current
          if (res.data.user.preferredLanguage && res.data.user.preferredLanguage !== i18n.language) {
            i18n.changeLanguage(res.data.user.preferredLanguage);
          }
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        // Token expired or invalid
        localStorage.removeItem('rushikrushi_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login method
  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data.success) {
      localStorage.setItem('rushikrushi_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.preferredLanguage) {
        i18n.changeLanguage(res.data.user.preferredLanguage);
      }
      return res.data.user;
    }
  };

  // Register farmer method
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('rushikrushi_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.preferredLanguage) {
        i18n.changeLanguage(res.data.user.preferredLanguage);
      }
      return res.data.user;
    }
  };

  // Update profile
  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data.user;
    }
  };

  // Logout method
  const logout = () => {
    localStorage.removeItem('rushikrushi_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
