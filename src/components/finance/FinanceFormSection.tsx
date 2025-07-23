import React from 'react';
import FinanceTabs from './FinanceTabs';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
import { FaDollarSign } from 'react-icons/fa';

interface FinanceFormSectionProps {
  theme: string;
  activeTab: 'expenses' | 'incomes';
  setActiveTab: (tab: 'expenses' | 'incomes') => void;
  loading: boolean;
  expenseFormProps: any;
  incomeFormProps: any;
  t: (key: string, opts?: any) => string;
}

const FinanceFormSection: React.FC<FinanceFormSectionProps> = ({
  theme,
  activeTab,
  setActiveTab,
  loading,
  expenseFormProps,
  incomeFormProps,
  t,
}) => (
  <div className="col-span-1 flex flex-col gap-4 min-w-0">
    <FinanceTabs activeTab={activeTab} setActiveTab={setActiveTab} loading={loading} />
    <div className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-600" : "border-gray-200"} h-fit max-h-full flex flex-col overflow-hidden mx-0 sm:mx-2`}>
      <div className={`flex-shrink-0 px-4 py-3 ${
        activeTab === 'expenses' 
          ? theme === "dark" ? "bg-red-800/20 border-gray-600" : "bg-red-50 border-gray-200"
          : theme === "dark" ? "bg-green-800/20 border-gray-600" : "bg-green-50 border-gray-200"
      } border-b`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            activeTab === 'expenses'
              ? theme === 'dark' ? 'bg-red-400' : 'bg-red-500'
              : theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
          }`}>
            <FaDollarSign className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {t('addExpenseIncome', { type: activeTab === 'expenses' ? t('expenses') : t('income') })}
            </h2>
            <p className={`text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
              {activeTab === 'expenses' 
                ? t('trackSpendingExpenses')
                : t('recordIncomeEarnings')
              }
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        {activeTab === 'expenses' ? (
          <ExpenseForm {...expenseFormProps} />
        ) : (
          <IncomeForm {...incomeFormProps} />
        )}
      </div>
    </div>
  </div>
);

export default FinanceFormSection;
