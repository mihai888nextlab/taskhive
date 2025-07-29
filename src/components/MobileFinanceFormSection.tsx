import React, { useState } from "react";
import ExpenseForm from '@/components/finance/ExpenseForm';
import IncomeForm from '@/components/finance/IncomeForm';

const MobileFinanceFormSection = ({ logic, theme, t }: any) => {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="w-full flex flex-col min-w-0">
      <button
        className="w-full mb-2 px-4 py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-md bg-primary text-white active:scale-95 transition-all"
        onClick={() => setShowForm((v) => !v)}
        aria-expanded={showForm}
        aria-controls="mobile-finance-form"
      >
        {showForm ? t('hideForm', { default: 'Hide Form' }) : t('addExpenseIncome', { type: logic.activeTab === 'expenses' ? t('expenses') : t('income') })}
      </button>
      {showForm && (
        <div id="mobile-finance-form" className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} flex flex-col overflow-hidden mx-0 sm:mx-2 mb-4`}>
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
                
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
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
      )}
    </div>
  );
};

export default MobileFinanceFormSection;
