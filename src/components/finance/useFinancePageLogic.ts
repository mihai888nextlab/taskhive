import { useState, useEffect, useRef } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTheme } from '@/components/ThemeContext';

const categories = [
  'General', 'Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Salary', 'Investment', 'Other'
];

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'expense';
  date?: string;
  category?: string;
}

export interface Income {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: 'income';
  date?: string;
  category?: string;
}

export type FinanceItem = Expense | Income;

export default function useFinancePageLogic() {
  const { theme } = useTheme();
  const [companyId, setCompanyId] = useState<string | null>(null);
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

  // Fetch current user and set companyId
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setCompanyId(data.user.companyId);
      }
    };
    fetchCurrentUser();
  }, []);

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
    if (!companyId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/expenses?companyId=${companyId}`);
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
    if (companyId) fetchFinanceData();
    // eslint-disable-next-line
  }, [companyId]);

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
      fetchFinanceData();
    }, 5000);
  };
  const finalizeDelete = async (id: string, type: 'expense' | 'income') => {
    setLoading(true);
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    } finally {
      setLoading(false);
    }
  };
  const handleUndo = () => {
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    setShowUndo(false);
    if (deletedItem) {
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

  // PDF Export (with cool template using jsPDF-AutoTable)
  const exportPDF = (type: 'expenses' | 'incomes') => {
    const items = type === 'expenses' ? filteredExpenses : filteredIncomes;
    const doc = new jsPDF();
    // Header
    doc.setFillColor(17, 24, 39); // dark blue (matches Tailwind 'gray-900')
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);
    // Summary
    const total = items.reduce((sum, i) => sum + Number(i.amount), 0).toFixed(2);
    doc.setFontSize(14);
    doc.text(`Total ${type}: $${total}`, 14, 38);
    // Table
    autoTable(doc, {
      startY: 45,
      head: [["Title", "Amount", "Description", "Date", "Category"]],
      body: items.map((item) => [
        item.title,
        `$${Number(item.amount).toFixed(2)}`,
        item.description,
        item.date ? new Date(item.date).toLocaleDateString() : "",
        item.category || "",
      ]),
      headStyles: {
        fillColor: [17, 24, 39], // dark blue
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 11,
        textColor: 34,
      },
      alternateRowStyles: {
        fillColor: [30, 41, 59], // slightly lighter dark blue
        textColor: 255,
      },
      margin: { left: 14, right: 14 },
      styles: {
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
      },
      didDrawPage: (_data: any) => {
        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${(doc as any).internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, 200, 290, { align: 'right' });
      },
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

  const expensesData = statsRange === 'week' ? expensesDataWeek : expensesDataMonth;
  const incomesData = statsRange === 'week' ? incomesDataWeek : incomesDataMonth;

  const totalExpenses = expensesData.reduce((total, amount) => total + amount, 0);
  const totalIncomes = incomesData.reduce((total, amount) => total + amount, 0);
  const profit = totalIncomes - totalExpenses;
  const expenseTrend = expensesData[expensesData.length - 1] - (expensesData[expensesData.length - 2] || 0);
  const incomeTrend = incomesData[incomesData.length - 1] - (incomesData[expensesData.length - 2] || 0);
  const profitTrend = incomeTrend - expenseTrend;

  const weekLabels = ['Today', 'Yesterday', '2 Days Ago', '3 Days Ago', '4 Days Ago', '5 Days Ago', '6 Days Ago'];
  const monthLabels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString();
  });
  const chartLabels = statsRange === 'week' ? weekLabels : monthLabels;

  // Props for forms and lists
  const expenseFormProps = {
    title: expenseForm.title,
    amount: expenseForm.amount,
    description: expenseForm.description,
    date: expenseForm.date,
    category: expenseForm.category,
    loading,
    theme,
    onTitleChange: (v: string) => handleExpenseFormChange('title', v),
    onAmountChange: (v: string) => handleExpenseFormChange('amount', v),
    onDescriptionChange: (v: string) => handleExpenseFormChange('description', v),
    onDateChange: (v: Date | null) => handleExpenseFormChange('date', v ?? new Date()),
    onCategoryChange: (v: string) => handleExpenseFormChange('category', v),
    onSubmit: handleExpenseSubmit,
  };

  const incomeFormProps = {
    title: incomeForm.title,
    amount: incomeForm.amount,
    description: incomeForm.description,
    date: incomeForm.date,
    category: incomeForm.category,
    loading,
    theme,
    onTitleChange: (v: string) => handleIncomeFormChange('title', v),
    onAmountChange: (v: string) => handleIncomeFormChange('amount', v),
    onDescriptionChange: (v: string) => handleIncomeFormChange('description', v),
    onDateChange: (v: Date) => handleIncomeFormChange('date', v),
    onCategoryChange: (v: string) => handleIncomeFormChange('category', v),
    onSubmit: handleIncomeSubmit,
  };

  const expenseListProps = {
    expenses: filteredExpenses,
    loading,
    onDelete: (item: Expense) => handleDelete(item, 'expense'),
    theme,
    search,
    onSearchChange: setSearch,
    categoryFilter,
    onCategoryFilterChange: setCategoryFilter,
    dateRange,
    onDateRangeChange: setDateRange,
    categories,
    sortBy,
    sortOrder,
    onSortByChange: (v: string) => setSortBy(v as 'date' | 'amount'),
    onSortOrderChange: (v: string) => setSortOrder(v as 'asc' | 'desc'),
    onExportCSV: () => exportCSV('expenses'),
    onExportPDF: () => exportPDF('expenses'),
  };

  const incomeListProps = {
    incomes: filteredIncomes,
    loading,
    onDelete: (item: Income) => handleDelete(item, 'income'),
    theme,
    search,
    onSearchChange: setSearch,
    categoryFilter,
    onCategoryFilterChange: setCategoryFilter,
    dateRange,
    onDateRangeChange: setDateRange,
    categories,
    sortBy,
    sortOrder,
    onSortByChange: (v: string) => setSortBy(v as 'date' | 'amount'),
    onSortOrderChange: (v: string) => setSortOrder(v as 'asc' | 'desc'),
    onExportCSV: () => exportCSV('incomes'),
    onExportPDF: () => exportPDF('incomes'),
  };

  return {
    statsRange, setStatsRange,
    totalExpenses, totalIncomes, profit, expenseTrend, incomeTrend, profitTrend,
    activeTab, setActiveTab, loading,
    expenseFormProps, incomeFormProps,
    expenseListProps, incomeListProps,
    pieChartData, pieChartOptions,
    expensesData, incomesData, chartLabels,
    showUndo, handleUndo, deletedItem
  }
}