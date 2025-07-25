// components/FinancePreview.tsx
import React, { useMemo } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeContext';
import { useTranslations } from "next-intl";

interface FinancePreviewProps {
  totalExpenses: number;
  totalIncomes: number;
  profit: number;
}

const FinancePreview: React.FC<FinancePreviewProps> = React.memo(({ totalExpenses, totalIncomes, profit }) => {
  const { theme } = useTheme();
  const t = useTranslations("DashboardPage");

  // Memoize conditional classes
  const incomeBlockClass = useMemo(() =>
    theme === 'dark'
      ? "bg-gradient-to-br from-green-800 to-green-700 p-3 rounded-lg border border-green-900 transform transition-all duration-300 hover:scale-102"
      : "bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-lg border border-green-200 transform transition-all duration-300 hover:scale-102"
  , [theme]);
  const incomeTitleClass = useMemo(() =>
    theme === 'dark'
      ? "text-base font-bold text-gray-200 mb-1"
      : "text-base font-bold text-green-800 mb-1"
  , [theme]);
  const incomeValueClass = useMemo(() =>
    theme === 'dark'
      ? "text-xl font-bold text-green-300"
      : "text-xl font-bold text-green-600"
  , [theme]);

  const expenseBlockClass = useMemo(() =>
    theme === 'dark'
      ? "bg-gradient-to-br from-red-800 to-red-700 p-3 rounded-lg border border-red-900 transform transition-all duration-300 hover:scale-102"
      : "bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-lg border border-red-200 transform transition-all duration-300 hover:scale-102"
  , [theme]);
  const expenseTitleClass = useMemo(() =>
    theme === 'dark'
      ? "text-base font-bold text-gray-200 mb-1"
      : "text-base font-bold text-red-800 mb-1"
  , [theme]);
  const expenseValueClass = useMemo(() =>
    theme === 'dark'
      ? "text-xl font-bold text-red-300"
      : "text-xl font-bold text-red-600"
  , [theme]);

  const profitBlockClass = useMemo(() =>
    profit > 0 
      ? theme === 'dark'
         ? "bg-gradient-to-br from-green-800 to-green-700 p-3 rounded-lg border border-green-900 transform transition-all duration-300 hover:scale-102"
         : "bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-lg border border-green-200 transform transition-all duration-300 hover:scale-102"
      : profit === 0
         ? theme === 'dark'
           ? "bg-gray-700 p-3 rounded-lg border border-gray-600 transform transition-all duration-300 hover:scale-102"
           : "bg-white p-3 rounded-lg border border-gray-100 transform transition-all duration-300 hover:scale-102"
         : theme === 'dark'
         ? "bg-gradient-to-br from-red-900 to-red-800 p-3 rounded-lg border border-red-900 transform transition-all duration-300 hover:scale-102"
         : "bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-lg border border-red-200 transform transition-all duration-300 hover:scale-102"
  , [profit, theme]);
  const profitTitleClass = useMemo(() =>
    theme === 'dark'
      ? "text-base font-bold text-gray-200 mb-1"
      : "text-base font-bold text-gray-800 mb-1"
  , [theme]);
  const profitValueClass = useMemo(() =>
    profit > 0
       ? theme === 'dark'
          ? "text-xl font-bold text-green-300"
          : "text-xl font-bold text-green-600"
       : profit === 0
          ? theme === 'dark'
             ? "text-xl font-bold text-gray-300"
             : "text-xl font-bold text-gray-600"
          : theme === 'dark'
             ? "text-xl font-bold text-red-300"
             : "text-xl font-bold text-red-600"
  , [profit, theme]);

  // Button classes (even smaller version) with increased vertical padding for a taller button
  const buttonClass =
    theme === 'dark'
      ? "inline-flex items-center justify-center text-gray-100 hover:bg-gray-600 font-bold text-base transition-all duration-300 px-6 py-3 rounded-full bg-gray-700 shadow-xl hover:shadow-xl transform hover:-translate-y-1 group"
      : "inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-base transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-xl hover:shadow-xl transform hover:-translate-y-1 group";

  return (
    <div className="space-y-4 h-full">
      {/* Total Income Block */}
      <div className={incomeBlockClass}>
        <h4 className={incomeTitleClass}>{t("totalIncome", { default: "Total Income" })}</h4>
        <p className={incomeValueClass}>${totalIncomes.toFixed(2)}</p>
      </div>

      {/* Total Expenses Block */}
      <div className={expenseBlockClass}>
        <h4 className={expenseTitleClass}>{t("totalExpenses", { default: "Total Expenses" })}</h4>
        <p className={expenseValueClass}>${totalExpenses.toFixed(2)}</p>
      </div>
      {/* Profit Block */}
      <div className={profitBlockClass}>
        <h4 className={profitTitleClass}>{t("netProfitLoss", { default: "Net Profit / Loss" })}</h4>
        <p className={profitValueClass}>${profit.toFixed(2)}</p>
      </div>
    </div>
  );
});

export default React.memo(FinancePreview);