import React, { useState } from "react";
import ExpenseList from '@/components/finance/ExpenseList';
import IncomeList from '@/components/finance/IncomeList';
import ExpenseForm from '@/components/finance/ExpenseForm';
import IncomeForm from '@/components/finance/IncomeForm';
import { FaChartLine, FaPlus } from 'react-icons/fa';

const MobileListWithFormButton = ({ logic, theme, t }: any) => {
  const [showFormModal, setShowFormModal] = useState(false);
  return (
    <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} h-full max-h-[500px] flex flex-col overflow-hidden mx-0 sm:mx-2 mb-4`}>
      
      <div className={`flex-shrink-0 px-4 py-3 flex items-center justify-between ${
        logic.activeTab === 'expenses'
          ? (theme === "dark" ? "bg-red-900/20 border-gray-600" : "bg-red-50 border-gray-200")
          : (theme === "dark" ? "bg-green-900/20 border-gray-600" : "bg-green-50 border-gray-200")
      } border-b`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            logic.activeTab === 'expenses'
              ? theme === 'dark' ? 'bg-red-600' : 'bg-red-500'
              : theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
          }`}>
            <FaChartLine className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t('recent', { type: logic.activeTab === 'expenses' ? t('expenses') : t('income') })}</h2>
            <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{logic.activeTab === 'expenses' ? t('viewManageRecentExpenses') : t('viewManageRecentIncome')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          
          <button
            className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none transition-colors ${logic.activeTab === 'expenses' ? (theme === 'dark' ? 'bg-red-600 text-white' : 'bg-red-500 text-white') : (theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700')}`}
            onClick={() => logic.setActiveTab('expenses')}
            aria-pressed={logic.activeTab === 'expenses'}
          >
            {t('expenses')}
          </button>
          <button
            className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none transition-colors ${logic.activeTab === 'income' ? (theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white') : (theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700')}`}
            onClick={() => logic.setActiveTab('income')}
            aria-pressed={logic.activeTab === 'income'}
          >
            {t('income')}
          </button>
          <button
            className="ml-2 flex items-center justify-center rounded-full bg-primary text-white w-9 h-9 shadow-md active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
            onClick={() => setShowFormModal(true)}
            aria-label={t('addExpenseIncome', { type: logic.activeTab === 'expenses' ? t('expenses') : t('income') })}
          >
            <FaPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
          <div className={`relative w-full max-w-md mx-auto ${theme === "dark" ? "bg-gray-900" : "bg-white"} rounded-2xl shadow-lg border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} p-4`}>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold focus:outline-none"
              onClick={() => setShowFormModal(false)}
              aria-label={t('hideForm', { default: 'Hide Form' })}
            >
              &times;
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                logic.activeTab === 'expenses'
                  ? theme === 'dark' ? 'bg-red-600' : 'bg-red-500'
                  : theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
              }`}>
                <FaPlus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t('addExpenseIncome', { type: logic.activeTab === 'expenses' ? t('expenses') : t('income') })}</h2>
                <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{logic.activeTab === 'expenses' ? t('trackSpendingExpenses') : t('recordIncomeEarnings')}</p>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {logic.activeTab === 'expenses' ? (
                <ExpenseForm {...logic.expenseFormProps} />
              ) : (
                <IncomeForm {...logic.incomeFormProps} />
              )}
            </div>
          </div>
        </div>
      )}

      
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
        {logic.activeTab === 'expenses' ? (
          <ExpenseList {...logic.expenseListProps} />
        ) : (
          <IncomeList {...logic.incomeListProps} />
        )}
      </div>
    </div>
  );
};

export default MobileListWithFormButton;
