import React from 'react';
import FinanceSummaryCards from './FinanceSummaryCards';

interface FinanceSummarySectionProps {
  totalExpenses: number;
  totalIncomes: number;
  profit: number;
  expenseTrend: any;
  incomeTrend: any;
  profitTrend: any;
}

const FinanceSummarySection: React.FC<FinanceSummarySectionProps> = ({
  totalExpenses,
  totalIncomes,
  profit,
  expenseTrend,
  incomeTrend,
  profitTrend,
}) => (
  <div className="w-full">
    <FinanceSummaryCards
      totalExpenses={totalExpenses}
      totalIncomes={totalIncomes}
      profit={profit}
      expenseTrend={expenseTrend}
      incomeTrend={incomeTrend}
      profitTrend={profitTrend}
    />
  </div>
);

export default FinanceSummarySection;
