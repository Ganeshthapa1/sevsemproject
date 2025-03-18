import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fix API URL format - make sure it doesn't have a trailing slash
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // Configure axios defaults
  useEffect(() => {
    // Set up axios default headers
    axios.defaults.baseURL = API_URL;
    
    // Set a request interceptor to include the token in all requests
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Adding token to request:', config.url);
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Clean up
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [API_URL]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const loadUserFromStorage = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Token found in storage:', token.substring(0, 10) + '...');
          
          // Set default headers for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token by getting user profile
          console.log('Fetching user profile from:', `${API_URL}/auth/profile`);
          const res = await axios.get(`${API_URL}/auth/profile`);
          console.log('Profile response:', res.data);
          setUser(res.data);
          
          // Also store user in localStorage for components that need it
          localStorage.setItem('user', JSON.stringify(res.data));
        } else {
          console.log('No token found in storage');
        }
      } catch (err) {
        console.error('Error loading user from storage:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, [API_URL]);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Set default headers for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
      return true;
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    setLoading(true);
    setError('');
    try {
      console.log('Logging in at:', `${API_URL}/auth/login`);
      const res = await axios.post(`${API_URL}/auth/login`, userData);
      
      console.log('Login response:', res.data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Set default headers for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
      
      // Dispatch login event for other components to react
      window.dispatchEvent(new Event('userLogin'));
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && user.isActive !== false;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Get token for external use
  const getToken = () => {
    return localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 