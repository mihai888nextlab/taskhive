import React from "react";
import { FaTrash } from "react-icons/fa";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'expense';
}

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  onDelete: (id: string) => void;
  theme: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  loading,
  onDelete,
  theme,
}) => (
  <>
    {loading ? (
      <div className="text-center py-4">
        <span>Loading...</span>
        <p className="text-gray-400 mt-2">Loading expenses...</p>
      </div>
    ) : expenses.length === 0 ? (
      <p className="text-gray-400 text-center py-4">No expenses recorded yet.</p>
    ) : (
      expenses.map(expense => (
        <div key={expense._id} className="bg-red-800 border border-red-600 rounded-lg p-5 shadow-sm mb-4 flex items-center justify-between transition-transform hover:scale-101 hover:shadow-md transition-all duration-200">
          <div>
            <h3 className="font-bold text-lg text-red-300">{expense.title}</h3>
            <p className="text-gray-400 text-sm mt-1">{expense.description}</p>
            <p className="font-semibold text-red-300 mt-2">Amount: ${expense.amount.toFixed(2)}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onDelete(expense._id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-600 transition duration-200"
              title="Delete Expense"
            >
              <FaTrash size={20} />
            </button>
          </div>
        </div>
      ))
    )}
  </>
);

export default ExpenseList;