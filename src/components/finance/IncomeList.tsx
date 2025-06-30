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
    {/* Responsive Search and Filters */}
    <div className={`space-y-3 mb-4 p-3 rounded-lg border ${
      theme === "dark"
        ? "bg-gray-900 border-gray-700"
        : "bg-gray-50 border-gray-200"
    }`}>
      {/* First Row: Search and Quick Actions */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search income..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }`}
            disabled={loading}
          />
        </div>
        
        {/* Export Actions */}
        <div className="flex gap-1">
          <button
            onClick={onExportCSV}
            className={`p-2 rounded-md border text-sm hover:bg-opacity-80 transition-colors ${
              theme === "dark"
                ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
                : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
            }`}
            disabled={loading}
            title="Export CSV"
          >
            <FaFileCsv />
          </button>
          <button
            onClick={onExportPDF}
            className={`p-2 rounded-md border text-sm hover:bg-opacity-80 transition-colors ${
              theme === "dark"
                ? "bg-red-600 text-white border-red-500 hover:bg-red-700"
                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            }`}
            disabled={loading}
            title="Export PDF"
          >
            <FaFilePdf />
          </button>
        </div>
      </div>

      {/* Second Row: Filters and Sort - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => onCategoryFilterChange(e.target.value)}
          className={`px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
          disabled={loading}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={e => {
            const [newSortBy, newSortOrder] = e.target.value.split('-');
            onSortByChange(newSortBy);
            onSortOrderChange(newSortOrder);
          }}
          className={`px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
          disabled={loading}
        >
          <option value="date-desc">Newest</option>
          <option value="date-asc">Oldest</option>
          <option value="amount-desc">Highest</option>
          <option value="amount-asc">Lowest</option>
        </select>

        {/* Start Date */}
        <DatePicker
          selected={dateRange[0]}
          onChange={date => onDateRangeChange([date, dateRange[1]])}
          selectsStart
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          placeholderText="Start Date"
          className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
          disabled={loading}
        />

        {/* End Date */}
        <DatePicker
          selected={dateRange[1]}
          onChange={date => onDateRangeChange([dateRange[0], date])}
          selectsEnd
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          placeholderText="End Date"
          className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
          disabled={loading}
        />
      </div>
    </div>

    {/* List */}
    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading income...</p>
        </div>
      ) : incomes.length === 0 ? (
        <p className={`text-center py-8 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          No income found. Add your first income using the form.
        </p>
      ) : (
        incomes.map(income => (
          <div
            key={income._id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              theme === "dark"
                ? "bg-green-900/10 border-gray-700 hover:bg-green-900/20"
                : "bg-green-50/50 border-green-100 hover:bg-green-50"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {income.title}
                </h3>
                <span className="text-lg font-bold text-green-500">
                  ${income.amount.toFixed(2)}
                </span>
              </div>
              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {income.description}
              </p>
              <div className="flex gap-4 text-xs">
                <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {income.date ? new Date(income.date).toLocaleDateString() : "No date"}
                </span>
                {income.category && (
                  <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {income.category}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(income)}
              className={`p-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                theme === 'dark' ? 'hover:text-red-400' : 'hover:text-red-600'
              }`}
              title="Delete Income"
            >
              <FaTrash size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  </div>
);

export default IncomeList;