import React from 'react';
import { FaDownload, FaFilePdf } from 'react-icons/fa';

interface ExportDropdownProps {
  loading: boolean;
  onExportCSV: () => void;
  onExportPDF: () => void;
  theme: string;
  t: (key: string, opts?: any) => string;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ loading, onExportCSV, onExportPDF, theme, t }) => (
  <div className="relative export-dropdown" tabIndex={0}>
    <button
      type="button"
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
        theme === 'dark'
          ? 'bg-slate-600 text-white hover:bg-slate-700'
          : 'bg-slate-500 text-white hover:bg-slate-600'
      }`}
      title={t("export", { default: "Export" })}
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
      <FaDownload className="w-4 h-4" />
      <span>{t("export", { default: "Export" })}</span>
      <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </button>
    <div className="export-dropdown-menu absolute z-20 left-0 mt-2 min-w-[110px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hidden">
      <button
        type="button"
        onClick={e => { onExportCSV(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl focus:outline-none text-sm"
        disabled={loading}
      >
        <FaDownload className="w-4 h-4" />
        CSV
      </button>
      <button
        type="button"
        onClick={e => { onExportPDF(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl focus:outline-none text-sm"
        disabled={loading}
      >
        <FaFilePdf className="w-4 h-4" />
        PDF
      </button>
    </div>
  </div>
);

export default ExportDropdown;
