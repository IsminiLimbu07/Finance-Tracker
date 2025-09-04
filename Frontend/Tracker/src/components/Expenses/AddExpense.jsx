import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI } from '../../services/api';
import { ArrowLeft, Save, Calculator } from 'lucide-react';

const AddExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'Credit Card'
  });

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

  const paymentMethods = [
    'Credit Card',
    'Debit Card', 
    'Cash',
    'Digital Wallet',
    'Bank Transfer'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        title: formData.title.trim(),
        description: formData.description.trim()
      };

      await expensesAPI.addExpense(expenseData);
      
      setSuccess('Expense added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        amount: '',
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'Credit Card'
      });

      // Redirect after short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const calculateTip = (percentage) => {
    const amount = parseFloat(formData.amount) || 0;
    const tip = (amount * percentage) / 100;
    setFormData({
      ...formData,
      amount: (amount + tip).toFixed(2)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Expense</h1>
        </div>

        {/* Form */}
        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title and Amount Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Lunch at restaurant"
                  required
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="input-field pl-8"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                {/* Quick tip calculator for restaurants */}
                {formData.category === 'Food & Dining' && formData.amount && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Calculator className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Add tip:</span>
                    {[15, 18, 20].map(percentage => (
                      <button
                        key={percentage}
                        type="button"
                        onClick={() => calculateTip(percentage)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category and Payment Method Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="input-field"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field max-w-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Additional details about this expense..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary flex items-center space-x-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Adding...' : 'Add Expense'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;