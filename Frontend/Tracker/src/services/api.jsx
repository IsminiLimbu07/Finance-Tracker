import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateBudget: (budget) => api.put('/auth/budget', { monthlyBudget: budget }),
};

// Expenses API
export const expensesAPI = {
  getExpenses: (params) => api.get('/expenses', { params }),
  addExpense: (expense) => api.post('/expenses', expense),
  updateExpense: (id, expense) => api.put(`/expenses/${id}`, expense),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getStats: () => api.get('/expenses/stats'),
};

export default api;