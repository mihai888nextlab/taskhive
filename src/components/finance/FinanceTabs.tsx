import React from 'react';
import { useTheme } from '@/components/ThemeContext';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface Props {
  activeTab: 'expenses' | 'incomes';
  setActiveTab: (tab: 'expenses' | 'incomes') => void;
  loading: boolean;
}

const FinanceTabs = React.memo(function FinanceTabs({ activeTab, setActiveTab, loading }: Props) {
  const { theme } = useTheme();
  const t = useTranslations('FinancePage');

  return (
    <div
      className={`flex rounded-xl p-1 gap-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} w-full`}
    >
      <button
        type="button"
        onClick={() => setActiveTab('expenses')}
        disabled={loading}
        className={`flex items-center gap-2 px-8 py-3 rounded-l-lg font-semibold transition-all duration-200 w-1/2 justify-center
          ${activeTab === 'expenses'
            ? theme === 'dark'
              ? 'bg-red-600 text-white'
              : 'bg-red-500 text-white'
            : theme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-red-700'
              : 'text-gray-600 hover:text-white hover:bg-red-500'
          }`}
        style={{ minWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
      >
        <FaArrowDown className="w-4 h-4" />
        <span>{t('expenses')}</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('incomes')}
        disabled={loading}
        className={`flex items-center gap-2 px-8 py-3 rounded-r-lg font-semibold transition-all duration-200 w-1/2 justify-center
          ${activeTab === 'incomes'
            ? theme === 'dark'
              ? 'bg-green-600 text-white'
              : 'bg-green-500 text-white'
            : theme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-green-700'
              : 'text-gray-600 hover:text-white hover:bg-green-500'
          }`}
        style={{ minWidth: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      >
        <FaArrowUp className="w-4 h-4" />
        <span>{t('income')}</span>
      </button>
    </div>
  );
});

export default React.memo(FinanceTabs);