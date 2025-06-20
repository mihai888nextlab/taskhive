import React from "react";
import { FaTrash, FaFileCsv, FaFilePdf } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Income {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'income';
  date?: string;
  category?: string;
}

export interface IncomeListProps {
  incomes: Income[];
  loading: boolean;
  onDelete: (item: Income) => void;
  theme: string;
  // Menu controls
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
  categories: string[];
  sortBy: string;
  sortOrder: string;
  onSortByChange: (v: string) => void;
  onSortOrderChange: (v: string) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

const IncomeList: React.FC<IncomeListProps> = ({
  incomes,
  loading,
  onDelete,
  theme,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  dateRange,
  onDateRangeChange,
  categories,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  onExportCSV,
  onExportPDF,
}) => (
  <div>
    {/* Unified Menu */}
    <div className={`flex flex-wrap gap-4 mb-6 px-4 py-4 rounded-2xl shadow-md border items-center transition-all duration-200
      ${theme === "dark"
        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
        : "bg-gradient-to-br from-green-50 to-white border-green-100"
      }`}
    >
      {/* Search */}
      <div className="flex-1 flex items-center gap-2 min-w-[180px]">
        <input
          type="text"
          placeholder="🔍 Search incomes..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className={`w-full px-5 py-2 rounded-full border focus:outline-none focus:ring-2 text-base shadow-sm transition-all duration-200
            ${theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
              : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
            }`}
          disabled={loading}
          aria-label="Search"
        />
      </div>
      {/* Category */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Category:</span>
        <select
          value={categoryFilter}
          onChange={e => onCategoryFilterChange(e.target.value)}
          className={`px-4 py-2 rounded-full border focus:outline-none focus:ring-2 text-base shadow-sm transition-all duration-200
            ${theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
              : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
            }`}
          disabled={loading}
          aria-label="Category Filter"
        >
          <option value="All">All</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      {/* Date Range */}
      <div className="flex items-center gap-2 min-w-[220px]">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Date:</span>
        <DatePicker
          selected={dateRange[0]}
          onChange={date => onDateRangeChange([date, dateRange[1]])}
          selectsStart
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          placeholderText="Start"
          className={`px-3 py-2 rounded-full border focus:outline-none focus:ring-2 text-base shadow-sm transition-all duration-200
            ${theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
              : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
            }`}
          disabled={loading}
        />
        <span className="text-gray-400">–</span>
        <DatePicker
          selected={dateRange[1]}
          onChange={date => onDateRangeChange([dateRange[0], date])}
          selectsEnd
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          placeholderText="End"
          className={`px-3 py-2 rounded-full border focus:outline-none focus:ring-2 text-base shadow-sm transition-all duration-200
            ${theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
              : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
            }`}
          disabled={loading}
        />
      </div>
      {/* Sort By */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Sort by:</span>
        <select
          value={sortBy}
          onChange={e => onSortByChange(e.target.value)}
          className={`px-4 py-2 rounded-full border focus:outline-none focus:ring-2 text-base shadow-sm transition-all duration-200
            ${theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
              : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
            }`}
          disabled={loading}
        >
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </select>
      </div>
      {/* Sort Order */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Order:</span>
        <select
          value={sortOrder}
          onChange={e => onSortOrderChange(e.target.value)}
          className={`px-4 py-2 rounded-full border focus:outline-none focus:ring-2 text-base shadow-sm transition-all duration-200
            ${theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
              : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
            }`}
          disabled={loading}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      {/* Export Buttons */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <button
          onClick={onExportCSV}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow transition-all duration-200
            ${theme === "dark"
              ? "bg-blue-700 text-white hover:bg-blue-800"
              : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          disabled={loading}
          aria-label="Export CSV"
        >
          <FaFileCsv /> CSV
        </button>
        <button
          onClick={onExportPDF}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow transition-all duration-200
            ${theme === "dark"
              ? "bg-green-700 text-white hover:bg-green-800"
              : "bg-green-500 text-white hover:bg-green-600"
            }`}
          disabled={loading}
          aria-label="Export PDF"
        >
          <FaFilePdf /> PDF
        </button>
      </div>
    </div>
    {/* List */}
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-4">
          <span>Loading...</span>
          <p className="text-gray-400 mt-2">Loading incomes...</p>
        </div>
      ) : incomes.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No incomes recorded yet.</p>
      ) : (
        incomes.map(income => (
          <div
            key={income._id}
            className={`flex items-center justify-between rounded-xl shadow-md p-5 transition-transform duration-200 hover:scale-101 ${
              theme === "dark"
                ? "bg-gradient-to-br from-green-900 to-gray-900 border border-green-900"
                : "bg-gradient-to-br from-green-100 to-white border border-green-200"
            }`}
          >
            <div>
              <h3 className="font-bold text-lg text-green-700 dark:text-green-300">{income.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{income.description}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Amount: ${income.amount.toFixed(2)}
                </span>
                <span className="text-gray-500">
                  Date: {income.date ? new Date(income.date).toLocaleDateString() : "-"}
                </span>
                <span className="text-gray-500">
                  Category: {income.category || "-"}
                </span>
              </div>
            </div>
            <button
              onClick={() => onDelete(income)}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition duration-200"
              title="Delete Income"
            >
              <FaTrash size={20} />
            </button>
          </div>
        ))
      )}
    </div>
  </div>
);

export default IncomeList;