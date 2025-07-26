import React from 'react';
import ExportDropdown from '@/components/time-tracking/ExportDropdown';
import { exportTimeSessionsPDF } from '@/utils/exportTimeSessionsPDF';
import DashboardLayout from '@/components/sidebar/DashboardLayout';
import { NextPageWithLayout } from "@/types";
import TimerAndFormPanel from '@/components/time-tracking/TimerAndFormPanel';
import SessionList from '@/components/time-tracking/SessionList';
import TimeTrackingHeader from '@/components/time-tracking/TimeTrackingHeader';
import { FaClock, FaChartLine, FaPlus, FaDownload, FaFilePdf } from 'react-icons/fa';
import { saveAs } from "file-saver";
import { useTimeTrackingPage } from '@/hooks/useTimeTracking';
import { useTheme } from '@/components/ThemeContext';
import { useTranslations } from "next-intl";
import AddManualSessionModal from '@/components/time-tracking/AddManualSessionModal';
import { Button } from '@/components/ui/button';

const TimeTrackingPage: NextPageWithLayout = React.memo(() => {
  const {
    theme,
    t,
    sessionName, setSessionName,
    sessionDescription, setSessionDescription,
    sessionTag, setSessionTag,
    elapsedTime, isRunning,
    pomodoroMode, setPomodoroMode,
    pomodoroPhase, pomodoroTime, pomodoroCycles, pomodoroRunning,
    WORK_DURATION, BREAK_DURATION,
    startTimer, stopTimer, resetTimer, resetAll, saveSession,
    user,
    sessions, setSessions,
    loading, setLoading,
    sessionSearch, setSessionSearch,
    sessionTagFilter, setSessionTagFilter,
    sessionSort, setSessionSort,
    manualModalOpen, setManualModalOpen,
    fetchSessions,
    streak,
    handleExportCSV,
    handleDeleteSession,
    handleSaveSession,
    userId,
  } = useTimeTrackingPage();

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
                    <ExportDropdown
                      loading={loading}
                      onExportCSV={handleExportCSV}
                      onExportPDF={() => exportTimeSessionsPDF(sessions)}
                      theme={theme}
                      t={t}
                    />
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