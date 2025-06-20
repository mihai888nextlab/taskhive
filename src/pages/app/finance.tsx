import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import FinanceStatistics from '@/components/FinanceStatistics';
import { useTheme } from '@/components/ThemeContext';
import ExpenseForm from '@/components/finance/ExpenseForm';
import IncomeForm from '@/components/finance/IncomeForm';
import ExpenseList from '@/components/finance/ExpenseList';
import IncomeList from '@/components/finance/IncomeList';

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
          const date = new Date(item.date);
          const dayIndex = (new Date().getDate() - date.getDate() + 7) % 7;
          if (item.type === 'expense') {
            last7DaysExpenses[dayIndex] += item.amount;
          } else if (item.type === 'income') {
            last7DaysIncomes[dayIndex] += item.amount;
          }
        });

        setExpensesData(last7DaysExpenses);
        setIncomesData(last7DaysIncomes);
      }
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
      }
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
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchFinanceData();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchFinanceData();
      }
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
            <ExpenseForm
              title={expenseTitle}
              amount={expenseAmount}
              description={expenseDescription}
              loading={loading}
              theme={theme}
              onTitleChange={setExpenseTitle}
              onAmountChange={setExpenseAmount}
              onDescriptionChange={setExpenseDescription}
              onSubmit={handleExpenseSubmit}
            />
          </div>
          <div className={`p-6 rounded-lg shadow-md transition-transform transform hover:scale-101 duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className={`text-2xl font-semibold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Income:</h2>
            <IncomeForm
              title={incomeTitle}
              amount={incomeAmount}
              description={incomeDescription}
              loading={loading}
              theme={theme}
              onTitleChange={setIncomeTitle}
              onAmountChange={setIncomeAmount}
              onDescriptionChange={setIncomeDescription}
              onSubmit={handleIncomeSubmit}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Expenses:</h2>
            <ExpenseList
              expenses={expenses}
              loading={loading}
              onDelete={handleDeleteExpense}
              theme={theme}
            />
          </div>
          <div>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Incomes:</h2>
            <IncomeList
              incomes={incomes}
              loading={loading}
              onDelete={handleDeleteIncome}
              theme={theme}
            />
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