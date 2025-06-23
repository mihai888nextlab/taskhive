import { FaArrowUp, FaArrowDown, FaMoneyBill } from 'react-icons/fa';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
      <div className="bg-blue-100 rounded-xl p-6 text-center shadow flex flex-col items-center">
        <FaMoneyBill className="text-blue-700 text-3xl mb-2" />
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Expenses</h3>
        <div className="text-3xl font-bold text-blue-900">${totalExpenses.toFixed(2)}</div>
        <div className="flex items-center mt-2 text-blue-700">
          {expenseTrend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          <span className="ml-1">{Math.abs(expenseTrend).toFixed(2)} today</span>
        </div>
      </div>
      <div className="bg-green-100 rounded-xl p-6 text-center shadow flex flex-col items-center">
        <FaMoneyBill className="text-green-700 text-3xl mb-2" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">Total Incomes</h3>
        <div className="text-3xl font-bold text-green-900">${totalIncomes.toFixed(2)}</div>
        <div className="flex items-center mt-2 text-green-700">
          {incomeTrend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          <span className="ml-1">{Math.abs(incomeTrend).toFixed(2)} today</span>
        </div>
      </div>
      <div className={`rounded-xl p-6 text-center shadow flex flex-col items-center ${profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
        <FaMoneyBill className={`text-3xl mb-2 ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`} />
        <h3 className={`text-lg font-semibold mb-2 ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>Profit</h3>
        <div className={`text-3xl font-bold ${profit >= 0 ? 'text-green-900' : 'text-red-900'}`}>${profit.toFixed(2)}</div>
        <div className={`flex items-center mt-2 ${profitTrend >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          {profitTrend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          <span className="ml-1">{Math.abs(profitTrend).toFixed(2)} today</span>
        </div>
      </div>
    </div>
  );
}