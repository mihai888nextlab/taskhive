import React from "react";
import { FaTrash } from "react-icons/fa";

interface Income {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'income';
}

interface IncomeListProps {
  incomes: Income[];
  loading: boolean;
  onDelete: (id: string) => void;
  theme: string;
}

const IncomeList: React.FC<IncomeListProps> = ({
  incomes,
  loading,
  onDelete,
  theme,
}) => (
  <>
    {loading ? (
      <div className="text-center py-4">
        <span>Loading...</span>
        <p className="text-gray-400 mt-2">Loading incomes...</p>
      </div>
    ) : incomes.length === 0 ? (
      <p className="text-gray-400 text-center py-4">No incomes recorded yet.</p>
    ) : (
      incomes.map(income => (
        <div key={income._id} className="bg-green-800 border border-green-600 rounded-lg p-5 shadow-sm mb-4 flex items-center justify-between transition-transform hover:scale-101 hover:shadow-md transition-all duration-200">
          <div>
            <h3 className="font-bold text-lg text-green-300">{income.title}</h3>
            <p className="text-gray-400 text-sm mt-1">{income.description}</p>
            <p className="font-semibold text-green-300 mt-2">Amount: ${income.amount.toFixed(2)}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onDelete(income._id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-600 transition duration-200"
              title="Delete Income"
            >
              <FaTrash size={20} />
            </button>
          </div>
        </div>
      ))
    )}
  </>
);

export default IncomeList;