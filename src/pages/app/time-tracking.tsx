import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/sidebar/DashboardLayout';
import { NextPageWithLayout } from "@/types";
import Loading from "@/components/Loading";
import TimerAndFormPanel from '@/components/time-tracking/TimerAndFormPanel';
import SessionList from '@/components/time-tracking/SessionList';
import TimeTrackingHeader from '@/components/time-tracking/TimeTrackingHeader';
import { FaClock, FaChartLine, FaPlus, FaDownload, FaFilePdf } from 'react-icons/fa';
import { saveAs } from "file-saver";
import { useTimeTracking } from '@/components/time-tracking/TimeTrackingContext';
import { useTheme } from '@/components/ThemeContext';
import { useTranslations } from "next-intl";
import AddManualSessionModal from '@/components/time-tracking/AddManualSessionModal';
import { Button } from '@/components/ui/button';

const TimeTrackingPage: NextPageWithLayout = React.memo(() => {
  const { theme } = useTheme();
  const { 
    sessionName, setSessionName, 
    sessionDescription, setSessionDescription, 
    sessionTag, setSessionTag, 
    elapsedTime, isRunning, 
    pomodoroMode, setPomodoroMode,
    pomodoroPhase, pomodoroTime, pomodoroCycles, pomodoroRunning, 
    WORK_DURATION, BREAK_DURATION, 
    startTimer, stopTimer, resetTimer, resetAll, saveSession, user 
  } = useTimeTracking();
  const t = useTranslations("TimeTrackingPage");
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionTagFilter, setSessionTagFilter] = useState("all");
  const [sessionSort, setSessionSort] = useState("dateDesc");
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await fetch('/api/time-sessions?userId=' + user._id);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.reverse());
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) fetchSessions();
  }, [user, fetchSessions]);

  // Memoize streak calculation
  const streak = useMemo(() => {
    const days = new Set(
      sessions.map(s => new Date(s.createdAt).toDateString())
    );
    let streak = 0;
    let d = new Date();
    while (days.has(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [sessions]);

  // Memoize handleExportCSV
  const handleExportCSV = useCallback(() => {
    if (!sessions.length) return;
    const rows = [
      ["Name", "Description", "Tag", "Duration (h)", "Date"],
      ...sessions.map(s => [
        s.name,
        s.description,
        s.tag || "General",
        (s.duration / 3600).toFixed(2),
        new Date(s.createdAt).toLocaleString(),
      ])
    ];
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "time_sessions.csv");
  }, [sessions]);

  // Memoize handleDeleteSession
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (!user?._id) return;
    await fetch(`/api/time-sessions?id=${sessionId}&userId=${user._id}`, { method: 'DELETE' });
    fetchSessions();
  }, [user, fetchSessions]);

  // Memoize handleSaveSession
  const handleSaveSession = useCallback(async () => {
    await saveSession();
    fetchSessions();
  }, [saveSession, fetchSessions]);

  // Memoize userId
  const userId = useMemo(
    () =>
      user?._id ||
      (typeof window !== "undefined" && localStorage.getItem("userId")) ||
      undefined,
    [user]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Main Content */}
      <div className="px-2 lg:px-4 py-4 mt-3">
        <div className="max-w-[100vw] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            
            {/* Timer Column */}
            <div className="lg:col-span-1">
              <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}>
                {/* Timer Header */}
                <div className={`px-4 py-3 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-gray-200"
                } border-b flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                    }`}>
                      <FaClock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {t("timeTracker")}
                      </h2>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        {t("trackWorkSessions")}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                    onClick={() => setManualModalOpen(true)}
                    title={t("logNewSession", { default: "Log New Session" })}
                  >
                    <FaPlus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Timer Content */}
                <div className="p-4">
                  <TimerAndFormPanel
                    elapsedTime={elapsedTime}
                    isRunning={pomodoroMode ? pomodoroRunning : isRunning}
                    onStart={startTimer}
                    onStop={stopTimer}
                    onReset={resetTimer}
                    theme={theme}
                    sessionName={sessionName}
                    sessionDescription={sessionDescription}
                    sessionTag={sessionTag}
                    setSessionTag={setSessionTag}
                    onNameChange={setSessionName}
                    onDescriptionChange={setSessionDescription}
                    onSave={handleSaveSession}
                    pomodoroMode={pomodoroMode}
                    pomodoroPhase={pomodoroPhase}
                    pomodoroTime={pomodoroTime}
                    pomodoroCycles={pomodoroCycles}
                    workDuration={WORK_DURATION}
                    breakDuration={BREAK_DURATION}
                    sessions={sessions}
                    onExportCSV={handleExportCSV}
                  />
                </div>

                {/* Timer Footer */}
                <div className={`px-4 py-3 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                } border-t`}>
                  <TimeTrackingHeader
                    theme={theme}
                    streak={streak}
                    pomodoroMode={pomodoroMode}
                    onExport={handleExportCSV}
                    onPomodoroToggle={() => {
                      setPomodoroMode(!pomodoroMode);
                      resetTimer();
                      resetAll();
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sessions List Column */}
            <div className="lg:col-span-2">
              <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} h-full max-h-[900px] flex flex-col overflow-hidden mx-2`}>
                {/* Sessions Header */}
                <div className={`flex-shrink-0 px-4 py-3 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-green-50 border-gray-200"
                } border-b flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
                    }`}>
                      <FaChartLine className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {t("timeSessions")}
                      </h2>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        {t("viewManageSessions")}
                      </p>
                    </div>
                  </div>
                  {/* Export Dropdown Button */}
                  {sessions && sessions.length > 0 && (
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
                        {/* Export Icon */}
                        <FaDownload className="w-4 h-4" />
                        <span>{t("export", { default: "Export" })}</span>
                        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className="export-dropdown-menu absolute z-20 left-0 mt-2 min-w-[110px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hidden">
                        <button
                          type="button"
                          onClick={e => { handleExportCSV(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl focus:outline-none text-sm"
                          disabled={loading}
                        >
                          <FaDownload className="w-4 h-4" />
                          CSV
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            // PDF Export Handler for time sessions (consistent with CSV export, no assigned/creator info)
                            const doc = new (require('jspdf').default)({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                            const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
                            doc.setFillColor(17, 24, 39);
                            doc.rect(0, 0, 210, 30, 'F');
                            doc.setTextColor(255, 255, 255);
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(22);
                            doc.text("Time Sessions Report", 14, 20);
                            doc.setFontSize(12);
                            doc.setTextColor(34, 34, 34);
                            const columns = [
                              { header: "Name", dataKey: "name" },
                              { header: "Description", dataKey: "description" },
                              { header: "Tag", dataKey: "tag" },
                              { header: "Duration (h)", dataKey: "duration" },
                              { header: "Date", dataKey: "createdAt" },
                            ];
                            const rows = sessions.map(s => ({
                              name: s.name,
                              description: s.description,
                              tag: s.tag || "General",
                              duration: (s.duration / 3600).toFixed(2),
                              createdAt: s.createdAt ? new Date(s.createdAt).toLocaleString() : "",
                            }));
                            autoTable(doc, {
                              startY: 38,
                              columns,
                              body: rows,
                              headStyles: {
                                fillColor: [17, 24, 39],
                                textColor: 255,
                                fontStyle: 'bold',
                                fontSize: 11,
                                halign: 'center',
                                valign: 'middle',
                                cellPadding: 2.5,
                                lineWidth: 0.1,
                              },
                              bodyStyles: {
                                fontSize: 10,
                                textColor: 34,
                                cellPadding: 2,
                                halign: 'left',
                                valign: 'top',
                                lineColor: [220, 220, 220],
                                minCellHeight: 7,
                                overflow: 'linebreak',
                                font: 'helvetica',
                              },
                              alternateRowStyles: {
                                fillColor: [241, 245, 249],
                                textColor: 34,
                              },
                              columnStyles: {
                                name: { cellWidth: 32, halign: 'left' },
                                description: { cellWidth: 70, halign: 'left' },
                                tag: { cellWidth: 22, halign: 'center' },
                                duration: { cellWidth: 24, halign: 'center' },
                                createdAt: { cellWidth: 38, halign: 'center' },
                              },
                              margin: { left: (210 - (32 + 70 + 22 + 24 + 38)) / 2, right: (210 - (32 + 70 + 22 + 24 + 38)) / 2 },
                              styles: {
                                font: 'helvetica',
                                fontSize: 10,
                                cellPadding: 2,
                                overflow: 'linebreak',
                                halign: 'left',
                                valign: 'top',
                                minCellHeight: 7,
                                textColor: 34,
                              },
                              didDrawPage: (data: any) => {
                                const pageCount = doc.getNumberOfPages();
                                const pageNumber = doc.getCurrentPageInfo().pageNumber;
                                doc.setFontSize(9);
                                doc.setTextColor(150);
                                doc.text(`Page ${pageNumber} of ${pageCount}`,
                                  200, 290, { align: 'right' });
                              },
                              didParseCell: function (data: any) {
                                if (data.column.dataKey === 'description') {
                                  data.cell.styles.valign = 'top';
                                  data.cell.styles.fontStyle = 'normal';
                                }
                              },
                            });
                            doc.save("time_sessions.pdf");
                            (e.currentTarget.parentElement as HTMLElement).classList.add('hidden');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl focus:outline-none text-sm"
                          disabled={loading}
                        >
                          <FaFilePdf className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sessions List */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <SessionList
                    sessions={sessions}
                    onDelete={handleDeleteSession}
                    theme={theme}
                    sessionSearch={sessionSearch}
                    setSessionSearch={setSessionSearch}
                    sessionTagFilter={sessionTagFilter}
                    setSessionTagFilter={setSessionTagFilter}
                    sessionSort={sessionSort}
                    setSessionSort={setSessionSort}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Manual Add Modal */}
      {manualModalOpen && userId && (
        <AddManualSessionModal
          open={manualModalOpen}
          onClose={() => setManualModalOpen(false)}
          userId={userId}
          onAdded={fetchSessions}
        />
      )}
    </div>
  );
});

TimeTrackingPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default React.memo(TimeTrackingPage);