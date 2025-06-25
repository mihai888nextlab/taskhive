import React from 'react';
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

const FinancePage = () => {
  const { theme } = useTheme();
  const logic = useFinancePageLogic();

  return (
    <DashboardLayout>
      <div className={`rounded-lg shadow-xl p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-100 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <h1 className={`text-4xl font-extrabold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Your Financial Overview
        </h1>

        <StatsRangeButtons statsRange={logic.statsRange} setStatsRange={logic.setStatsRange} />

        <FinanceSummaryCards
          totalExpenses={logic.totalExpenses}
          totalIncomes={logic.totalIncomes}
          profit={logic.profit}
          expenseTrend={logic.expenseTrend}
          incomeTrend={logic.incomeTrend}
          profitTrend={logic.profitTrend}
        />

        <FinanceTabs
          activeTab={logic.activeTab}
          setActiveTab={logic.setActiveTab}
          loading={logic.loading}
        />

        <div className="rounded-b-lg shadow-inner p-6 bg-gray-50">
          {logic.activeTab === 'expenses' ? (
            <div id="expenses-panel" role="tabpanel">
              <h2 className={`text-2xl font-semibold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Expense:</h2>
              <ExpenseForm {...logic.expenseFormProps} />
              <h2 className={`text-2xl font-semibold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Expenses:</h2>
              <ExpenseList {...logic.expenseListProps} />
            </div>
          ) : (
            <div id="incomes-panel" role="tabpanel">
              <h2 className={`text-2xl font-semibold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Income:</h2>
              <IncomeForm {...logic.incomeFormProps} />
              <h2 className={`text-2xl font-semibold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Incomes:</h2>
              <IncomeList {...logic.incomeListProps} />
            </div>
          )}
        </div>
      </div>
{/* 
      <CategoryPieChart
        data={logic.pieChartData}
        options={logic.pieChartOptions}
        theme={theme}
      />

      <div className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-100 mt-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-4 border-b-2 pb-2 ${theme === 'dark' ? 'text-white border-blue-200' : 'text-gray-900 border-blue-200'}`}>
          Financial Statistics (Last 7 Days)
        </h2>
        <FinanceStatistics
          expensesData={logic.expensesData}
          incomesData={logic.incomesData}
          labels={logic.chartLabels}
        />
      </div> */}

      <UndoSnackbar
        show={logic.showUndo}
        onUndo={logic.handleUndo}
        deletedItem={logic.deletedItem}
      />
    </DashboardLayout>
  );
};

export default FinancePage;