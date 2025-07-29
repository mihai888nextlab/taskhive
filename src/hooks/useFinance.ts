import { useState, useCallback, useMemo } from 'react';
import useFinancePageLogic from '@/components/finance/useFinancePageLogic';
import { useTheme } from '@/components/ThemeContext';
import { useTranslations } from "next-intl";

export function useFinance() {
  const { theme } = useTheme();
  const t = useTranslations('FinancePage');
  const logic = useFinancePageLogic();

  
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedIncome, setSelectedIncome] = useState(null);

  
  const handleExportPDF = useCallback(() => {
    if (logic.activeTab === 'expenses') {
      logic.expenseListProps.onExportPDF();
    } else {
      logic.incomeListProps.onExportPDF();
    }
  }, [logic]);

  const handleExportCSV = useCallback(() => {
    if (logic.activeTab === 'expenses') {
      logic.expenseListProps.onExportCSV();
    } else {
      logic.incomeListProps.onExportCSV();
    }
  }, [logic]);

  
  const [search, setSearch] = useState('');
  const filteredExpenses = useMemo(() => {
    if (!search.trim()) return logic.expenseListProps.expenses || [];
    return (logic.expenseListProps.expenses || []).filter(e =>
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, logic.expenseListProps.expenses]);

  const filteredIncomes = useMemo(() => {
    if (!search.trim()) return logic.incomeListProps.incomes || [];
    return (logic.incomeListProps.incomes || []).filter(i =>
      i.description?.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, logic.incomeListProps.incomes]);

  
  const handleAddExpense = useCallback((expense: any) => {
    if (logic.expenseFormProps.onSubmit) {
      logic.expenseFormProps.onSubmit(expense);
    }
    setExpenseModalOpen(false);
  }, [logic]);

  const handleAddIncome = useCallback((income: any) => {
    if (logic.incomeFormProps.onSubmit) {
      logic.incomeFormProps.onSubmit(income);
    }
    setIncomeModalOpen(false);
  }, [logic]);

  
  const showUndo = logic.showUndo;
  const handleUndo = logic.handleUndo;
  const deletedItem = logic.deletedItem;

  return {
    theme,
    t,
    logic,
    expenseModalOpen,
    setExpenseModalOpen,
    incomeModalOpen,
    setIncomeModalOpen,
    selectedExpense,
    setSelectedExpense,
    selectedIncome,
    setSelectedIncome,
    handleExportPDF,
    handleExportCSV,
    search,
    setSearch,
    filteredExpenses,
    filteredIncomes,
    handleAddExpense,
    handleAddIncome,
    showUndo,
    handleUndo,
    deletedItem,
  };
}
