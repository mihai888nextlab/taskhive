import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaEdit, FaTrash } from 'react-icons/fa'; // Added FaEdit and FaTrash for consistency
import Loading from '@/components/Loading';
import DashboardLayout from '@/components/DashboardLayout';

// Define the Expense and Income interfaces
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
  const [userId, setUserId] = useState('');

  // States for expenses
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // States for incomes
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDescription, setIncomeDescription] = useState('');
  const [incomes, setIncomes] = useState<Income[]>([]);

  const [loading, setLoading] = useState(false);

  // Fetch user ID from the get-users endpoint
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

  // Fetch expenses and incomes
  const fetchFinanceData = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await fetch('/api/expenses'); // Assuming this endpoint returns both expenses and incomes
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.filter((item: any) => item.type === 'expense'));
        setIncomes(data.filter((item: any) => item.type === 'income'));
      } else {
        console.error("Failed to fetch finance data:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
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
        fetchFinanceData(); // Refresh the data
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
        fetchFinanceData(); // Refresh the data
      } else {
        console.error("Failed to submit income:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting income:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for deleting an item (expense or income)
  const handleDeleteItem = async (id: string, type: 'expense' | 'income') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/expenses?id=${id}`, { // Assuming a single endpoint for deletion
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFinanceData(); // Refresh the data
      } else {
        console.error(`Failed to delete ${type}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total expenses and incomes
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalIncomes = incomes.reduce((total, income) => total + income.amount, 0);
  const profit = totalIncomes - totalExpenses;

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-xl p-8 mb-8"> {/* Adjusted padding and shadow */}
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800 flex items-center justify-center">
          <FaMoneyBillWave className="mr-3 text-blue-500" /> {/* Larger icon, blue color */}
          Your Financial Overview
        </h1>

        {/* Profit Display */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Profit: ${profit.toFixed(2)}
          </h2>
        </div>

        {/* Form Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10"> {/* Increased gap, added responsiveness */}
          {/* Expenses Form */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md"> {/* Light background for form */}
            <h2 className="text-2xl font-semibold mb-5 text-gray-700">Add New Expense:</h2>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <input
                type="text"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="Expense Title"
                className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                required
              />
              <input
                type="number" // Changed to number type for amount
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Amount (e.g., 50.00)"
                className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                step="0.01" // Allow decimal input
                required
              />
              <textarea // Changed to textarea for description
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Description of the expense"
                className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 h-24 resize-y"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-semibold text-lg flex items-center justify-center"
                disabled={loading} // Disable button while loading
              >
                {loading ? <Loading /> : "Add Expense"}
              </button>
            </form>
          </div>

          {/* Income Form */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md"> {/* Light background for form */}
            <h2 className="text-2xl font-semibold mb-5 text-gray-700">Add New Income:</h2>
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <input
                type="text"
                value={incomeTitle}
                onChange={(e) => setIncomeTitle(e.target.value)}
                placeholder="Income Title"
                className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200"
                required
              />
              <input
                type="number" // Changed to number type for amount
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                placeholder="Amount (e.g., 100.00)"
                className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200"
                step="0.01" // Allow decimal input
                required
              />
              <textarea // Changed to textarea for description
                value={incomeDescription}
                onChange={(e) => setIncomeDescription(e.target.value)}
                placeholder="Description of the income"
                className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 h-24 resize-y"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out font-semibold text-lg flex items-center justify-center"
                disabled={loading} // Disable button while loading
              >
                {loading ? <Loading /> : "Add Income"}
              </button>
            </form>
          </div>
        </div>

        {/* Display Expenses and Incomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Adjusted gap for better spacing */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Expenses:</h2>
            {loading ? ( // Display loading state for data fetching
              <div className="text-center py-4">
                <Loading />
                <p className="text-gray-600 mt-2">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No expenses recorded yet.</p>
            ) : (
              expenses.map(expense => (
                <div key={expense._id} className="bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm mb-4 flex items-center justify-between transition duration-200 hover:shadow-md">
                  <div>
                    <h3 className="font-bold text-lg text-red-700">{expense.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{expense.description}</p>
                    <p className="font-semibold text-red-600 mt-2">Amount: ${expense.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    {/* Add edit functionality later if needed */}
                    <button
                      onClick={() => handleDeleteItem(expense._id, 'expense')}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition duration-200"
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Incomes:</h2>
            {loading ? ( // Display loading state for data fetching
              <div className="text-center py-4">
                <Loading />
                <p className="text-gray-600 mt-2">Loading incomes...</p>
              </div>
            ) : incomes.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No incomes recorded yet.</p>
            ) : (
              incomes.map(income => (
                <div key={income._id} className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-sm mb-4 flex items-center justify-between transition duration-200 hover:shadow-md">
                  <div>
                    <h3 className="font-bold text-lg text-green-700">{income.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{income.description}</p>
                    <p className="font-semibold text-green-600 mt-2">Amount: ${income.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    {/* Add edit functionality later if needed */}
                    <button
                      onClick={() => handleDeleteItem(income._id, 'income')}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition duration-200"
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
    </DashboardLayout>
  );
};

export default FinancePage;