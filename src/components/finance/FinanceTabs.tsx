interface Props {
  activeTab: 'expenses' | 'incomes';
  setActiveTab: (tab: 'expenses' | 'incomes') => void;
  loading: boolean;
}

export default function FinanceTabs({ activeTab, setActiveTab, loading }: Props) {
  return (
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
  );
}