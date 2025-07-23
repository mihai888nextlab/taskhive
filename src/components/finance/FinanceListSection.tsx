import React from 'react';
import ExpenseList from './ExpenseList';
import IncomeList from './IncomeList';
import ExportDropdown from './ExportDropdown';
import { FaChartLine } from 'react-icons/fa';

interface FinanceListSectionProps {
  theme: string;
  activeTab: string;
  expenseListProps: any;
  incomeListProps: any;
  t: (key: string, opts?: any) => string;
  handleExportPDF: () => void;
  handleExportCSV: () => void;
}

const FinanceListSection: React.FC<FinanceListSectionProps> = ({
  theme,
  activeTab,
  expenseListProps,
  incomeListProps,
  t,
  handleExportPDF,
  handleExportCSV,
}) => (
  <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col min-w-0">
    <div className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-600" : "border-gray-200"} h-full max-h-[700px] flex flex-col overflow-hidden mx-0 sm:mx-2`}>
      <div className={`flex-shrink-0 px-4 py-3 ${
        activeTab === 'expenses' 
          ? theme === "dark" ? "bg-red-800/20 border-gray-600" : "bg-red-50 border-gray-200"
          : theme === "dark" ? "bg-green-800/20 border-gray-600" : "bg-green-50 border-gray-200"
      } border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              activeTab === 'expenses'
                ? theme === 'dark' ? 'bg-red-400' : 'bg-red-500'
                : theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
            }`}>
              <FaChartLine className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {t('recent', { type: activeTab === 'expenses' ? t('expenses') : t('income') })}
              </h2>
              <p className={`text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
                {activeTab === 'expenses' 
                  ? t('viewManageRecentExpenses')
                  : t('viewManageRecentIncome')
                }
              </p>
            </div>
          </div>
          {activeTab === 'expenses' && (
            <ExportDropdown
              loading={expenseListProps.loading}
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              theme={theme}
              t={t}
            />
          )}
          {activeTab === 'incomes' && (
            <ExportDropdown
              loading={incomeListProps.loading}
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              theme={theme}
              t={t}
            />
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
        {activeTab === 'expenses' ? (
          <ExpenseList {...expenseListProps} />
        ) : (
          <IncomeList {...incomeListProps} />
        )}
      </div>
    </div>
  </div>
);

export default FinanceListSection;
