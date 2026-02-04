/**
 * Auth Context
 * Provides authentication state and API methods globally
 */

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'https://aifinalprojekt.vercel.app/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  function getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') return value;
    }
    return null;
  }

  function setTokenCookie(token) {
    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `token=${token};expires=${date.toUTCString()};path=/;SameSite=Lax`;
  }

  function clearTokenCookie() {
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }

  function getAuthHeaders() {
    const token = getTokenFromCookie();
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  async function checkAuth() {
    const token = getTokenFromCookie();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/auth/me`, getAuthHeaders());
      setUser(response.data.data);
    } catch (err) {
      clearTokenCookie();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password) {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
      setTokenCookie(response.data.data.token);
      setUser(response.data.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  }

  async function login(email, password) {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      setTokenCookie(response.data.data.token);
      setUser(response.data.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  }

  function logout() {
    clearTokenCookie();
    setUser(null);
  }

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getAuthHeaders,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
