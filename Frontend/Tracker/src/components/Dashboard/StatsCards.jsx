import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Calendar,
  PieChart
} from 'lucide-react';

const StatsCards = ({ stats }) => {
  const budgetUsedPercentage = stats?.monthlyBudget > 0 
    ? (stats.monthlyTotal / stats.monthlyBudget) * 100 
    : 0;

  const isOverBudget = budgetUsedPercentage > 100;

  const cards = [
    {
      title: 'Monthly Spending',
      value: `${stats?.monthlyTotal?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'blue',
      subtitle: 'Current month total'
    },
    {
      title: 'Monthly Budget',
      value: `${stats?.monthlyBudget?.toFixed(2) || '0.00'}`,
      icon: Target,
      color: 'green',
      subtitle: stats?.monthlyBudget > 0 
        ? `${budgetUsedPercentage.toFixed(1)}% used`
        : 'No budget set'
    },
    {
      title: 'Remaining Budget',
      value: `${Math.max(0, stats?.budgetRemaining || 0).toFixed(2)}`,
      icon: isOverBudget ? TrendingDown : TrendingUp,
      color: isOverBudget ? 'red' : 'green',
      subtitle: isOverBudget ? 'Over budget!' : 'Available to spend'
    },
    {
      title: 'Categories',
      value: stats?.categoryBreakdown?.length || '0',
      icon: PieChart,
      color: 'purple',
      subtitle: 'Active categories'
    }
  ];

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getIconColor(card.color)}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            
            {/* Budget Progress Bar */}
            {card.title === 'Monthly Budget' && stats?.monthlyBudget > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className={`text-xs font-medium ${
                    isOverBudget ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {budgetUsedPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isOverBudget 
                        ? 'bg-red-500' 
                        : budgetUsedPercentage > 80 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, budgetUsedPercentage)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;