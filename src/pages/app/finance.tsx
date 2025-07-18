import React from 'react';
// ...existing code...
import DashboardLayout from '@/components/sidebar/DashboardLayout';
import FinanceStatistics from '@/components/FinanceStatistics';
import { useTheme } from '@/components/ThemeContext';
import ExpenseForm from '@/components/finance/ExpenseForm';
import IncomeForm from '@/components/finance/IncomeForm';
import ExpenseList from '@/components/finance/ExpenseList';
import IncomeList from '@/components/finance/IncomeList';
import useFinancePageLogic from '@/components/finance/useFinancePageLogic';
import FinanceSummaryCards from '@/components/finance/FinanceSummaryCards';
import FinanceTabs from '@/components/finance/FinanceTabs';
import CategoryPieChart from '@/components/finance/CategoryPieChart';
import UndoSnackbar from '@/components/finance/UndoSnackbar';
import StatsRangeButtons from '@/components/finance/StatsRangeButtons';
import { FaDollarSign, FaChartLine } from 'react-icons/fa';
import { useTranslations } from "next-intl";

import MobileListWithFormButton from '@/components/MobileListWithFormButton';

const FinancePage = () => {
  const { theme } = useTheme();
  const logic = useFinancePageLogic();
  const t = useTranslations("FinancePage");

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header Section - Fixed Height */}
      <div className={`flex-shrink-0 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} px-2 sm:px-4 lg:px-8 py-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-full mx-auto">
          {/* Summary Cards */}
          <div className="w-full">
            <FinanceSummaryCards
              totalExpenses={logic.totalExpenses}
              totalIncomes={logic.totalIncomes}
              profit={logic.profit}
              expenseTrend={logic.expenseTrend}
              incomeTrend={logic.incomeTrend}
              profitTrend={logic.profitTrend}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="flex-1 px-1 sm:px-2 lg:px-4 py-2 overflow-x-hidden overflow-y-auto w-full">
        <div className="max-w-full mx-auto h-full">
          {/* Mobile: List first, form toggleable below. Desktop: grid as before */}
          <div className="block md:hidden">
            {/* List at the top on mobile */}
            <div className="w-full flex flex-col min-w-0">
              <MobileListWithFormButton logic={logic} theme={theme} t={t} />
            </div>
          </div>
          {/* Desktop/tablet: grid layout as before */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 h-full">
            {/* Tabs + Form Column */}
            <div className="col-span-1 flex flex-col gap-4 min-w-0">
              <FinanceTabs
                activeTab={logic.activeTab}
                setActiveTab={logic.setActiveTab}
                loading={logic.loading}
              />
              <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} h-fit max-h-full flex flex-col overflow-hidden mx-0 sm:mx-2`}>
                <div className={`flex-shrink-0 px-4 py-3 ${
                  logic.activeTab === 'expenses' 
                    ? theme === "dark" ? "bg-red-900/20 border-gray-600" : "bg-red-50 border-gray-200"
                    : theme === "dark" ? "bg-green-900/20 border-gray-600" : "bg-green-50 border-gray-200"
                } border-b`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      logic.activeTab === 'expenses'
                        ? theme === 'dark' ? 'bg-red-600' : 'bg-red-500'
                        : theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
                    }`}>
                      <FaDollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {t('addExpenseIncome', { type: logic.activeTab === 'expenses' ? t('expenses') : t('income') })}
                      </h2>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        {logic.activeTab === 'expenses' 
                          ? t('trackSpendingExpenses')
                          : t('recordIncomeEarnings')
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                  {logic.activeTab === 'expenses' ? (
                    <ExpenseForm {...logic.expenseFormProps} />
                  ) : (
                    <IncomeForm {...logic.incomeFormProps} />
                  )}
                </div>
              </div>
            </div>
            {/* List Column - Responsive */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col min-w-0">
              <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} h-full max-h-[700px] flex flex-col overflow-hidden mx-0 sm:mx-2`}>
                <div className={`flex-shrink-0 px-4 py-3 ${
                  logic.activeTab === 'expenses' 
                    ? theme === "dark" ? "bg-red-900/20 border-gray-600" : "bg-red-50 border-gray-200"
                    : theme === "dark" ? "bg-green-900/20 border-gray-600" : "bg-green-50 border-gray-200"
                } border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        logic.activeTab === 'expenses'
                          ? theme === 'dark' ? 'bg-red-600' : 'bg-red-500'
                          : theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
                      }`}>
                        <FaChartLine className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {t('recent', { type: logic.activeTab === 'expenses' ? t('expenses') : t('income') })}
                        </h2>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                          {logic.activeTab === 'expenses' 
                            ? t('viewManageRecentExpenses')
                            : t('viewManageRecentIncome')
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
                  {logic.activeTab === 'expenses' ? (
                    <ExpenseList {...logic.expenseListProps} />
                  ) : (
                    <IncomeList {...logic.incomeListProps} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Undo Snackbar */}
      <UndoSnackbar
        show={logic.showUndo}
        onUndo={logic.handleUndo}
        deletedItem={logic.deletedItem}
      />
    </div>
  );
};

FinancePage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default React.memo(FinancePage);

// All expensive calculations and event handlers are already memoized with useMemo.
// The page component is wrapped with React.memo.