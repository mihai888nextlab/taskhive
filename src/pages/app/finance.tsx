import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import FinanceStatistics from '@/components/FinanceStatistics';
import { useTheme } from '@/components/ThemeContext';
import ExpenseForm from '@/components/finance/ExpenseForm';
import IncomeForm from '@/components/finance/IncomeForm';
import ExpenseList from '@/components/finance/ExpenseList';
import IncomeList from '@/components/finance/IncomeList';
import { FaArrowUp, FaArrowDown, FaMoneyBill, FaFileCsv, FaFilePdf, FaUndo, FaTrash } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from "jspdf"; // Uncomment if you add jsPDF
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

const categories = [
  'General', 'Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Salary', 'Investment', 'Other'
];

interface Expense {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'expense';
  date?: string;
  category?: string;
}

interface Income {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'income';
  date?: string;
  category?: string;
}

type FinanceItem = Expense | Income;

const FinancePage = () => {
  const { theme } = useTheme();
  const [userId, setUserId] = useState('');
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', description: '', date: new Date(), category: categories[0] });
  const [incomeForm, setIncomeForm] = useState({ title: '', amount: '', description: '', date: new Date(), category: categories[0] });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [expensesDataWeek, setExpensesDataWeek] = useState<number[]>([]);
  const [incomesDataWeek, setIncomesDataWeek] = useState<number[]>([]);
  const [expensesDataMonth, setExpensesDataMonth] = useState<number[]>([]);
  const [incomesDataMonth, setIncomesDataMonth] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses');
  const [search, setSearch] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showUndo, setShowUndo] = useState(false);
  const [deletedItem, setDeletedItem] = useState<FinanceItem | null>(null);
  const [statsRange, setStatsRange] = useState<'week' | 'month'>('week');
  const undoTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch user and finance data
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

        // Prepare data for the last 7 days (week)
        const last7DaysExpenses = Array(7).fill(0);
        const last7DaysIncomes = Array(7).fill(0);

        // Prepare data for the last 30 days (month)
        const last30DaysExpenses = Array(30).fill(0);
        const last30DaysIncomes = Array(30).fill(0);

        data.forEach((item: any) => {
          const date = new Date(item.date);
          const today = new Date();
          const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            if (item.type === 'expense') {
              last7DaysExpenses[6 - diffDays] += item.amount;
            } else if (item.type === 'income') {
              last7DaysIncomes[6 - diffDays] += item.amount;
            }
          }
          if (diffDays >= 0 && diffDays < 30) {
            if (item.type === 'expense') {
              last30DaysExpenses[29 - diffDays] += item.amount;
            } else if (item.type === 'income') {
              last30DaysIncomes[29 - diffDays] += item.amount;
            }
          }
        });

        setExpensesDataWeek(last7DaysExpenses);
        setIncomesDataWeek(last7DaysIncomes);
        setExpensesDataMonth(last30DaysExpenses);
        setIncomesDataMonth(last30DaysIncomes);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Filtering, searching, sorting
  useEffect(() => {
    const filterAndSort = <T extends FinanceItem>(items: T[]) => {
      let filtered = items;
      if (categoryFilter !== 'All') {
        filtered = filtered.filter(i => i.category === categoryFilter);
      }
      if (dateRange[0] && dateRange[1]) {
        filtered = filtered.filter(i => {
          const d = new Date(i.date || '');
          return d >= dateRange[0]! && d <= dateRange[1]!;
        });
      }
      if (search) {
        filtered = filtered.filter(i =>
          Object.values(i)
            .join(' ')
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }
      filtered = filtered.sort((a, b) => {
        if (sortBy === 'date') {
          const da = new Date(a.date || 0).getTime();
          const db = new Date(b.date || 0).getTime();
          return sortOrder === 'asc' ? da - db : db - da;
        } else {
          return sortOrder === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount;
        }
      });
      return filtered;
    };
    setFilteredExpenses(filterAndSort(expenses));
    setFilteredIncomes(filterAndSort(incomes));
  }, [search, expenses, incomes, sortBy, sortOrder, categoryFilter, dateRange]);

  // Form handlers
  const handleExpenseFormChange = (field: string, value: any) => {
    setExpenseForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleIncomeFormChange = (field: string, value: any) => {
    setIncomeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const expenseData = {
      userId,
      title: expenseForm.title,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description,
      date: expenseForm.date,
      category: expenseForm.category,
      type: 'expense',
    };
    try {
      const response = await fetch(`/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      if (response.ok) {
        setExpenseForm({ title: '', amount: '', description: '', date: new Date(), category: categories[0] });
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
      title: incomeForm.title,
      amount: parseFloat(incomeForm.amount),
      description: incomeForm.description,
      date: incomeForm.date,
      category: incomeForm.category,
      type: 'income',
    };
    try {
      const response = await fetch(`/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeData),
      });
      if (response.ok) {
        setIncomeForm({ title: '', amount: '', description: '', date: new Date(), category: categories[0] });
        fetchFinanceData();
      }
    } finally {
      setLoading(false);
    }
  };

  // Undo delete logic
  const handleDelete = (item: FinanceItem, type: 'expense' | 'income') => {
    setDeletedItem(item);
    setShowUndo(true);

    // Optimistically remove from UI
    if (type === 'expense') {
      setExpenses(prev => prev.filter(e => e._id !== item._id));
    } else {
      setIncomes(prev => prev.filter(i => i._id !== item._id));
    }

    undoTimeout.current = setTimeout(async () => {
      await finalizeDelete(item._id, type);
      setShowUndo(false);
      setDeletedItem(null);
      // Optionally, fetch again to ensure sync
      fetchFinanceData();
    }, 5000);
  };
  const finalizeDelete = async (id: string, type: 'expense' | 'income') => {
    setLoading(true);
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      // No need to update state here, already done optimistically
    } finally {
      setLoading(false);
    }
  };
  const handleUndo = () => {
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    setShowUndo(false);
    if (deletedItem) {
      // Restore the deleted item
      if (deletedItem.type === 'expense') {
        setExpenses(prev => [deletedItem as Expense, ...prev]);
      } else {
        setIncomes(prev => [deletedItem as Income, ...prev]);
      }
    }
    setDeletedItem(null);
  };

  // Inline editing (scaffold, you can expand)
  const handleInlineEdit = async (item: FinanceItem, field: string, value: any, type: 'expense' | 'income') => {
    setLoading(true);
    try {
      await fetch(`/api/expenses/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, [field]: value }),
      });
      fetchFinanceData();
    } finally {
      setLoading(false);
    }
  };

  // CSV Export
  const exportCSV = (type: 'expenses' | 'incomes') => {
    const items = type === 'expenses' ? filteredExpenses : filteredIncomes;
    const csvRows = [
      ['Title', 'Amount', 'Description', 'Date', 'Category'],
      ...items.map((item) => [
        item.title,
        item.amount,
        item.description,
        item.date ? new Date(item.date).toLocaleDateString() : '',
        item.category || '',
      ]),
    ];
    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // PDF Export (scaffold, requires jsPDF)
  const exportPDF = (type: 'expenses' | 'incomes') => {
    const items = type === 'expenses' ? filteredExpenses : filteredIncomes;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      14,
      18
    );
    doc.setFontSize(12);

    // Table headers
    const headers = [["Title", "Amount", "Description", "Date", "Category"]];
    // Table rows
    const rows = items.map((item) => [
      item.title,
      item.amount.toFixed(2),
      item.description,
      item.date ? new Date(item.date).toLocaleDateString() : "",
      item.category || "",
    ]);

    // Simple table rendering
    let y = 28;
    headers.concat(rows).forEach((row, i) => {
      let x = 14;
      row.forEach((cell, j) => {
        doc.text(String(cell), x, y);
        x += [40, 25, 50, 25, 25][j]; // Adjust column widths as needed
      });
      y += 8;
      // Add new page if needed
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
    });

    doc.save(`${type}.pdf`);
  };

  // Pie chart data for category breakdown
  const getCategoryBreakdown = (items: FinanceItem[], days: number) => {
    const map: Record<string, number> = {};
    const today = new Date();
    items.forEach(i => {
      if (!i.date) return;
      const d = new Date(i.date);
      const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays < days) {
        const cat = i.category || 'Other';
        map[cat] = (map[cat] || 0) + i.amount;
      }
    });
    return map;
  };

  const pieData = activeTab === 'expenses'
    ? getCategoryBreakdown(expenses, statsRange === 'week' ? 7 : 30)
    : getCategoryBreakdown(incomes, statsRange === 'week' ? 7 : 30);

  const pieChartData = {
    labels: Object.keys(pieData),
    datasets: [
      {
        data: Object.values(pieData),
        backgroundColor: [
          '#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#38bdf8', '#facc15', '#818cf8', '#fcd34d'
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: theme === 'dark' ? '#fff' : '#222',
          font: { size: 14 }
        }
      }
    }
  };

  // Moved inside the component
  const expensesData = statsRange === 'week' ? expensesDataWeek : expensesDataMonth;
  const incomesData = statsRange === 'week' ? incomesDataWeek : incomesDataMonth;

  const totalExpenses = expensesData.reduce((total, amount) => total + amount, 0);
  const totalIncomes = incomesData.reduce((total, amount) => total + amount, 0);
  const profit = totalIncomes - totalExpenses;
  const expenseTrend = expensesData[expensesData.length - 1] - (expensesData[expensesData.length - 2] || 0);
  const incomeTrend = incomesData[incomesData.length - 1] - (incomesData[expensesData.length - 2] || 0);
  const profitTrend = incomeTrend - expenseTrend;

  // Labels for the chart
  const weekLabels = ['Today', 'Yesterday', '2 Days Ago', '3 Days Ago', '4 Days Ago', '5 Days Ago', '6 Days Ago'];
  const monthLabels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString();
  });
  const chartLabels = statsRange === 'week' ? weekLabels : monthLabels;

  return (
    <DashboardLayout>
      <div className={`rounded-lg shadow-xl p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-100 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <h1 className={`text-4xl font-extrabold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Your Financial Overview
        </h1>

        {/* Stats range buttons - moved to top */}
        <div className="flex justify-end mb-6">
          <button
            className={`px-4 py-1 rounded-l-full ${statsRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatsRange('week')}
          >Weekly</button>
          <button
            className={`px-4 py-1 rounded-r-full ${statsRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatsRange('month')}
          >Monthly</button>
        </div>

        {/* Summary Cards with trends */}
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

        {/* Tabs for Expenses/Incomes */}
        <div className="flex justify-center mb-6" role="tablist" aria-label="Finance Tabs">
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold transition-all duration-200 ${activeTab === 'expenses'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
              }`}
            onClick={() => setActiveTab('expenses')}
            disabled={loading}
            aria-selected={activeTab === 'expenses'}
            aria-controls="expenses-panel"
            role="tab"
            tabIndex={0}
          >
            Expenses
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold transition-all duration-200 ml-2 ${activeTab === 'incomes'
              ? 'bg-green-600 text-white shadow'
              : 'bg-gray-200 text-gray-700 hover:bg-green-100'
              }`}
            onClick={() => setActiveTab('incomes')}
            disabled={loading}
            aria-selected={activeTab === 'incomes'}
            aria-controls="incomes-panel"
            role="tab"
            tabIndex={0}
          >
            Incomes
          </button>
        </div>

        {/* Tab Content */}
        <div className="rounded-b-lg shadow-inner p-6 bg-gray-50">
          {activeTab === 'expenses' ? (
            <div id="expenses-panel" role="tabpanel">
              <h2 className={`text-2xl font-semibold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Expense:</h2>
              <ExpenseForm
                title={expenseForm.title}
                amount={expenseForm.amount}
                description={expenseForm.description}
                date={expenseForm.date}
                category={expenseForm.category}
                loading={loading}
                theme={theme}
                onTitleChange={v => handleExpenseFormChange('title', v)}
                onAmountChange={v => handleExpenseFormChange('amount', v)}
                onDescriptionChange={v => handleExpenseFormChange('description', v)}
                onDateChange={v => handleExpenseFormChange('date', v)}
                onCategoryChange={v => handleExpenseFormChange('category', v)}
                onSubmit={handleExpenseSubmit}
              />
              <h2 className={`text-2xl font-semibold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Expenses:</h2>
              <ExpenseList
                expenses={filteredExpenses}
                loading={loading}
                onDelete={item => handleDelete(item, 'expense')}
                theme={theme}
                search={search}
                onSearchChange={setSearch}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                categories={categories}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={v => setSortBy(v as 'date' | 'amount')}
                onSortOrderChange={v => setSortOrder(v as 'asc' | 'desc')}
                onExportCSV={() => exportCSV('expenses')}
                onExportPDF={() => exportPDF('expenses')}
              />
            </div>
          ) : (
            <div id="incomes-panel" role="tabpanel">
              <h2 className={`text-2xl font-semibold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Income:</h2>
              <IncomeForm
                title={incomeForm.title}
                amount={incomeForm.amount}
                description={incomeForm.description}
                date={incomeForm.date}
                category={incomeForm.category}
                loading={loading}
                theme={theme}
                onTitleChange={v => handleIncomeFormChange('title', v)}
                onAmountChange={v => handleIncomeFormChange('amount', v)}
                onDescriptionChange={v => handleIncomeFormChange('description', v)}
                onDateChange={v => handleIncomeFormChange('date', v)}
                onCategoryChange={v => handleIncomeFormChange('category', v)}
                onSubmit={handleIncomeSubmit}
              />
              <h2 className={`text-2xl font-semibold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Incomes:</h2>
              <IncomeList
                incomes={filteredIncomes}
                loading={loading}
                onDelete={item => handleDelete(item, 'income')}
                theme={theme}
                search={search}
                onSearchChange={setSearch}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                categories={categories}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={v => setSortBy(v as 'date' | 'amount')}
                onSortOrderChange={v => setSortOrder(v as 'asc' | 'desc')}
                onExportCSV={() => exportCSV('incomes')}
                onExportPDF={() => exportPDF('incomes')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pie chart for category breakdown */}
      <div className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-100 mt-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-4 border-b-2 pb-2 ${theme === 'dark' ? 'text-white border-blue-200' : 'text-gray-900 border-blue-200'}`}>
          Category Breakdown
        </h2>
        <div className="flex justify-center items-center" style={{ maxWidth: 540, maxHeight: 540, margin: "0 auto" }}>
          <Pie data={pieChartData} options={pieChartOptions} width={500} height={500} />
        </div>
      </div>

      <div className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-100 mt-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-4 border-b-2 pb-2 ${theme === 'dark' ? 'text-white border-blue-200' : 'text-gray-900 border-blue-200'}`}>
          Financial Statistics (Last 7 Days)
        </h2>
        <FinanceStatistics
          expensesData={expensesData}
          incomesData={incomesData}
          labels={chartLabels}
        />
      </div>

      {/* Undo Snackbar/Toast */}
      {showUndo && deletedItem && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
          <FaUndo className="mr-2" />
          <span>Item deleted.</span>
          <button
            onClick={handleUndo}
            className="ml-4 underline font-bold"
            aria-label="Undo delete"
          >
            Undo
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FinancePage;