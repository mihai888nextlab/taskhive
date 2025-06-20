import React from "react";

interface ExpenseFormProps {
  title: string;
  amount: string;
  description: string;
  loading: boolean;
  theme: string;
  onTitleChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  title,
  amount,
  description,
  loading,
  theme,
  onTitleChange,
  onAmountChange,
  onDescriptionChange,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <input
      type="text"
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
      placeholder="Expense Title"
      className={`border border-gray-600 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
      required
    />
    <input
      type="number"
      value={amount}
      onChange={(e) => onAmountChange(e.target.value)}
      placeholder="Amount (e.g., 50.00)"
      className={`border border-gray-600 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
      step="0.01"
      required
    />
    <textarea
      value={description}
      onChange={(e) => onDescriptionChange(e.target.value)}
      placeholder="Description of the expense"
      className={`border border-gray-600 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 h-24 resize-y`}
      required
    ></textarea>
    <button
      type="submit"
      className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-semibold text-lg flex items-center justify-center"
      disabled={loading}
    >
      {loading ? "Loading..." : "Add Expense"}
    </button>
  </form>
);

export default ExpenseForm;