import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        } catch (error) {
          console.error('Error loading user:', error);
          // If token is invalid, clear everything
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserBudget = async (budget) => {
    try {
      await authAPI.updateBudget(budget);
      setUser(prev => ({ ...prev, monthlyBudget: budget }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Budget update failed' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUserBudget,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};