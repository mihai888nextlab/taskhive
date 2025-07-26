import React from "react";
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaUsers, FaUserPlus, FaPlus, FaSitemap } from "react-icons/fa";

interface UsersHeaderProps {
  theme: string;
  t: (key: string) => string;
  user: any;
  onExportClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onAddUser: () => void;
  onAddRole: () => void;
  onOrgChart: () => void;
}

const UsersHeader: React.FC<UsersHeaderProps> = ({
  theme, t, user, onExportClick, onExportPDF, onExportCSV, onAddUser, onAddRole, onOrgChart
}) => (
  <CardHeader className={`p-6 ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"}`}>
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-blue-600" : "bg-blue-500"}`}>
          <FaUsers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("teamDirectory")}</h2>
          <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{t("teamDirectoryDescription")}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {/* Export Dropdown Button */}
        <div className="relative export-dropdown" tabIndex={0}>
          <Button
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${theme === 'dark' ? 'bg-slate-600 text-white hover:bg-slate-700' : 'bg-slate-500 text-white hover:bg-slate-600'}`}
            title="Export"
            aria-haspopup="true"
            aria-expanded="false"
            tabIndex={0}
            onClick={onExportClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
            <span>{t("export")}</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </Button>
          <div className={`export-dropdown-menu absolute z-20 left-0 mt-2 min-w-[120px] rounded-xl shadow-lg hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <button
              type="button"
              onClick={e => { onExportPDF(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left rounded-t-xl focus:outline-none ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#E53E3E"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">PDF</text></svg>
              PDF
            </button>
            <button
              type="button"
              onClick={e => { onExportCSV(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left rounded-b-xl focus:outline-none ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#38A169"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">CSV</text></svg>
              CSV
            </button>
          </div>
        </div>
        {/* Action Buttons */}
        {user && user.role === "admin" && (
          <>
            <Button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${theme === "dark" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
              onClick={onAddUser}
            >
              <FaUserPlus className="w-4 h-4" />
              <span>{t("addUser")}</span>
            </Button>
            <Button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${theme === "dark" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
              onClick={onAddRole}
            >
              <FaPlus className="w-4 h-4" />
              <span>{t("addRole")}</span>
            </Button>
            <Button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${theme === "dark" ? "bg-slate-600 hover:bg-slate-750 text-white" : "bg-slate-500 hover:bg-slate-600 text-white"}`}
              onClick={onOrgChart}
            >
              <FaSitemap className="w-4 h-4" />
              <span>{t("orgChart")}</span>
            </Button>
          </>
        )}
      </div>
    </div>
  </CardHeader>
);

export default UsersHeader;
