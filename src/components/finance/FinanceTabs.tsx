import { useTheme } from '@/components/ThemeContext';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

interface Props {
  activeTab: 'expenses' | 'incomes';
  setActiveTab: (tab: 'expenses' | 'incomes') => void;
  loading: boolean;
}

export default function FinanceTabs({ activeTab, setActiveTab, loading }: Props) {
  const { theme } = useTheme();

  return (
    <div className={`flex rounded-xl p-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        onClick={() => setActiveTab('expenses')}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
          activeTab === 'expenses'
            ? theme === 'dark'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-red-500 text-white shadow-lg'
            : theme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <FaArrowDown className="w-4 h-4" />
        <span>Expenses</span>
      </button>
      <button
        onClick={() => setActiveTab('incomes')}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
          activeTab === 'incomes'
            ? theme === 'dark'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-green-500 text-white shadow-lg'
            : theme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <FaArrowUp className="w-4 h-4" />
        <span>Income</span>
      </button>
    </div>
  );
}