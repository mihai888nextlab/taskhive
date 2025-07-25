import React from 'react';
import DashboardLayout from '@/components/sidebar/DashboardLayout';
import FinanceSummaryCards from '@/components/finance/FinanceSummaryCards';
import FinanceTabs from '@/components/finance/FinanceTabs';
import ExpenseForm from '@/components/finance/ExpenseForm';
import IncomeForm from '@/components/finance/IncomeForm';
import ExpenseList from '@/components/finance/ExpenseList';
import IncomeList from '@/components/finance/IncomeList';
import CategoryPieChart from '@/components/finance/CategoryPieChart';
import UndoSnackbar from '@/components/finance/UndoSnackbar';
import StatsRangeButtons from '@/components/finance/StatsRangeButtons';
import { FaDollarSign, FaChartLine } from 'react-icons/fa';
import MobileListWithFormButton from '@/components/MobileListWithFormButton';
import { useFinance } from '@/hooks/useFinance';

const FinancePage = () => {
  const {
    theme,
    t,
    logic,
    expenseModalOpen,
    setExpenseModalOpen,
    incomeModalOpen,
    setIncomeModalOpen,
    selectedExpense,
    setSelectedExpense,
    selectedIncome,
    setSelectedIncome,
    handleExportPDF,
    handleExportCSV,
    search,
    setSearch,
    filteredExpenses,
    filteredIncomes,
    handleAddExpense,
    handleAddIncome,
    showUndo,
    handleUndo,
    deletedItem,
  } = useFinance();

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className={`flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} px-2 sm:px-4 lg:px-8 py-4 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className="max-w-full mx-auto">
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

      <div className="flex-1 px-1 sm:px-2 lg:px-4 py-2 overflow-x-hidden overflow-y-auto w-full">
        <div className="max-w-full mx-auto h-full">
          <div className="block md:hidden">
            <div className="w-full flex flex-col min-w-0">
              <MobileListWithFormButton logic={logic} theme={theme} t={t} />
            </div>
          </div>
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 h-full">
            <div className="col-span-1 flex flex-col gap-4 min-w-0">
              <FinanceTabs
                activeTab={logic.activeTab}
                setActiveTab={logic.setActiveTab}
                loading={logic.loading}
              />
              <div className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-600" : "border-gray-200"} h-fit max-h-full flex flex-col overflow-hidden mx-0 sm:mx-2`}>
                <div className={`flex-shrink-0 px-4 py-3 ${
                  logic.activeTab === 'expenses' 
                    ? theme === "dark" ? "bg-red-800/20 border-gray-600" : "bg-red-50 border-gray-200"
                    : theme === "dark" ? "bg-green-800/20 border-gray-600" : "bg-green-50 border-gray-200"
                } border-b`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      logic.activeTab === 'expenses'
                        ? theme === 'dark' ? 'bg-red-400' : 'bg-red-500'
                        : theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
                    }`}>
                      <FaDollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {t('addExpenseIncome', { type: logic.activeTab === 'expenses' ? t('expenses') : t('income') })}
                      </h2>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
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
            <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col min-w-0">
              <div className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-600" : "border-gray-200"} h-full max-h-[700px] flex flex-col overflow-hidden mx-0 sm:mx-2`}>
                <div className={`flex-shrink-0 px-4 py-3 ${
                  logic.activeTab === 'expenses' 
                    ? theme === "dark" ? "bg-red-800/20 border-gray-600" : "bg-red-50 border-gray-200"
                    : theme === "dark" ? "bg-green-800/20 border-gray-600" : "bg-green-50 border-gray-200"
                } border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        logic.activeTab === 'expenses'
                          ? theme === 'dark' ? 'bg-red-400' : 'bg-red-500'
                          : theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
                      }`}>
                        <FaChartLine className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {t('recent', { type: logic.activeTab === 'expenses' ? t('expenses') : t('income') })}
                        </h2>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
                          {logic.activeTab === 'expenses' 
                            ? t('viewManageRecentExpenses')
                            : t('viewManageRecentIncome')
                          }
                        </p>
                      </div>
                    </div>
                    {logic.activeTab === 'expenses' && (
                      <div className="relative export-dropdown" tabIndex={0}>
                        <button
                          type="button"
                          disabled={logic.expenseListProps.loading}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            logic.expenseListProps.loading
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : theme === 'dark'
                                ? 'bg-slate-600 text-white hover:bg-slate-700'
                                : 'bg-slate-500 text-white hover:bg-slate-600'
                          }`}
                          title={t("export")}
                          aria-haspopup="true"
                          aria-expanded="false"
                          tabIndex={0}
                          onClick={e => {
                            const dropdown = (e.currentTarget.parentElement?.querySelector('.export-dropdown-menu') as HTMLElement);
                            if (dropdown) {
                              dropdown.classList.toggle('hidden');
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                          <span>{t("export")}</span>
                          <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <div className={`export-dropdown-menu absolute z-20 left-0 mt-2 min-w-[110px] rounded-xl shadow-lg hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                          <button
                            type="button"
                            onClick={e => { handleExportPDF(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-t-xl focus:outline-none text-sm ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
                            disabled={logic.expenseListProps.loading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#E53E3E"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">PDF</text></svg>
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={e => { handleExportCSV(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-b-xl focus:outline-none text-sm ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
                            disabled={logic.expenseListProps.loading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#38A169"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">CSV</text></svg>
                            CSV
                          </button>
                        </div>
                      </div>
                    )}
                    {logic.activeTab === 'incomes' && (
                      <div className="relative export-dropdown" tabIndex={0}>
                        <button
                          type="button"
                          disabled={logic.incomeListProps.loading}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            logic.incomeListProps.loading
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : theme === 'dark'
                                ? 'bg-slate-600 text-white hover:bg-slate-700'
                                : 'bg-slate-500 text-white hover:bg-slate-600'
                          }`}
                          title={t("export")}
                          aria-haspopup="true"
                          aria-expanded="false"
                          tabIndex={0}
                          onClick={e => {
                            const dropdown = (e.currentTarget.parentElement?.querySelector('.export-dropdown-menu') as HTMLElement);
                            if (dropdown) {
                              dropdown.classList.toggle('hidden');
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                          <span>{t("export")}</span>
                          <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <div className={`export-dropdown-menu absolute z-20 left-0 mt-2 min-w-[110px] rounded-xl shadow-lg hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                          <button
                            type="button"
                            onClick={e => { handleExportPDF(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-t-xl focus:outline-none text-sm ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
                            disabled={logic.incomeListProps.loading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#E53E3E"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">PDF</text></svg>
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={e => { handleExportCSV(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-b-xl focus:outline-none text-sm ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
                            disabled={logic.incomeListProps.loading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#38A169"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">CSV</text></svg>
                            CSV
                          </button>
                        </div>
                      </div>
                    )}
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

      <UndoSnackbar
        show={showUndo}
        onUndo={handleUndo}
        deletedItem={deletedItem}
      />
    </div>
  );
};

FinancePage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default React.memo(FinancePage);