import React, { useMemo, useCallback, useState } from "react";
import { FaTrash, FaFileCsv, FaFilePdf, FaSearch, FaSpinner, FaReceipt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { useTheme } from '@/components/ThemeContext';
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'expense';
  date?: string;
  category?: string;
}

export interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  onDelete: (item: Expense) => void;
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

const ExpenseList: React.FC<ExpenseListProps> = React.memo(({
  expenses,
  loading,
  onDelete,
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
}) => {
  const { theme } = useTheme();
  const t = useTranslations("FinancePage");

  // Memoize delete handler
  const handleDeleteExpense = useCallback((expense: Expense) => {
    onDelete(expense);
  }, [onDelete]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  // Memoize rendered expenses
  const renderedExpenses = useMemo(() => (
    expenses.map(expense => (
      <div
        key={expense._id}
        className={`p-4 rounded-xl border transition-all duration-200 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
            : "bg-white border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className={`font-semibold text-base truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {expense.title}
              </h3>
              <span className="text-lg font-bold text-red-500">
                -${expense.amount.toFixed(2)}
              </span>
            </div>
            <p className={`text-sm mb-2 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {expense.description}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {expense.date ? new Date(expense.date).toLocaleDateString() : "No date"}
              </span>
              {expense.category && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-red-900/30 text-red-400' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {expense.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleDeleteExpense(expense)}
            className={`ml-4 p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
              theme === 'dark' 
                ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                : 'text-red-600 hover:bg-red-50'
            }`}
            title="Delete Expense"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>
    ))
  ), [expenses, theme, handleDeleteExpense]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex-shrink-0 p-3">
        {/* Search and Filter/Sort on same line */}
        <div className="flex gap-2 items-center w-full">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <Input
              type="text"
              placeholder={t("searchExpenses")}
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className={`w-full pl-10 pr-4 text-sm rounded-xl border transition-all duration-200
                ${theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              }`}
              style={{ height: "36px" }}
              disabled={loading}
            />
          </div>
          <Button
            type="button"
            className="rounded-xl px-4 py-2 font-semibold text-sm bg-red-500 hover:bg-red-600 text-white shadow flex items-center justify-center gap-2 md:w-auto"
            onClick={() => setShowFilterModal(true)}
            style={{ minWidth: 0, height: 40, justifyContent: 'center' }}
            title={t("filterSortButton", { default: "Filter & Sort" })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A2 2 0 0013 14.586V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-3.414a2 2 0 00-.586-1.414L2 6.707A1 1 0 012 6V4z" /></svg>
            <span className="ml-1">{t("filterSortButton", { default: "Filter & Sort" })}</span>
          </Button>
        </div>
      </div>
      {/* Modal for filter/sort on mobile */}
      {showFilterModal && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4`}>
          <div className={`relative w-full max-w-lg mx-2 md:mx-0 md:rounded-3xl rounded-2xl shadow-lg flex flex-col overflow-hidden animate-fadeInUp ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white' : 'bg-white border border-gray-200'}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b relative ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("filterSortTitle", { default: "Filter & Sort Expenses" })}</h3>
              <button
                className={`absolute top-6 right-6 text-2xl font-bold z-10 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                onClick={() => setShowFilterModal(false)}
                aria-label="Close"
                tabIndex={0}
                type="button"
              >
                ×
              </button>
            </div>
            {/* Modal Content */}
            <div className={`flex-1 p-6 space-y-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}> 
              {/* Category Filter */}
              <Select
                value={categoryFilter || undefined}
                onValueChange={onCategoryFilterChange}
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full pl-9 pr-8 text-sm rounded-xl border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'} transition-all duration-200 min-w-[140px]`}
                  style={{ height: "36px" }}
                >
                  <SelectValue placeholder={t("allCategories")} />
                </SelectTrigger>
                <SelectContent className={`rounded-xl border mt-1 ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}> 
                  <SelectItem value="All" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("allCategories")}</SelectItem>
                  {categories
                    .filter(cat => cat !== "All")
                    .map(cat => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}
                      >
                        {cat}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {/* Sorting */}
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={v => {
                  const [newSortBy, newSortOrder] = v.split('-');
                  onSortByChange(newSortBy);
                  onSortOrderChange(newSortOrder);
                }}
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full pl-9 pr-8 text-sm rounded-xl border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'} transition-all duration-200 min-w-[140px]`}
                  style={{ height: "36px" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={`rounded-xl border mt-1 ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}> 
                  <SelectItem value="date-desc" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("newestFirst")}</SelectItem>
                  <SelectItem value="date-asc" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("oldestFirst")}</SelectItem>
                  <SelectItem value="amount-desc" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("highestAmount")}</SelectItem>
                  <SelectItem value="amount-asc" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("lowestAmount")}</SelectItem>
                </SelectContent>
              </Select>
              {/* Start Date */}
              <DatePicker
                selected={dateRange[0]}
                onChange={date => onDateRangeChange([date, dateRange[1]])}
                selectsStart
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                placeholderText={t("startDate")}
                className={`w-full px-4 py-2 text-sm rounded-xl border transition-all duration-200 h-[36px]
                  ${theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
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
                placeholderText={t("endDate")}
                className={`w-full px-4 py-2 text-sm rounded-xl border transition-all duration-200 h-[36px]
                  ${theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                }`}
                disabled={loading}
              />
            </div>
            {/* Modal Footer */}
            <div className={`p-6 border-t flex justify-end ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <Button
                type="button"
                className="rounded-xl px-6 py-2 font-semibold text-sm bg-red-500 hover:bg-red-600 text-white shadow"
                onClick={() => setShowFilterModal(false)}
              >
                {t("applyFiltersButton", { default: "Apply" })}
              </Button>
            </div>
          </div>
        </div>
      )}
        {/* Modal for filter/sort on mobile */}
        {showFilterModal && (
          <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4`}>
            <div className={`relative w-full max-w-lg mx-2 md:mx-0 md:rounded-3xl rounded-2xl shadow-lg flex flex-col overflow-hidden animate-fadeInUp ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white' : 'bg-white border border-gray-200'}`}>
              {/* Modal Header */}
              <div className={`flex items-center justify-between p-6 border-b relative ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("filterSortTitle", { default: "Filter & Sort Expenses" })}</h3>
                <button
                  className={`absolute top-6 right-6 text-2xl font-bold z-10 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                  onClick={() => setShowFilterModal(false)}
                  aria-label="Close"
                  tabIndex={0}
                  type="button"
                >
                  ×
                </button>
              </div>
              {/* Modal Content */}
              <div className={`flex-1 p-6 space-y-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}> 
                {/* Category Filter */}
                <Select
                  value={categoryFilter || undefined}
                  onValueChange={onCategoryFilterChange}
                  disabled={loading}
                >
                  <SelectTrigger
                    className={`w-full pl-9 pr-8 text-sm rounded-xl border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'} transition-all duration-200 min-w-[140px]`}
                    style={{ height: "36px" }}
                  >
                    <SelectValue placeholder={t("allCategories")} />
                  </SelectTrigger>
                  <SelectContent className={`rounded-xl border mt-1 ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}> 
                    <SelectItem value="All" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("allCategories")}</SelectItem>
                    {categories
                      .filter(cat => cat !== "All")
                      .map(cat => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}
                        >
                          {cat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {/* Sorting */}
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={v => {
                    const [newSortBy, newSortOrder] = v.split('-');
                    onSortByChange(newSortBy);
                    onSortOrderChange(newSortOrder);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger
                    className={`w-full pl-9 pr-8 text-sm rounded-xl border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'} transition-all duration-200 min-w-[140px]`}
                    style={{ height: "36px" }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={`rounded-xl border mt-1 ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}> 
                    <SelectItem value="date-desc" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("newestFirst")}</SelectItem>
                    <SelectItem value="date-asc" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("oldestFirst")}</SelectItem>
                    <SelectItem value="amount-desc" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("highestAmount")}</SelectItem>
                    <SelectItem value="amount-asc" className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-red-700/20 data-[state=checked]:bg-red-700/40' : 'bg-white text-gray-900 hover:bg-red-100 data-[state=checked]:bg-red-200'}`}>{t("lowestAmount")}</SelectItem>
                  </SelectContent>
                </Select>
                {/* Start Date */}
                <DatePicker
                  selected={dateRange[0]}
                  onChange={date => onDateRangeChange([date, dateRange[1]])}
                  selectsStart
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  placeholderText={t("startDate")}
                  className={`w-full px-4 py-2 text-sm rounded-xl border transition-all duration-200 h-[36px]
                    ${theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
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
                  placeholderText={t("endDate")}
                  className={`w-full px-4 py-2 text-sm rounded-xl border transition-all duration-200 h-[36px]
                    ${theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  }`}
                  disabled={loading}
                />
              </div>
              {/* Modal Footer */}
              <div className={`p-6 border-t flex justify-end ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <Button
                  type="button"
                  className="rounded-xl px-6 py-2 font-semibold text-sm bg-red-500 hover:bg-red-600 text-white shadow"
                  onClick={() => setShowFilterModal(false)}
                >
                  {t("applyFiltersButton", { default: "Apply" })}
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Desktop filter controls removed: all filter/sort now in modal only */}
      {/* End of Card Header */}

      {/* Scrollable List Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 max-h-[420px]">
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-red-50'
              }`}>
                <FaSpinner className="animate-spin text-xl text-red-600" />
              </div>
              <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t("loadingExpenses")}
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t("pleaseWaitExpenses")}
              </p>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <FaReceipt className="text-xl text-gray-400" />
              </div>
              <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {search.trim() ? t("noMatchingExpenses") : t("noExpensesYet")}
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {search.trim() 
                  ? t("tryAdjustingSearch") 
                  : t("addFirstExpense")
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {renderedExpenses}
          </div>
        )}
      </div>
    </div>
  );
});

export default React.memo(ExpenseList);