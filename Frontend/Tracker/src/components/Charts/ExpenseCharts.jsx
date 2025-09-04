import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
);

const ExpenseCharts = ({ expenses, stats }) => {
  // Category breakdown chart data
  const categoryData = {
    labels: stats?.categoryBreakdown?.map(cat => cat._id) || [],
    datasets: [
      {
        data: stats?.categoryBreakdown?.map(cat => cat.total) || [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB', 
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Monthly spending trend
  const getMonthlyData = () => {
    const monthlyTotals = {};
    const last6Months = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      last6Months.push({ key: monthKey, label: monthLabel });
      monthlyTotals[monthKey] = 0;
    }

    // Calculate totals for each month
    expenses.forEach(expense => {
      const expenseMonth = new Date(expense.date).toISOString().slice(0, 7);
      if (monthlyTotals.hasOwnProperty(expenseMonth)) {
        monthlyTotals[expenseMonth] += expense.amount;
      }
    });

    return {
      labels: last6Months.map(month => month.label),
      datasets: [
        {
          label: 'Monthly Spending',
          data: last6Months.map(month => monthlyTotals[month.key]),
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Spending: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          },
        },
      },
    },
  };

  // Daily spending for current month
  const getDailySpending = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const dailyTotals = {};
    
    // Initialize all days of current month
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      dailyTotals[i] = 0;
    }

    // Calculate daily totals
    expenses
      .filter(expense => expense.date.startsWith(currentMonth))
      .forEach(expense => {
        const day = new Date(expense.date).getDate();
        dailyTotals[day] += expense.amount;
      });

    return {
      labels: Object.keys(dailyTotals).map(day => `Day ${day}`),
      datasets: [
        {
          label: 'Daily Spending',
          data: Object.values(dailyTotals),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
      ],
    };
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Amount: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          },
        },
      },
    },
  };

  if (!expenses.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No expense data available for charts.</p>
        <p className="text-sm text-gray-400 mt-2">Add some expenses to see visualizations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Spending by Category
        </h3>
        <div className="h-80">
          <Pie data={categoryData} options={pieOptions} />
        </div>
      </div>

      {/* Monthly Trend and Daily Spending */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            6-Month Spending Trend
          </h3>
          <div className="h-64">
            <Line data={getMonthlyData()} options={lineOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Spending This Month
          </h3>
          <div className="h-64">
            <Bar data={getDailySpending()} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;