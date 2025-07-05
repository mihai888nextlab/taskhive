import { FaArrowUp, FaArrowDown, FaMoneyBill, FaChartLine } from 'react-icons/fa';
import { useTheme } from '@/components/ThemeContext';
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  totalExpenses: number;
  totalIncomes: number;
  profit: number;
  expenseTrend: number;
  incomeTrend: number;
  profitTrend: number;
}

export default function FinanceSummaryCards({
  totalExpenses,
  totalIncomes,
  profit,
  expenseTrend,
  incomeTrend,
  profitTrend,
}: Props) {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Expenses Card */}
      <Card className={`rounded-xl p-5 border ${theme === 'dark' ? 'bg-red-900/10 border-gray-700' : 'bg-red-50/50 border-red-100'}`}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FaArrowDown className="text-red-500 text-lg mr-3" />
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>EXPENSES</p>
                <p className="text-4xl font-bold text-red-500 mt-1">${totalExpenses.toFixed(2)}</p>
              </div>
            </div>
            <div className={`flex items-center text-xs ${expenseTrend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {expenseTrend >= 0 ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
              ${Math.abs(expenseTrend).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Card */}
      <Card className={`rounded-xl p-5 border ${theme === 'dark' ? 'bg-green-900/10 border-gray-700' : 'bg-green-50/50 border-green-100'}`}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FaArrowUp className="text-green-500 text-lg mr-3" />
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>INCOME</p>
                <p className="text-4xl font-bold text-green-500 mt-1">${totalIncomes.toFixed(2)}</p>
              </div>
            </div>
            <div className={`flex items-center text-xs ${incomeTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {incomeTrend >= 0 ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
              ${Math.abs(incomeTrend).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit Card */}
      <Card className={`rounded-xl p-5 border ${
        theme === 'dark' 
          ? profit >= 0 ? 'bg-green-900/10 border-gray-700' : 'bg-red-900/10 border-gray-700'
          : profit >= 0 ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'
      }`}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FaChartLine className={`text-lg mr-3 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Profit</p>
                <p className={`text-4xl font-bold mt-1 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profit >= 0 ? '+' : '-'}${Math.abs(profit).toFixed(2)}
                </p>
              </div>
            </div>
            <div className={`flex items-center text-xs ${profitTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {profitTrend >= 0 ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
              ${Math.abs(profitTrend).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}