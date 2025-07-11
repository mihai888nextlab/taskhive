import React from "react";
import { FaTrash, FaFileCsv, FaFilePdf, FaSearch, FaSpinner, FaCoins } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { useTheme } from '@/components/ThemeContext';
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

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

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex-shrink-0 p-3 space-y-3">
        {/* Search and Export Row */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <Input
              type="text"
              placeholder={t("searchIncome")}
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className={`w-full pl-10 pr-4 text-sm rounded-xl border transition-all duration-200
                ${theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
              }`}
              style={{ height: "36px" }}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onExportCSV}
              disabled={loading}
              className={`p-2 rounded-xl font-medium transition-all duration-200 h-11 w-11 flex items-center justify-center
                ${loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              style={{ height: "36px", width: "36px", minWidth: "36px", minHeight: "36px" }}
              title={t("exportCSV")}
              variant="ghost"
            >
              <FaFileCsv className="w-4 h-4" />
            </Button>
            <Button
              onClick={onExportPDF}
              disabled={loading}
              className={`p-2 rounded-xl font-medium transition-all duration-200 h-11 w-11 flex items-center justify-center
                ${loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              style={{ height: "36px", width: "36px", minWidth: "36px", minHeight: "36px" }}
              title={t("exportPDF")}
              variant="ghost"
            >
              <FaFilePdf className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Category Filter */}
          <Select
            value={categoryFilter || undefined}
            onValueChange={onCategoryFilterChange}
            disabled={loading}
          >
            <SelectTrigger
              className={`w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 min-w-[140px]`}
              style={{ height: "36px" }}
            >
              <SelectValue placeholder={t("allCategories")} />
            </SelectTrigger>
            <SelectContent
              className={`rounded-xl border mt-1 ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-200"
              }`}
            >
              <SelectItem value="All" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">All Categories</SelectItem>
              {categories
                .filter(cat => cat !== "All")
                .map(cat => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
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
              className={`w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 min-w-[140px]`}
              style={{ height: "36px" }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={`rounded-xl border mt-1 ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-200"
              }`}
            >
              <SelectItem value="date-desc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("newestFirst")}</SelectItem>
              <SelectItem value="date-asc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("oldestFirst")}</SelectItem>
              <SelectItem value="amount-desc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("highestAmount")}</SelectItem>
              <SelectItem value="amount-asc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("lowestAmount")}</SelectItem>
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
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
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
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
            }`}
            disabled={loading}
          />
        </div>
      </div>

      {/* Scrollable List Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 max-h-[420px]">
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'
              }`}>
                <FaSpinner className="animate-spin text-xl text-green-600" />
              </div>
              <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t("loadingIncome")}
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t("pleaseWaitIncome")}
              </p>
            </div>
          </div>
        ) : incomes.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <FaCoins className="text-xl text-gray-400" />
              </div>
              <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {search.trim() ? t("noMatchingIncome") : t("noIncomeYet")}
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {search.trim() 
                  ? t("tryAdjustingSearch") 
                  : t("addFirstIncome")
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {incomes.map(income => (
              <div
                key={income._id}
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
                        {income.title}
                      </h3>
                      <span className="text-lg font-bold text-green-500">
                        +${income.amount.toFixed(2)}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {income.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {income.date ? new Date(income.date).toLocaleDateString() : "No date"}
                      </span>
                      {income.category && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          theme === 'dark' 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {income.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => onDelete(income)}
                    className={`ml-4 p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                      theme === 'dark' 
                        ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Delete Income"
                    variant="ghost"
                  >
                    <FaTrash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeList;