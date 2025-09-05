import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { expensesAPI } from '../../services/api';
import ExpenseCharts from '../Charts/ExpenseCharts';
import StatsCards from './StatsCards';
import ExpenseList from './ExpenseList';
import { Plus, Filter, Download, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: 'all',
    startDate: '',
    endDate: '',
    limit: 10
  });

  useEffect(() => {
    loadDashboardData();
  }, [filter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [expensesRes, statsRes] = await Promise.all([
        expensesAPI.getExpenses(filter),
        expensesAPI.getStats()
      ]);
      
      setExpenses(expensesRes.data.expenses);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportExpenses = async () => {
    try {
      const response = await expensesAPI.getExpenses({ ...filter, limit: 1000 });
      const expenses = response.data.expenses;
      
      // Create CSV content
      const headers = ['Date', 'Title', 'Category', 'Amount', 'Payment Method', 'Description'];
      const csvContent = [
        headers.join(','),
        ...expenses.map(expense => [
          new Date(expense.date).toLocaleDateString(),
          `"${expense.title}"`,
          expense.category,
          expense.amount,
          expense.paymentMethod,
          `"${expense.description || ''}"`
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting expenses:', error);
    }
  };

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={exportExpenses}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <Link
              to="/add-expense"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filter.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show
              </label>
              <select
                value={filter.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={10}>Last 10</option>
                <option value={25}>Last 25</option>
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-8">
          <ExpenseCharts expenses={expenses} stats={stats} />
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Expenses
            </h3>
            <Link
              to="/expenses"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View all
            </Link>
          </div>
          <ExpenseList 
            expenses={expenses} 
            onExpenseUpdate={loadDashboardData}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;