import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaTrash } from 'react-icons/fa';
import Loading from '@/components/Loading';
import DashboardLayout from '@/components/DashboardLayout';
import FinanceStatistics from '@/components/FinanceStatistics';
import { useTheme } from '@/components/ThemeContext';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'expense';
}

interface Income {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'income';
}

const FinancePage = () => {
  const { theme } = useTheme();
  const [userId, setUserId] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDescription, setIncomeDescription] = useState('');
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [expensesData, setExpensesData] = useState<number[]>([]);
  const [incomesData, setIncomesData] = useState<number[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/get-users');
      if (response.ok) {
        const data = await response.json();
        if (data.users.length > 0) {
          setUserId(data.users[0].userId._id);
        }
      } else {
        console.error("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.filter((item: any) => item.type === 'expense'));
        setIncomes(data.filter((item: any) => item.type === 'income'));

        // Prepare data for the last 7 days
        const last7DaysExpenses = Array(7).fill(0);
        const last7DaysIncomes = Array(7).fill(0);

        data.forEach((item: any) => {
          const date = new Date(item.date); // Assuming you have a date field
          const dayIndex = (new Date().getDate() - date.getDate() + 7) % 7; // Calculate index for the last 7 days
          if (item.type === 'expense') {
            last7DaysExpenses[dayIndex] += item.amount;
          } else if (item.type === 'income') {
            last7DaysIncomes[dayIndex] += item.amount;
          }
        });

        setExpensesData(last7DaysExpenses);
        setIncomesData(last7DaysIncomes);
      } else {
        console.error("Failed to fetch finance data:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const expenseData = {
      userId,
      title: expenseTitle,
      amount: parseFloat(expenseAmount),
      description: expenseDescription,
      type: 'expense',
    };

    try {
      const response = await fetch(`/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        setExpenseTitle('');
        setExpenseAmount('');
        setExpenseDescription('');
        fetchFinanceData();
      } else {
        console.error("Failed to submit expense:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const incomeData = {
      userId,
      title: incomeTitle,
      amount: parseFloat(incomeAmount),
      description: incomeDescription,
      type: 'income',
    };

    try {
      const response = await fetch(`/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeData),
      });

      if (response.ok) {
        setIncomeTitle('');
        setIncomeAmount('');
        setIncomeDescription('');
        fetchFinanceData();
      } else {
        console.error("Failed to submit income:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting income:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, type: 'expense' | 'income') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFinanceData();
      } else {
        console.error(`Failed to delete ${type}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalIncomes = incomes.reduce((total, income) => total + income.amount, 0);
  const profit = totalIncomes - totalExpenses;

  return (
    <DashboardLayout>
      <div className={`rounded-lg shadow-xl p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-100 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <h1 className={`text-4xl font-extrabold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Your Financial Overview
        </h1>

        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Profit: ${profit.toFixed(2)}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className={`p-6 rounded-lg shadow-md transition-transform transform hover:scale-101 duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className={`text-2xl font-semibold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Expense:</h2>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <input
                type="text"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="Expense Title"
                className={`border border-gray-600 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                required
              />
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Amount (e.g., 50.00)"
                className={`border border-gray-600 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                step="0.01"
                required
              />
              <textarea
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Description of the expense"
                className={`border border-gray-600 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 h-24 resize-y`}
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-semibold text-lg flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <Loading /> : "Add Expense"}
              </button>
            </form>
          </div>

          <div className={`p-6 rounded-lg shadow-md transition-transform transform hover:scale-101 duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className={`text-2xl font-semibold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Income:</h2>
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <input
                type="text"
                value={incomeTitle}
                onChange={(e) => setIncomeTitle(e.target.value)}
                placeholder="Income Title"
                className={`border border-gray-600 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} p-3 w-full rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200`}
                required
              />
              <input
                type="number"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                placeholder="Amount (e.g., 100.00)"
                className={`border border-gray-600 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} p-3 w-full rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200`}
                step="0.01"
                required
              />
              <textarea
                value={incomeDescription}
                onChange={(e) => setIncomeDescription(e.target.value)}
                placeholder="Description of the income"
                className={`border border-gray-600 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} p-3 w-full rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 h-24 resize-y`}
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out font-semibold text-lg flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <Loading /> : "Add Income"}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Expenses:</h2>
            {loading ? (
              <div className="text-center py-4">
                <Loading />
                <p className="text-gray-400 mt-2">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No expenses recorded yet.</p>
            ) : (
              expenses.map(expense => (
                <div key={expense._id} className="bg-red-800 border border-red-600 rounded-lg p-5 shadow-sm mb-4 flex items-center justify-between transition-transform hover:scale-101 hover:shadow-md transition-all duration-200">
                  <div>
                    <h3 className="font-bold text-lg text-red-300">{expense.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{expense.description}</p>
                    <p className="font-semibold text-red-300 mt-2">Amount: ${expense.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteItem(expense._id, 'expense')}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-600 transition duration-200"
                      title="Delete Expense"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Incomes:</h2>
            {loading ? (
              <div className="text-center py-4">
                <Loading />
                <p className="text-gray-400 mt-2">Loading incomes...</p>
              </div>
            ) : incomes.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No incomes recorded yet.</p>
            ) : (
              incomes.map(income => (
                <div key={income._id} className="bg-green-800 border border-green-600 rounded-lg p-5 shadow-sm mb-4 flex items-center justify-between transition-transform hover:scale-101 hover:shadow-md transition-all duration-200">
                  <div>
                    <h3 className="font-bold text-lg text-green-300">{income.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{income.description}</p>
                    <p className="font-semibold text-green-300 mt-2">Amount: ${income.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteItem(income._id, 'income')}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-600 transition duration-200"
                      title="Delete Income"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
      <div className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-100 mt-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-4 border-b-2 pb-2 ${theme === 'dark' ? 'text-white border-blue-200' : 'text-gray-900 border-blue-200'}`}>
          Financial Statistics (Last 7 Days)
        </h2>
        <FinanceStatistics expensesData={expensesData} incomesData={incomesData} />
      </div>
    </DashboardLayout>
  );
};

export default FinancePage;