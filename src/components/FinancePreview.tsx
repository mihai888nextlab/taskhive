// components/FinancePreview.tsx
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

interface FinancePreviewProps {
  totalExpenses: number;
  totalIncomes: number;
  profit: number;
}

const FinancePreview: React.FC<FinancePreviewProps> = ({ totalExpenses, totalIncomes, profit }) => {
  return (
    // This div contains only the *internal content* of the finance card.
    // The outer card styling, title, and description are handled by the parent DashboardPage.
    <div className="space-y-4">
      {/* Total Income Block */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold text-gray-800 mb-1">Total Income</h4>
        <p className="text-green-600 text-2xl font-bold">${totalIncomes.toFixed(2)}</p>
      </div>

      {/* Total Expenses Block */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold text-gray-800 mb-1">Total Expenses</h4>
        <p className="text-red-600 text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
      </div>

      {/* Profit Block - styled dynamically */}
      <div className={`
          p-4 rounded-lg border shadow-sm
          ${profit >= 0
            ? 'bg-blue-50 border-blue-100'
            : 'bg-red-50 border-red-100'
          }
        `}>
        <h4 className="text-lg font-bold text-gray-800 mb-1">Net Profit / Loss</h4>
        <p className={`text-2xl font-bold
          ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}
        `}>
          ${profit.toFixed(2)}
        </p>
      </div>

      {/* View All Financials Button - NOW CORRECTLY INSIDE FinancePreview */}
      <div className="text-center mt-8">
        <Link
          href="/app/finance"
          className="inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-md hover:shadow-xl transform hover:-translate-y-1 group"
        >
          <span className="mr-3">View All Financials</span>
          <FaArrowRight className="text-xl transform transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default FinancePreview;