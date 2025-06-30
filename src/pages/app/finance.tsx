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
      <div className='px-10'>
      <StatsRangeButtons statsRange={logic.statsRange} setStatsRange={logic.setStatsRange} />
      {/* Summary Cards with Trend Arrows */}
      <div className="mb-6">
        <FinanceSummaryCards
          totalExpenses={logic.totalExpenses}
          totalIncomes={logic.totalIncomes}
          profit={logic.profit}
          expenseTrend={logic.expenseTrend}
          incomeTrend={logic.incomeTrend}
          profitTrend={logic.profitTrend}
        />
      </div>

      {/* Tabs */}
      <FinanceTabs
        activeTab={logic.activeTab}
        setActiveTab={logic.setActiveTab}
        loading={logic.loading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
          {logic.activeTab === 'expenses' ? (
            <ExpenseForm {...logic.expenseFormProps} />
          ) : (
            <IncomeForm {...logic.incomeFormProps} />
          )}
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          <div className={`rounded-xl p-6 shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent {logic.activeTab === 'expenses' ? 'Expenses' : 'Income'}
            </h3>
            {logic.activeTab === 'expenses' ? (
              <ExpenseList {...logic.expenseListProps} />
            ) : (
              <IncomeList {...logic.incomeListProps} />
            )}
          </div>
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
      </div>
    </DashboardLayout>
  );
};

export default FinancePage;