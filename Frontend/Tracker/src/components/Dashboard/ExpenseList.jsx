import React from 'react';

const ExpenseList = ({ expenses, onExpenseUpdate, compact }) => {
  if (!expenses || expenses.length === 0) {
    return <div className="text-gray-500 py-8 text-center">No expenses found.</div>;
  }
  return (
    <ul>
      {expenses.map(expense => (
        <li key={expense._id || expense.id}>
          <div>
            <strong>{expense.title}</strong> - {expense.amount} ({expense.category})
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ExpenseList;
