import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface IncomeFormProps {
  title: string;
  amount: string;
  description: string;
  date: Date;
  category: string;
  loading: boolean;
  theme: string;
  onTitleChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onDateChange: (v: Date) => void;
  onCategoryChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const categories = [
  'General', 'Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Salary', 'Investment', 'Other'
];

const IncomeForm: React.FC<IncomeFormProps> = ({
  title,
  amount,
  description,
  date,
  category,
  loading,
  theme,
  onTitleChange,
  onAmountChange,
  onDescriptionChange,
  onDateChange,
  onCategoryChange,
  onSubmit,
}) => (
  <form
    onSubmit={onSubmit}
    className={`space-y-4 rounded-xl shadow-md p-6 transition-all duration-200 ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
        : "bg-gradient-to-br from-white to-green-50 border border-green-100"
    }`}
  >
    <input
      type="text"
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
      placeholder="Income Title"
      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-lg font-semibold shadow-sm transition-all duration-200 ${
        theme === "dark"
          ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
          : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
      }`}
      required
    />
    <input
      type="number"
      value={amount}
      onChange={(e) => onAmountChange(e.target.value)}
      placeholder="Amount (e.g., 100.00)"
      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-lg font-semibold shadow-sm transition-all duration-200 ${
        theme === "dark"
          ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
          : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
      }`}
      step="0.01"
      required
    />
    <textarea
      value={description}
      onChange={(e) => onDescriptionChange(e.target.value)}
      placeholder="Description of the income"
      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-base shadow-sm transition-all duration-200 resize-y ${
        theme === "dark"
          ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
          : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
      }`}
      required
      rows={3}
    ></textarea>
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1 text-gray-500 dark:text-gray-300">Date</label>
        <DatePicker
          selected={date}
          onChange={(d) => { if (d) onDateChange(d); }}
          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 shadow-sm transition-all duration-200 ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
              : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
          }`}
          dateFormat="yyyy-MM-dd"
          required
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1 text-gray-500 dark:text-gray-300">Category</label>
        <select
          value={category}
          onChange={e => onCategoryChange(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 shadow-sm transition-all duration-200 ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
              : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
          }`}
          required
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
    </div>
    <button
      type="submit"
      className={`w-full py-3 rounded-xl font-bold shadow-md transition-all duration-300 text-lg ${
        theme === "dark"
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800"
      }`}
      disabled={loading}
    >
      {loading ? "Saving..." : "Add Income"}
    </button>
  </form>
);

export default IncomeForm;