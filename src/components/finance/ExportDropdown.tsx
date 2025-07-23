import React from 'react';

interface ExportDropdownProps {
  loading: boolean;
  onExportPDF: () => void;
  onExportCSV: () => void;
  theme: string;
  t: (key: string) => string;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ loading, onExportPDF, onExportCSV, theme, t }) => (
  <div className="relative export-dropdown" tabIndex={0}>
    <button
      type="button"
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
        loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : theme === 'dark'
            ? 'bg-slate-600 text-white hover:bg-slate-700'
            : 'bg-slate-500 text-white hover:bg-slate-600'
      }`}
      title={t("export")}
      aria-haspopup="true"
      aria-expanded="false"
      tabIndex={0}
      onClick={e => {
        const dropdown = (e.currentTarget.parentElement?.querySelector('.export-dropdown-menu') as HTMLElement);
        if (dropdown) {
          dropdown.classList.toggle('hidden');
        }
      }}
    >
      {/* Export Icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
      <span>{t("export")}</span>
      <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </button>
    <div className={`export-dropdown-menu absolute z-20 left-0 mt-2 min-w-[110px] rounded-xl shadow-lg hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <button
        type="button"
        onClick={e => { onExportPDF(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-t-xl focus:outline-none text-sm ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
        disabled={loading}
      >
        {/* PDF file icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#E53E3E"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">PDF</text></svg>
        PDF
      </button>
      <button
        type="button"
        onClick={e => { onExportCSV(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-b-xl focus:outline-none text-sm ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
        disabled={loading}
      >
        {/* CSV file icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#38A169"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">CSV</text></svg>
        CSV
      </button>
    </div>
  </div>
);

export default ExportDropdown;
